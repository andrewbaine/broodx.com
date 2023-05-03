const async = require("async");
const paper = require("paper");

paper.install(window);

const along = (a, b, factor) => a.add(b.subtract(a).multiply(factor));
const midpoint = (a, b, factor) => along(a, b, 0.5);

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
