type t =
  | None
  | Point(Point.t)
  | InfinitelyManySolutions

let rec linearEquation = ((x1, y1, x2, y2)) => {
  if x2 == x1 {
    let (a, b, c) = linearEquation((y1, x1, y2, x2))
    (b, a, c)
  } else {
    let a = (y2 -. y1) /. (x2 -. x1)
    let c = 0.5 *. (y1 -. a *. x1 +. y2 -. a *. x2)
    (a, -1., c)
  }
}

let make = (s1: Segment.t, s2: Segment.t) => {
  let (a1, b1, c1) = linearEquation(s1)
  let (a2, b2, c2) = linearEquation(s2)
  let d = a1 *. b2 -. a2 *. b1
  let dx = b1 *. c2 -. b2 *. c1
  let dy = c1 *. a2 -. c2 *. a1
  if d == 0. {
    if dx == 0. || dy == 0. {
      InfinitelyManySolutions
    } else {
      None
    }
  } else {
    Point(Point.make(dx /. d, dy /. d))
  }
}
