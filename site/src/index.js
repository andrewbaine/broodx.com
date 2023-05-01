const async = require("async");
const paper = require("paper");

paper.install(window);

const along = (a, b, factor) => a.add(b.subtract(a).multiply(factor));
const midpoint = (a, b, factor) => along(a, b, 0.5);

const logShape = (shape) => {
  console.log(shape.segments.map((x) => x.point.toString()));
};

const divide = (p1, p2) => {
  if (p1.x > p2.x) {
    return divide(p2, p1);
  }
  const { width, height } = paper.view.bounds;
  if (p1.x == p2.x) {
    return new paper.Path.Rectangle([0, 0], [p1.x, height]);
  } else if (p2.y == p1.y) {
    return new paper.Path.Rectangle([0, 0], [width, p1.y]);
  } else {
    const m = (p2.y - p1.y) / (p2.x - p1.x);
    const b = p2.y - m * p2.x;
    let f = (x) => m * x + b;
    let y = f(width);
    let xIntercept = -b / m;
    let heightIntercept = (height - b) / m;
    if (b < 0) {
      if (y < 0) {
        throw new Error("impossible");
      } else if (y < height) {
        // triangle including (w, 0)
        return new paper.Path({
          segments: [
            [xIntercept, 0],
            [width, 0],
            [width, y],
          ],
        });
      } else {
        return new paper.Path({
          segments: [
            [0, 0],
            [xIntercept, 0],
            [heightIntercept, height],
            [0, height],
          ],
        });
      }
    } else if (b < height) {
      if (y < 0) {
        // triangle including origin
        return new paper.Path({
          segments: [
            [0, 0],
            [0, b],
            [xIntercept, 0],
          ],
        });
      } else if (y < height) {
        return new paper.Path({
          segments: [
            [0, b],
            [0, 0],
            [width, 0],
            [width, y],
          ],
        });
      } else {
        // triangle including (0, h)
        return new paper.Path({
          segments: [
            [0, height],
            [0, b],
            [heightIntercept, height],
          ],
        });
      }
    } else {
      // b > height
      if (y < 0) {
        return new paper.Path({
          segments: [
            [0, 0],
            [xIntercept, 0],
            [heightIntercept, height],
            [0, height],
          ],
        });
      } else if (y < height) {
        // triangle including (h, w)
        return new paper.Path({
          segments: [
            [heightIntercept, height],
            [width, y],
            [width, height],
          ],
        });
      } else {
        throw new Error("impossible");
      }
    }
  }
};

const crease = (paths, a, b) => {};

const clamp = (x) => {
  if (x < 0) {
    return 0;
  }
  if (x > 1) {
    return 1;
  }
  return x;
};

const makeVectors = (path, destination) =>
  path.segments.map(({ point }, i) => destination[i].subtract(point));

const white = 1.0;
const black = 0.0;

// const edgeColor = 0.9;
const lightGrey = 0.9;
const edgeColor = black;
const lightSide = white;
const darkSide = 0.95;
const creaseColor = edgeColor;

const reflection = (path, a, b) => {
  const p2 = path.clone();
  if (b.y == a.y) {
    p2.segments.forEach(({ point }) => {
      point.y = 2 * a.y - point.y;
    });
  } else if (b.x == a.x) {
    p2.segments.forEach(({ point }) => {
      point.x = 2 * a.x - point.x;
    });
  } else {
    const m = (b.y - a.y) / (b.x - a.x);
    const reflectionMatrix = new paper.Matrix(
      1 - Math.pow(m, 2),
      2 * m,
      2 * m,
      Math.pow(m, 2) - 1,
      0,
      0
    ).scale(1 / (1 + Math.pow(m, 2)));
    p2.translate(a.multiply(-1));
    p2.transform(reflectionMatrix);
    p2.translate(a);
  }
  return p2;
};

const projection = (path, a, b) => {
  const p2 = path.clone();
  if (b.x == a.x) {
    p2.segments.forEach((s) => {
      s.point.x = a.x;
    });
  } else {
    const slope = (b.y - a.y) / (b.x - a.x);
    const theta = -Math.atan(slope);
    const matrix = new paper.Matrix();
    matrix.rotate(theta);
    p2.transform(matrix);
    p2.segments.forEach((s) => {
      s.point.y = 0;
    });
    matrix.rotate(-2 * theta);
    p2.transform(matrix);
  }
  return p2;
};

