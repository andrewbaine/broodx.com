let p = Point.make

module Vertex = {
  // (x, y, x1, y1, z)
  // reprexents a point on the paper at (x, y)
  // currently folded to location (x1, y1) at layer z
  type t = (Point.t, Point.t, int)
  let make: Point.t => t = p => {
    (p, p, 0)
  }
}

module Crease = {
  // (a, b, c, d) represents a crease from (a, b) to (c, d)
  type t = (Point.t, Point.t)
}

module Fold = {
  type t = (Point.t, Point.t, Point.t)
}

module Triangle = {
  type t = (Point.t, Point.t, Point.t)
}

module Model = {
  type t = {
    edges: array<Edge.t>,
    vertices: array<Vertex.t>,
    triangles: array<Triangle.t>,
  }

  let make = () => {
    let a = p(0.0, 0.0)
    let b = p(1.0, 0.0)
    let c = p(1.0, 1.0)
    let d = p(0.0, 1.0)
    {
      vertices: [a, b, c, d] |> Js.Array.map(Vertex.make),
      edges: [
        Edge.border(a, b),
        Edge.border(b, c),
        Edge.border(c, d),
        Edge.border(d, a),
        Edge.dummy(a, c),
      ],
      triangles: [(a, b, c), (a, c, d)],
    }
  }
  exception ReferencePointColinearWithCrease
}
let fold: (~tolerance: float=?, Model.t, array<Fold.t>) => Model.t = (
  ~tolerance=0.0,
  model,
  folds,
) => {
  // executing a fold impacts every point on the paper.
  // sometimes multiple folds need to be executed at the same time
  // executing a mountain fold always moves some triangles to the bottom
  // executing a valley fold always moves some triangles to the top
  // if (a, b) is a valley fold
  // then (b, a) is the corresponding mountain fold
  // we use the righthand rule to determine whether a fold is mountain or valley.
  // ((0,0), (1, 1)) is a valley fold
  // ((1, 1), (0, 0)) is the corresponding mountain fold
  // ((0, 0.5), (1, 0.5)) is a valley fold
  // ((1, 0.5), (0, 0.5)) is the corresponding valley fold

  tolerance->ignore
  folds |> Js.Array.reduce((model, _) => model, model)
}
