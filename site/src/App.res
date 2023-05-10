exception NotPossible

module P5 = {
  type t

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

let sketch = p => {
  open P5
  let gray = p->gray(200, 255)
  let h = 600
  Js.log("we sketching yo")
  p->setup(() => {
    p->createCanvas(h, h, p->P5.webgl)
  })
  p->draw(() => {
    p->background(gray)
    let t = p->millis
    t->ignore
  })
}

Window.window->Window.onload(() => {
  P5.init(sketch, getElementById(document, "main"))
})
