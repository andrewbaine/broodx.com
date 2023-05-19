let p = Point.make
let paper = Origami.Model.make()

let unfolded = Origami.fold(paper, [])

{
  open Origami.Model
  let expected = {
    vertices: [],
    edges: [],
    triangles: [],
  }
  let a = p(0.0, 0.0)
  let b = p(1.0, 1.0)
  let c = p(1.0, 0.0)
  let fold = (a, b, c)
  let expected = {
    vertices: unfolded.vertices |> Js.Array.map(p => {
      let (paperLocation, _, z) = p
      if paperLocation == a || paperLocation == b || paperLocation == c {
        p
      } else {
        (paperLocation, c, 1)
      }
    }),
    edges: unfolded.edges,
    triangles: unfolded.triangles,
  }
  let actual = Origami.fold(paper, [fold])
  Tap.same(actual, expected)
}
