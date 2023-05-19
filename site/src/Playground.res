exception NotPossible

let t = Js.Math._PI /. 12.
let halfPi = Js.Math._PI /. 2.
let h0 = 0.4
let h1 = 0.6

let sketch = (~up, ~down, p) => {
  open P5
  let (light, dark) = (up, down)

  let polygon = points => {
    if points->Js.Array.length > 2 {
      p->fill(
        if (
          Point.ccw(
            points->Belt.Array.getExn(0),
            points->Belt.Array.getExn(1),
            points->Belt.Array.getExn(2),
          )
        ) {
          dark
        } else {
          light
        },
      )
      p->beginShape
      points->Js.Array2.forEach(((x, y)) => p->vertex(x, y))
      p->endShape(EndShapeOptions.close(p))
    }
  }

  let gray = p->gray(200, 255)
  let h = 600

  let a = Point.make(0., 0.)
  let b = Point.make(1., 0.)
  let c = Point.make(1., 1.)
  let dd = Point.make(0., 1.)

  let center = Point.midpoint(Point.midpoint(a, c), Point.midpoint(b, dd))

  let topCenter = Point.midpoint(a, b)
  let bottomCenter = Point.midpoint(c, dd)
  let leftCenter = Point.midpoint(a, dd)
  let rightCenter = Point.midpoint(b, c)

  Js.log2("center", center)

  let pA = Point.scale(0.5, Point.make(1., tan(t)))
  let pB = Point.rotate(pA, ~center, halfPi)
  let pC = Point.rotate(pA, ~center, Js.Math._PI)
  let pD = Point.rotate(pA, ~center, 3. *. Js.Math._PI /. 2.)

  let qA = Point.polar(0.5 /. sin(2. *. t +. Js.Math._PI /. 4.), Js.Math._PI /. 4.)
  let qC = Point.rotate(qA, ~center, Js.Math._PI)

  let l1 = Segment.make(pD, dd)->Belt.Option.getExn
  let l2 = Segment.make(pC, dd)->Belt.Option.getExn

  let s1 = Point.interpolate(~start=dd, ~end=Point.make(0., 0.75), h0)
  let s2 = Point.rotate(s1, ~center=dd, halfPi)
  let crease0 = Segment.make(s1, s2)
  let (s3, s4) = switch crease0 {
  | Some(crease0) => {
      let s3 = switch Intersection.make(crease0, l1) {
      | Point(p) => p
      | _ => raise(NotPossible)
      }
      let s4 = switch Intersection.make(crease0, l2) {
      | Point(p) => p
      | _ => raise(NotPossible)
      }
      (s3, s4)
    }
  | None => (dd, dd)
  }

  let s5 = Point.interpolate(
    ~start=Point.scale(2.0, s1)->Point.subtract(dd),
    ~end=Point.make(0., 0.5),
    h1,
  )
  let s6 = Point.rotate(s5, ~center=dd, halfPi)
  let crease1 = Segment.make(s5, s6)
  let (s7, s8) = switch crease1 {
  | None => (dd, dd)
  | Some(crease1) => {
      let s3 = switch Intersection.make(crease1, l1) {
      | Point(p) => p
      | _ => raise(NotPossible)
      }
      let s4 = switch Intersection.make(crease1, l2) {
      | Point(p) => p
      | _ => raise(NotPossible)
      }
      (s3, s4)
    }
  }
  Js.log(s5)

  let triangle = (p1, p2, p3) => {
    let (a, b) = p1
    let (c, d) = p2
    let (e, f) = p3
    p->fill(
      if Point.ccw(p1, p2, p3) {
        dark
      } else {
        light
      },
    )

    p->triangle(a, b, c, d, e, f)
  }

  p->setup(() => {
    p->createCanvas(h, h, p->P5.webgl)
    p->background(gray)
    p->scale(float(h) /. 2.)
    p->translate(-0.5, -0.5, 0.0)
    triangle(a, pA, topCenter)
    triangle(a, leftCenter, pD)
    triangle(b, topCenter, pA)
    triangle(b, pB, rightCenter)
    triangle(c, rightCenter, pB)
    triangle(c, pC, bottomCenter)

    //    triangle(d, bottomCenter, pC)
    //    triangle(d, pD, leftCenter)
    triangle(s1, dd, s3)
    triangle(s2, s4, dd)
    triangle(s3, dd, s4)
    polygon([s5, s1, s3, s7])
    polygon([s6, s8, s4, s2])
    polygon([s3, s4, s8, s7])

    polygon([leftCenter, s5, s7, pD])
    polygon([bottomCenter, pC, s8, s6])
    polygon([s7, s8, pC, qC, qA, pD])

    triangle(a, qA, pA)
    triangle(a, pD, qA)
    triangle(c, pB, qC)
    triangle(c, qC, pC)

    polygon([center, pA, b, pB])
  })
  //  p->draw(() => {})
}
