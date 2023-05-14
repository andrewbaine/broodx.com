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
