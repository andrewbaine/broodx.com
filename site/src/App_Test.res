let p = Point.make

Tap.ok(Point.collinear(p(0.0, 0.0), p(2.0, 2.0), p(1.0, 1.0)))

[
  (
    Segment.make(Point.make(0.0, 0.0), Point.make(2.0, 2.0))->Belt.Option.getExn,
    Segment.make(Point.make(0.0, 4.0), Point.make(0.5, -4.0))->Belt.Option.getExn,
    Intersection.Point(Point.make(0.23529411764705882, 0.23529411764705882)),
  ),
] |> Js.Array.forEach(((s1, s2, expected)) => {
  Tap.same(Intersection.make(s1, s2), expected)
})

let polygon =
  [
    (0, 0),
    (2, 0),
    (3, 3),
    (4, 0),
    (9, 0),
    (9, 3),
    (10, 3),
    (10, 0),
    (13, 0),
    (13, 3),
    (14, 3),
    (14, 6),
    (6, 6),
    (6, 2),
    (7, 2),
    (7, 5),
    (12, 5),
    (12, 1),
    (11, 1),
    (11, 4),
    (8, 4),
    (8, 1),
    (5, 1),
    (5, 3),
    (4, 3),
    (4, 6),
    (3, 6),
    (2, 3),
    (1, 6),
    (0, 6),
  ] |> Js.Array.map(((x, y)) => Point.make(float(x), float(y)))
