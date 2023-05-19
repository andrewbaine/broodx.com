type t

let edgeType: t => EdgeType.t
let start: t => Point.t
let end: t => Point.t

let border: (Point.t, Point.t) => t
let crease: (Point.t, Point.t) => t
let dummy: (Point.t, Point.t) => t
