
exception NotPossible

module Window = {
  type t
  @val external window: t = "window"
  @set external onload: (t, unit => unit) => unit = "onload"
}

module Paper = {

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
    module Make = (R: { type t}) => {

    }
    
    module Options = {
      type t
      @obj external make: (~segments: array<Point.t>=?, ~fillColor: Color.t=?, ~strokeColor: Color.t=?, ~closed: bool=?, unit) => t = ""
    }

    type t
    @module("paper") @new external make: Options.t => t = "Path"
    @send external clone: t => t = "clone"
    @send external translate: (t, Point.t) => unit = "translate"
    @send external transform: (t, Matrix.t) => unit = "transform"

    @get external segments: t => array<Segment.t> = "segments"

    module Rectangle = {
      @module("paper") @scope("Path") @new external make: (~from: Point.t, ~to_: Point.t) => t = "Rectangle"
    }
  }
}

let slope = {
  open Paper.Point
  (b, a) => (y(b) -. y(a)) /. (x(b) -. x(a))
}

let midpoint = (~factor=0.5, a, b) => 
  a->Paper.Point.add(b->Paper.Point.subtract(a)->Paper.Point.multiply(factor))

let rec divide = (p1, p2) => {
  open Paper
  open Point
  let (p1, p2) = if x(p1) < x(p2) { (p1, p2) } else { (p2, p1) }
  let x1 = x(p1)
  let y1 = y(p1)
  let x2 = x(p2)
  let y2 = y(p2)
  let bounds = View.bounds(view)
  let width = Rectangle.width(bounds)
  let height = Rectangle.height(bounds)
  let (p1, p2) = if x2 < x1 { (p2, p1) } else { (p1, p2) }
    if x1 == x2 {
      Path.Rectangle.make(~from=make(0., 0.), ~to_=make(x1, height))
    } else if y2 == y1 {
      Path.Rectangle.make(~from=make(0., 0.), ~to_=make(width, y1))
    } else {
      let m = slope(p2, p1)
      let b = ((y2 -. m *. x2) +. (y1 -. m *. x1)) /. 2.
      let yy = m *. width +. b
      let xIntercept = 0. -. b /. m
      let heightIntercept = (height -. b) /. m
      let segments = 
      if b < 0. {
        if yy < 0. {
          Js.Exn.raiseError("impossible")
        } else if yy < height {
          [
            make            (xIntercept, 0.),
make            (width, 0.),
make            (width, yy)

          ]
        } else {
          [
make            (0., 0.),
make            (xIntercept, 0.),
make            (heightIntercept, height),
make            (0., height),
          ]
        }
      } else if b < height {
        if yy < 0. {
          [
make            (0., 0.),
make            (0., b),
make            (xIntercept, 0.),
          ]
        } else if yy < height {
          [
make            (0., b),
make            (0., 0.),
make            (width, 0.),
make            (width, yy),
          ]
        } else {
// triangle including (0., h)
          [
make            (0., height),
make            (0., b),
make            (heightIntercept, height),
          ]
        }
      } else {
        // b > height
        if yy < 0. { [
make            (0., 0.),
make            (xIntercept, 0.),
make            (heightIntercept, height),
make            (0., height),
          ]
        } else if yy < height {
        // triangle including (h, w)
          [
make            (heightIntercept, height),
make            (width, yy),
make            (width, height),
          ]
        }
        else {
          raise(NotPossible)
        }
      }
      Path.Options.make(~segments, ())->Path.make
    }
}

let reflection = (path, a, b) => {
  open Paper
  open Point
  let p2 = Path.clone(path)
  if y(b) == y(a) {
    p2->Path.segments->Js.Array2.forEach(segment => {
      let point = segment->Segment.point
      point->setY(2. *. y(a) -. y(point))
      }
    )
  } else if x(b) == x(a) {
    p2->Path.segments->Js.Array2.forEach(segment => {
      let point = segment->Segment.point
      point->setX(2. *. x(a) -. x(point))
      }
    )
  } else {
    let m = slope(b, a)
    let reflectionMatrix = Matrix.make(
      1. -. Js.Math.pow_float(~base=m, ~exp=2.0),
      2. *. m,
      2. *. m,
      Js.Math.pow_float(~base=m, ~exp=2.) -. 1.,
      0.,
      0.
    )->Matrix.scale(1. /. (1. +. Js.Math.pow_float(~base=m, ~exp=2.)))
    p2->Path.translate(multiply(a, -1.));
    p2->Path.transform(reflectionMatrix);
    p2->Path.translate(a);
  }
  p2
};


Paper.install(Window.window)
Paper.setup("myCanvas")

Window.window->Window.onload(() => {

  let side = 400.
  let origin = 100.
  let segments = [
    Paper.Point.make(origin, origin),
    Paper.Point.make(origin, origin +. side),
    Paper.Point.make(origin +. side, origin +. side),    
    Paper.Point.make(origin +. side, origin),
  ]
  let [a, b, c, d] = segments
  let fillColor = Paper.Color.gray(0.9)
  let strokeColor = Paper.Color.gray(0.0)
  let options = Paper.Path.Options.make(~segments, ~fillColor, ~strokeColor, ~closed=true, ())
  let back  = Paper.Path.make(options)
  let front = Paper.Path.Options.make(~segments, ~fillColor, ~strokeColor, ~closed=true, ())->Paper.Path.make

  let p1 = Paper.Point.make(400.0, 200.0)
  let p2 = Paper.Point.make(600., 300.)

  let other = reflection(front, p1, p2)
});
