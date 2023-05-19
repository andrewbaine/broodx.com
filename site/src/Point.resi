type t = (float, float)
let make: (float, float) => t
let polar: (float, float) => t
let scale: (float, t) => t
let midpoint: (t, t) => t
let subtract: (t, t) => t
let rotate: (~center: t, t, float) => t
let interpolate: (~start: t, ~end: t, float) => t
let ccw: (~tolerance: float=?, t, t, t) => bool
let collinear: (~tolerance: float=?, t, t, t) => bool
let determinant: (t, t) => float
let close: (~tolerance: float=?, t, t) => bool
