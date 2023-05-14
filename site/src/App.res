type point = (float, float)
type segment = (float, float, float, float)

exception NotPossible

module P5 = {
  type t
  @send external scale: (t, float) => unit = "scale"
  @send external fill: (t, string) => unit = "fill"
  @send external translate: (t, float, float, float) => unit = "translate"

  module Mode = {
    type t
  }

  module Color = {
    type t
  }

  @get external webgl: t => Mode.t = "WEBGL"
  @set external setup: (t, unit => unit) => unit = "setup"
  @set external draw: (t, unit => unit) => unit = "draw"
  @send external createCanvas: (t, int, int, Mode.t) => unit = "createCanvas"
  @send external background: (t, Color.t) => unit = "background"

  @module @new external init: (t => unit, Dom.element) => unit = "p5"
  @send external gray: (t, int, int) => Color.t = "color"
  @send external rgb: (t, int, int, int) => Color.t = ""
  @send external millis: t => int = "millis"

  @send external triangle: (t, float, float, float, float, float, float) => unit = "triangle"
}

@send external getElementById: (Dom.document, string) => Dom.element = "getElementById"

@val external document: Dom.document = "document"

module Stage = {
  type rec t = {
    startTime: int,
    endTime: int,
    draw: (P5.t, float) => unit,
  }
}

let blankPaper = (p, _) => {
  Js.log(p)
}

let (stages, _) =
  [(0.5, blankPaper)] |> Js.Array.reduce(((stages, startTime), (duration, draw)) => {
    let endTime = startTime + int_of_float(duration *. 1000.0)
    open Stage
    stages
    ->Js.Array2.push({
      startTime,
      endTime,
      draw,
    })
    ->ignore
    (stages, endTime)
  }, ([], 0))

let currentStage = ref(stages->Belt.Array.get(0))
let currentIndex = ref(0)

let halfPi = Js.Math._PI /. 2.
let t = Js.Math._PI /. 12.
let h = 0

let sketch = p => {
  open P5
  let gray = p->gray(200, 255)
  let h = 600

  let a = Point.make(0., 0.)
  let b = Point.make(1., 0.)
  let c = Point.make(1., 1.)
  let d = Point.make(0., 1.)

  let center = Point.midpoint(Point.midpoint(a, c), Point.midpoint(b, d))

  let topCenter = Point.midpoint(a, b)
  let bottomCenter = Point.midpoint(c, d)
  let leftCenter = Point.midpoint(a, d)
  let rightCenter = Point.midpoint(b, c)

  Js.log2("center", center)

  let pA = Point.scale(0.5, Point.make(1., tan(t)))
  let pB = Point.rotate(pA, ~center, halfPi)
  let pC = Point.rotate(pA, ~center, Js.Math._PI)
  let pD = Point.rotate(pA, ~center, 3. *. Js.Math._PI /. 2.)

  let qA = Point.polar(0.5 /. sin(2. *. t +. Js.Math._PI /. 4.), Js.Math._PI /. 4.)
  let qC = Point.make(1.0, 1.0)->Point.subtract(qA)

  let triangle = ((a, b), (c, d), (e, f)) => p->triangle(a, b, c, d, e, f)

  p->setup(() => {
    p->createCanvas(h, h, p->P5.webgl)
    p->background(gray)
    p->scale(float(h) /. 2.)
    p->translate(-0.5, -0.5, 0.0)
    p->fill("white")
    triangle(a, pA, topCenter)
    triangle(a, leftCenter, pD)
    triangle(b, topCenter, pA)
    triangle(b, pB, rightCenter)
    triangle(c, rightCenter, pB)
    triangle(c, pC, bottomCenter)
    triangle(d, bottomCenter, pC)
    triangle(d, pD, leftCenter)
    triangle(a, qA, pA)
    triangle(a, pD, qA)
  })
  //  p->draw(() => {})
}

Window.window->Window.onload(() => {
  P5.init(sketch, getElementById(document, "main"))
})
