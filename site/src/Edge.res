// (a, b, c, d, t)
// represents an edge
// from (a, b) on the paper to (c, d) on the paper
// of type t
type t = (Point.t, Point.t, EdgeType.t)
let edgeType = ((_, _, x)) => x
let start = ((a, _, _)) => a
let end = ((_, b, _)) => b
let border = (a, b) => (a, b, EdgeType.Border)
let crease = (a, b) => (a, b, EdgeType.Crease)
let dummy = (a, b) => (a, b, EdgeType.Dummy)