const phase1 = (startTime, [a, b, c, d]) => {
  const triangle = new paper.Path([a, b, c]);
  triangle.strokeColor = edgeColor;
  triangle.fillColor = white;

  const bottomHalf = [c, d, a];

  const tween = {
    start: new paper.Path({
      segments: [c, d, a],
      visible: false,
    }),
    end: new paper.Path({
      segments: [c, b, a],
      visible: false,
    }),
  };

  const creases = [
    new paper.Path({
      segments: [c, a],
    }),
  ];

  const path = tween.start.clone();
  path.visible = true;
  path.fillColor = lightSide;
  path.strokeColor = edgeColor;
  tween.path = path;

  paper.view.onFrame = ({ time }) => {
    let factor = clamp(time - startTime);
    tween.path.interpolate(tween.start, tween.end, factor);
    tween.path.visible = true;
    if (factor > 0.5) {
      tween.path.fillColor = darkSide;
    }
    creases.forEach(
      (crease) =>
        (crease.strokeColor = (1.0 - factor) * white + factor * creaseColor)
    );
    if (factor >= 1.0) {
      phase2(time, [a, b, c]);
    }
  };
};

const phase2 = (startTime, [a, b, c]) => {
  paper.project.activeLayer.removeChildren();
  const d = midpoint(a, b);
  const e = midpoint(b, c);
  const f = midpoint(c, a);
  const topHalf = new paper.Path({
    segments: [d, b, e],
    fillColor: darkSide,
    strokeColor: edgeColor,
    closed: false,
  });
  const bottomHalf = new paper.Path({
    segments: [e, f, d],
    fillColor: darkSide,
  });

  const creases = [new paper.Path([e, f]), new paper.Path([d, f])];
  const tweens = [
    {
      start: new paper.Path({
        segments: [e, c, f],
        visible: false,
      }),
      end: new paper.Path({
        segments: [e, b, f],
        visible: false,
      }),
    },
    {
      start: new paper.Path([d, a, f]),
      end: new paper.Path([d, b, f]),
    },
  ];
  for (const t of tweens) {
    const path = t.start.clone();
    path.visible = true;
    path.fillColor = darkSide;
    path.strokeColor = edgeColor;
    t.path = path;
  }

  paper.view.onFrame = ({ delta, time, count }) => {
    const factor = clamp(time - startTime);
    creases.forEach(
      (crease) =>
        (crease.strokeColor = (1.0 - factor) * white + factor * creaseColor)
    );

    for (const { start, end, path } of tweens) {
      path.interpolate(start, end, factor);
      path.visible = true;
    }
    if (factor >= 1.0) {
      phase3(time, [d, b, e, f]);
    }
  };
};

const getSquare = (center, side) =>
  [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
  ].map(
    ([x, y]) =>
      new paper.Point(center.x + (x * side) / 2, center.y + (y * side) / 2)
  );

const f = () => {
  const paperWidth = 200;
  const location = [];
  const a = new Point(1, 1);
  const b = new Point(1, 1);
  const c = new Point(1, 1);
  const points = [new Point(0, 0), new Point(0, 1), a, b, c, new Point(1, 0)];
  const path = new Path(points);
  path.closed = true;
  path.scale(200);
  path.strokeColor = "grey";
  path.rotate(45);
  path.position = new Point(300, 300);

  const triangle = new Path(a, b, c);
  triangle.closed = true;
  triangle.position = new Point(300, 300);
  triangle.fillColor = "lightgrey";
  triangle.strokeColor = "grey";
  paper.view.draw();

  const br = path.segments[3].point;
  const directionA = path.segments[1].point.subtract(br);
  const directionB = path.segments[0].point.subtract(br);
  const directionC = path.segments[5].point.subtract(br);

  let fold = 0;

  paper.view.onFrame = function ({ delta, time, count }) {
    delta = delta / 1;
    let x = Math.max(
      path.segments[0].point.x,
      path.segments[2].point.x -
        delta * (path.segments[5].point.x - path.segments[0].point.x)
    );
    let y = Math.max(
      path.segments[0].point.y,
      path.segments[4].point.y -
        delta * (path.segments[1].point.y - path.segments[0].point.y)
    );
    path.segments[2].point = path.segments[2].point.add(
      directionA.multiply(delta)
    );
    path.segments[3].point = path.segments[3].point.add(
      directionB.multiply(delta)
    );
    path.segments[4].point = path.segments[4].point.add(
      directionC.multiply(delta)
    );
    if (path.segments[2].point.x < path.segments[1].point.x) {
      path.segments[2].point = path.segments[1].point;
      path.segments[3].point = path.segments[0].point;
      path.segments[4].point = path.segments[5].point;
      fold = 1;
      paper.project.activeLayer.removeChildren();
      phase2(
        time,
        path.segments[0].point,
        path.segments[1].point,
        path.segments[5].point
      );
    }

    triangle.segments[0].point = path.segments[2].point;
    triangle.segments[1].point = path.segments[3].point;
    triangle.segments[2].point = path.segments[4].point;
  };
};

