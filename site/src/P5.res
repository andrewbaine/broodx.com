type t
@send external noStroke: t => unit = "noStroke"
@send external scale: (t, float) => unit = "scale"
@send external fill: (t, string) => unit = "fill"
@send external translate: (t, float, float, float) => unit = "translate"

module Mode = {
  type t
}

module Color = {
  type t
}

module EndShapeOptions = {
  type p5 = t
  type t
  @get external close: p5 => t = "CLOSE"
}

@get external webgl: t => Mode.t = "WEBGL"
@set external setup: (t, unit => unit) => unit = "setup"
@set external draw: (t, unit => unit) => unit = "draw"
@send external createCanvas: (t, int, int, Mode.t) => unit = "createCanvas"
@send external background: (t, Color.t) => unit = "background"
@send external backgroundString: (t, string) => unit = "background"

@module @new external init: (t => unit, Dom.element) => unit = "p5"
@send external gray: (t, int, int) => Color.t = "color"
@send external rgb: (t, int, int, int) => Color.t = ""
@send external millis: t => int = "millis"

@send external triangle: (t, float, float, float, float, float, float) => unit = "triangle"
@send external beginShape: t => unit = "beginShape"
@send external vertex: (t, float, float) => unit = "vertex"
@send external endShape: (t, EndShapeOptions.t) => unit = "endShape"
