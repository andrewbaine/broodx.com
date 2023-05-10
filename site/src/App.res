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
}

@send external getElementById: (Dom.document, string) => Dom.element = "getElementById"

@val external document: Dom.document = "document"

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
  })
}

Window.window->Window.onload(() => {
  P5.init(sketch, getElementById(document, "main"))
})
