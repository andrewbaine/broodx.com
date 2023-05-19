type t = (float, float)
let make = (x, y) => (x, y)
let polar = (r, theta) => (r *. Js.Math.cos(theta), r *. Js.Math.sin(theta))
let scale = (s, (x, y)) => (s *. x, s *. y)
let midpoint = ((x1, y1), (x2, y2)) => ((x1 +. x2) /. 2., (y1 +. y2) /. 2.)
let subtract = ((x1, y1), (x2, y2)) => (x1 -. x2, y1 -. y2)
let rotate = (~center, (x, y), theta) => {
  let (cx, cy) = center
  let cos = cos(theta)
  let sin = sin(theta)
  let x = x -. cx
  let y = y -. cy
  (x *. cos -. y *. sin +. cx, x *. sin +. y *. cos +. cy)
}

let interpolate = (~start, ~end, t) => {
  let (startX, startY) = start
  let (endX, endY) = end
  (startX +. t *. (endX -. startX), startY +. t *. (endY -. startY))
}

let ccw = (~tolerance=0.0, (ax, ay), (bx, by), (cx, cy)) => {
  (cy -. ay) *. (bx -. ax) -. (by -. ay) *. (cx -. ax) > tolerance
}

let collinear = (~tolerance=0.0, (x1, y1), (x2, y2), (x3, y3)) => {
  // three points are collinear
  // iff the area of the triangle they define
  // is zero
  let areaDoubled = abs_float(x1 *. (y2 -. y3) +. x2 *. (y3 -. y1) +. x3 *. y1 -. y2)
  areaDoubled <= tolerance
}

let distance = ((x1, y1), (x2, y2)) => {
  sqrt(Js.Math.pow_float(~base=x2 -. x1, ~exp=2.) +. Js.Math.pow_float(~base=y2 -. y1, ~exp=2.))
}

let close = (~tolerance=0.0, p1, p2) => {
  distance(p1, p2) <= tolerance
}

let determinant = ((x1, y1), (x2, y2)) => x1 *. y2 -. x2 *. y1
