const paper = require("paper");

paper.install(window);

const along = (a, b, factor) => a.add(b.subtract(a).multiply(factor));
const midpoint = (a, b, factor) => along(a, b, 0.5);

const makeVectors = (path, destination) =>
  path.segments.map(({ point }, i) => destination[i].subtract(point));

const white = 1.0;
const black = 0.0;

// const edgeColor = 0.9;
const edgeColor = black;
const lightSide = white;
const darkSide = 0.95;
const creaseColor = edgeColor;

const reflection = (path, a, b) => {
  for (const p of [a, b]) {
    new paper.Path.Circle({
      center: p,
      radius: 5,
      fillColor: "lightblue",
    });
  }
  const p2 = path.clone();
  const m = (b.y - a.y) / (b.x - a.x);
  const reflectionMatrix = new paper.Matrix(
    1 - Math.pow(m, 2),
    2 * m,
    2 * m,
    Math.pow(m, 2) - 1,
    0,
    0
  ).scale(1 / (1 + Math.pow(m, 2)));
  console.log(a.x, a.y);
  p2.translate(a.multiply(-1));
  p2.transform(reflectionMatrix);
  p2.translate(a);
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
    let factor = Math.min(1.0, time - startTime);
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
    const factor = Math.min(1.0, (time - startTime) / 1.0);
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

const phase3 = (time, [a, b, c, d]) => {
  paper.project.activeLayer.removeChildren();
  paper.view.onFrame = () => {};
  const rectangle = new paper.Path([a, b, c, d]);
  rectangle.fillColor = darkSide;

  const rightHalf = new paper.Path({
    segments: [b, c, d],
    fillColor: "green",
  });
  const leftHalf = new paper.Path({
    segments: [b, a, d],
    fillColor: "red",
  });

  const p = along(b, d, 0.75);
  const t2 = new paper.Path({
    segments: [p, c, d],
    fillColor: "orange",
  });
  const t1 = new paper.Path({
    segments: [b, c, p],
    fillColor: "pink",
  });

  const t3 = reflection(t1, c, p);

  return null;
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

window.onload = function () {
  paper.setup("myCanvas");
  let square = getSquare(new Point(300, 300), 320);
  paper.view.onFrame = ({ time, delta, count }) => {
    phase1(time, square);
  };
};
