type t
@val external window: t = "window"
@set external onload: (t, unit => unit) => unit = "onload"
