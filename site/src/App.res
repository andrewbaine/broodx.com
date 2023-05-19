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

module Url = {
  type t = {
    href: string,
    origin: string,
    protocol: string,
    username: string,
    password: string,
    host: string,
    hostname: string,
    port: string,
    pathname: string,
    search: string,
  }
  @new external make: string => t = "URL"
  @scope("window.location") @val external href: string = "href"
}

module URLSearchParams = {
  type t
  @new external make: string => t = "URLSearchParams"
  @send external get: (t, string) => Js.Nullable.t<string> = "get"
  let get = (params, x) => get(params, x) |> Js.Nullable.toOption
}

/*
let drawCreasePattern = (~height, ~background, ~paperScale, ~up, ~down, element, model) => {
  let bg = background
  open P5
  init(p => {
    p->setup(() => {
      p->createCanvas(height, height, p->P5.webgl)
      p->backgroundString(bg)
      p->scale(float(height) *. paperScale)
      p->translate(-0.5, -0.5, 0.0)
    })
  })
}
*/

/*
let drawModel = (~height, ~background, ~paperScale, ~up, ~down, element, model) => {
  let bg = background
  open P5
  init(p => {
    p->setup(() => {
      p->createCanvas(height, height, p->P5.webgl)
      p->backgroundString(bg)
      p->scale(float(height) *. paperScale)
      p->translate(-0.5, -0.5, 0.0)
      open Origami.Model
      model.layers |> Js.Array.forEach(
        ({edges, triangles}) => {
          p->noStroke
          triangles->Js.Array2.forEach(
            ((p1, p2, p3)) => {
              let (ax, ay) = p1
              let (bx, by) = p2
              let (cx, cy) = p3
              p->fill(
                if Point.ccw(p1, p2, p3) {
                  up
                } else {
                  down
                },
              )
              p->triangle(ax, ay, bx, by, cx, cy)
              edges->Js.Array2.forEach(
                _ => {
                  ()
                },
              )
            },
          )
        },
      )
    })
  }, element)
}
*/

Window.window->Window.onload(() => {
  let href = Url.href
  let u = Url.make(href)
  Js.log2(href, u)
  switch Url.href
  |> Url.make
  |> (x => x.pathname)
  |> Js.String.split("/")
  |> Belt.List.fromArray
  |> List.tl {
  | list{"origami", ...rest} =>
    /*
      let element = getElementById(document, "main")
      let params = URLSearchParams.make(u.search)
      let p = (key, default) =>
        URLSearchParams.get(params, key) |> Js.Option.getWithDefault(default)
      let up = p("up", "pink")
      let down = p("down", "white")
      let height = p("height", "300") |> int_of_string
      let background = p("bg", "lightgrey")
      let paperScale = p("paper-scale", "0.6") |> float_of_string
      switch rest {
      | list{"paper"} => {
          let model = Origami.Model.make()
          model->ignore
          drawModel(~background, ~up, ~down, ~height, ~paperScale, element, model)
        }
      | list{} => P5.init(Playground.sketch(~up, ~down), element)
      | _ => Js.Exn.raiseError("Not Found")
      }
 */
    rest->ignore
  | other => Js.log(other)
  }
})
