type t = (float, float, float, float)

let make = (p1, p2) => {
  let (x1, y1) = p1
  let (x2, y2) = p2
  if x1 == x2 && y1 == y2 {
    None
  } else {
    Some(x1, y1, x2, y2)
  }
}
