# Configure the AWS provider
provider "aws" {
  region = "us-east-1"
}

variable "domain_name" {
}

# Create an S3 bucket for the website
resource "aws_s3_bucket" "website" {
  bucket = var.domain_name
}

resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "error.html"
  }
}

# Create an origin access identity for CloudFront
resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
  comment = "Access identity for ${var.domain_name} S3 bucket"
}


# Attach a bucket policy to allow CloudFront to access the S3 bucket
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = {
          AWS = "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${aws_cloudfront_origin_access_identity.origin_access_identity.id}"
        }
        Action    = "s3:GetObject"
	Resource = "arn:aws:s3:::${var.domain_name}/*"
      }
    ]
  })
}

# Create a CloudFront distribution
resource "aws_cloudfront_distribution" "website" {
  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = "${var.domain_name}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.origin_access_identity.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    target_origin_id = aws_s3_bucket.website.id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = var.domain_name
  aliases             = ["${var.domain_name}", "www.${var.domain_name}"]
  default_root_object = "index.html"
  price_class         = "PriceClass_All"
  viewer_certificate {
    acm_certificate_arn = module.acm.acm_certificate_arn
    ssl_support_method  = "sni-only"
  }

#  depends_on = [
#    aws_s3_bucket_policy.website,
#  ]
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# Create a Route53 Hosted Zone
resource "aws_route53_zone" "zone" {
  name = "${var.domain_name}."
}

# Create an A record for root
resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.zone.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# Create an A record for www
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.zone.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

module "acm" {
  source  = "terraform-aws-modules/acm/aws"

  domain_name  = "${var.domain_name}"
  zone_id = aws_route53_zone.zone.zone_id

  subject_alternative_names = [
    "*.${var.domain_name}"
  ]

  wait_for_validation = true
  tags = {
    Name = "${var.domain_name}"
  }
}
