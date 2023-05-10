module Rectangle = {
  type t
  @get external height: t => float = "height"
  @get external width: t => float = "width"
}

module View = {
  type t
  @get external bounds: t => Rectangle.t = "bounds"
}

@module("paper") @val external view: View.t = "view"

module Matrix = {
  type t
  @module("paper") @new external make: (float, float, float, float, float, float) => t = "Matrix"
  @send external scale: (t, float) => t = "scale"
}

@module("paper") external install: Window.t => unit = "install"

@module("paper") external setup: string => unit = "setup"

module Point = {
  type t

  @module("paper") @new external make: (float, float) => t = "Point"

  @get external x: t => float = "x"
  @get external y: t => float = "y"
  @set external setX: (t, float) => unit = "x"
  @set external setY: (t, float) => unit = "y"

  @send external add: (t, t) => t = "add"
  @send external subtract: (t, t) => t = "subtract"
  @send external multiply: (t, float) => t = "multiply"
  @send external addFloat: (t, float) => t = "add"
}

module Color = {
  type t
  @module("paper") @new external ofString: string => t = "Color"
  @module("paper") @new external gray: float => t = "Color"
}

module Segment = {
  type t
  @get external point: t => Point.t = "point"
}

module Path = {
  module Make = (
    R: {
      type t
    },
  ) => {}

  module Options = {
    type t
    @obj
    external make: (
      ~segments: array<Point.t>=?,
      ~fillColor: Color.t=?,
      ~strokeColor: Color.t=?,
      ~closed: bool=?,
      unit,
    ) => t = ""
  }

  type t
  @module("paper") @new external make: Options.t => t = "Path"
  @send external clone: t => t = "clone"
  @send external translate: (t, Point.t) => unit = "translate"
  @send external transform: (t, Matrix.t) => unit = "transform"

  @get external segments: t => array<Segment.t> = "segments"

  module Rectangle = {
    @module("paper") @scope("Path") @new
    external make: (~from: Point.t, ~to_: Point.t) => t = "Rectangle"
  }
}