let drawPaper = (top, size) => {
  let from = new paper.Point(top);
  let to = from.add([size, size]);
  let square = new paper.Path.Rectangle({
    from,
    to,
    strokeColor: lightGrey,
    fillColor: white,
    opacity: 0.96,
  });
  return square;
};

const fold = (paths, pointToFold, creaseA, creaseB, cb) => {
  async.waterfall(
    [
      (cb) => {
        let cut = divide(creaseA, creaseB);
        setTimeout(cb, 0, null, cut);
      },
      (cut, cb) => {
        const lefts = [];
        const rights = [];

        let leftIsStationary = true;
        for (const path of paths) {
          const part1 = path.intersect(cut);
          const part2 = path.subtract(cut);
          cut.remove();
          if (part1.segments.length > 0) {
            lefts.push(part1);
          } else {
            part1.remove();
          }
          if (part2.segments.length > 0) {
            rights.push(part2);
          } else {
            part2.remove();
          }
          path.remove();
          if (leftIsStationary && part1.contains(pointToFold)) {
            leftIsStationary = false;
          }
        }
        const [folds, stationary] = leftIsStationary
          ? [rights, lefts]
          : [lefts, rights];
        let top = stationary[0];
        const result = [];
        for (const x of stationary) {
          result.push(x);
          x.bringToFront();
        }
        folds.reverse();
        for (const partToFold of folds) {
          const r = reflection(partToFold, creaseA, creaseB);
          r.bringToFront();
          result.push(r);
          partToFold.remove();
        }
        setTimeout(cb, 0, null, result);
      },
    ],
    cb
  );
};

window.onload = function () {
  paper.setup("myCanvas");
  //  let square = getSquare(new Point(300, 300), 320);
  //  paper.view.onFrame = ({ time, delta, count }) => {
  //    phase1(time, square);
  //  };

  let size = 300;
  let start = new paper.Point(100, 100);
  let backToFront = [];
  let width = 45;
  // for (let i = width; i < size; i = i + width) {
  //   let line = new paper.Path.Rectangle(
  //     new paper.Point(start.x + i, start.y),
  //     new paper.Point(start.x + i + 1, start.y + size)
  //   );
  //   line.fillColor = "pink";
  //   backToFront.push(line);
  //   let line2 = new paper.Path.Rectangle(
  //     new paper.Point(start.x, start.y + i),
  //     new paper.Point(start.x + size, start.y + i + 1)
  //   );
  //   line2.fillColor = "lightblue";
  //   backToFront.push(line2);
  // }

  let back1 = new paper.Path({
    segments: [
      [100, 100],
      [100, 400],
      [400, 400],
    ],
  });
  back1.fillColor = "green";

  let back2 = new paper.Path({
    segments: [
      [100, 100],
      [400, 100],
      [400, 400],
    ],
  });
  back2.fillColor = "red";
  //  square.fillColor = "red";
  backToFront.push(back1);
  backToFront.push(back2);

  let front = drawPaper(start, 300);
  backToFront.push(front);

  let p1 = along(front.segments[0].point, front.segments[1].point, 1 / 3);
  let p2 = along(front.segments[1].point, front.segments[2].point, 1 / 2);

  const step0 = (cb) => {
    for (const path of backToFront) {
      path.bringToFront();
    }
  };
  const step1 = async.apply(fold, backToFront, start, p1, p2);
  const step2 = (pieces, cb) => {
    let p3 = along(p1, p2, 0.6);
    let p4 = along(front.segments[2].point, front.segments[3].point, 0.5);

    fold(pieces, front.segments[2].point, p3, p4, cb);
    //cb(null);
  };

  const [a, b, c, d] = front.segments.map(({ point }) => point);
  const steps = [
    setTimeout,
    async.apply(fold, backToFront, a, b, d),
    (pieces, cb) => fold(pieces, b, midpoint(b, c), midpoint(a, d), cb),
    //    (pieces, cb) => fold(pieces, d, midpoint(d, c), midpoint(a, b), cb),
  ];

  async.waterfall(steps, (err) => {
    if (err) {
      throw err;
    }
  });
};
