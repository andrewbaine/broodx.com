module Tap = {
  @module("tap") @val external ok: bool => unit = "ok"
  @module("tap") @val external equal: ('a, 'a) => unit = "equal"
  @module("tap") @val external same: ('a, 'a) => unit = "same"
}

[
  (
    Segment.make(Point.make(0.0, 0.0), Point.make(2.0, 2.0))->Belt.Option.getExn,
    Segment.make(Point.make(0.0, 4.0), Point.make(0.5, -4.0))->Belt.Option.getExn,
    Intersection.Point(Point.make(0.23529411764705882, 0.23529411764705882)),
  ),
] |> Js.Array.forEach(((s1, s2, expected)) => {
  Tap.same(Intersection.make(s1, s2), expected)
})
