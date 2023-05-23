import p5 from "p5";
import mnr from "./mnr.js";
import {
  add,
  cross,
  normalize,
  mid,
  rotate,
  rotateX,
  rotateZ,
  scale,
  sub,
  sum,
  dot,
} from "./vector.js";

import { linearEquation, intersect } from "./point2d.js";

const π = Math.PI;
const halfPi = π / 2;

const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;

const root2 = Math.sqrt(2);

const height = 600;
let size = 250;

const unit = (n) => {
  if (n < 0) {
    return 0;
  }
  if (n > 1) {
    return 1;
  }
  return n;
};

const judgments = {
  θ: π / 10,
};
const θ = judgments.θ;
const cosθ = cos(θ);
const sinθ = sin(θ);
const tanθ = sinθ / cosθ;
const cos2θ = cos(2 * θ);
const sin2θ = sin(2 * θ);
const containerElement = document.getElementById("main");
let oneMinusTanθ = 1 - tan(θ);

const cartesian = (r, θ) => {
  return {
    x: r * Math.cos(θ),
    y: r * Math.sin(θ),
  };
};

const v = [cos2θ, sin2θ, 0];
const k = [-sinθ, cosθ, 0];
const k1 = [-sinθ, -cosθ, 0];
const xAxis = [1, 0, 0];

const background = 200;
const sideA = "white";
const sideB = "lightblue";

const sketch = (p) => {
  let triangle = ([a, b], [c, d], [e, f]) => {
    p.triangle(a, b, c, d, e, f);
  };

  const polygon = (...vertices) => {
    p.beginShape();
    for (const [x, y] of vertices) {
      p.vertex(x, y);
    }
    p.endShape(p.CLOSE);
  };

  let camera;

  const b = ((1 - tan(θ)) * sin(2 * θ)) / sin((3 * π) / 4 - 2 * θ);

  const c = (1 - tan(θ)) / (Math.sqrt(2) * sin((3 * π) / 4 - 2 * θ));
  p.setup = function () {
    p.createCanvas(height, height, p.WEBGL);
    camera = p.createCamera();
    //    console.log(camera.eyeX, camera.eyeY, camera.eyeZ);
  };

  let paper = (n) => {
    p.scale(size);
    p.background(background);
    p.fill(sideA);
    polygon(
      ...[
        [-root2 / 2, 0],
        [0, -root2 / 2],
        [root2 / 2, 0],
        [0, root2 / 2],
      ]
    );
  };

  const isFacingCamera = ([a, b, c]) => {
    const v1 = sub(a, b);
    const v2 = sub(c, b);
    const interior = mid(mid(a, b), c);

    const normal = cross(v1, v2);

    const camVector = normalize(
      sub([camera.eyeX, camera.eyeY, camera.eyeZ], interior)
    );

    const d = dot(normal, camVector);
    return d < 0;
  };

  const h1 = 0.1;
  const h2 = 0.5;

  let smallValley2 = (n) => {
    p.background(background);
    p.scale(size);

    let h = h2;
    const θ = n * π;
    p.fill(sideB);
    polygon(
      ...[
        [-1, 0],
        [1, 0],
        [h * 0.5, -1 + h * 0.5],
        [-h * 0.5, -1 + h * 0.5],
      ].map((p) => p.map((x) => x / root2))
    );

    p.fill(sideA);
    p.triangle(
      ...[h * 0.5, -1 + h * 0.5, 0, -1, -h * 0.5, -1 + h * 0.5].map(
        (x) => x / root2
      )
    );

    if (2 * h1 > h2) {
      throw new Error("2 * h1 > h2");
    }

    p.translate(0, (-1 + h * 0.5) / root2);
    p.fill(sideA);

    const p1 = [-h * 0.5, -1 + h * 0.5, 0];
    const p2 = [0, -1, 0];
    const p3 = [h * 0.5, -1 + h * 0.5, 0];

    const ifc = isFacingCamera(
      [p1, p2, p3].map((p) => {
        let translate = [0.0, 1 - h * 0.5, 0.0];
        let q = add(p, translate);
        let r = rotateX(q, -θ);
        let s = sub(r, translate);
        let t = scale(s, size);
        return t;
      })
    );

    p.rotateX(-θ);
    if (ifc) {
      p.fill(sideA);
      p.triangle(
        ...[
          -h1 * 0.5,
          (h1 - h2) * 0.5,
          h1 * 0.5,
          (h1 - h2) * 0.5,
          0,
          (2 * h1 - h2) * 0.5,
        ].map((x) => x / root2)
      );
      p.fill(sideB);
      polygon(
        ...[
          [-h2 * 0.5, 0],
          [h2 * 0.5, 0],
          [h1 * 0.5, (h1 - h2) * 0.5],
          [0, (2 * h1 - h2) * 0.5],
          [-h1 * 0.5, (h1 - h2) * 0.5],
        ].map((p) => p.map((x) => x / root2))
      );
    } else {
      p.fill(sideA);
      polygon(
        ...[
          [-h2 * 0.5, 0],
          [h2 * 0.5, 0],
          [h1 * 0.5, (h1 - h2) * 0.5],
          [-h1 * 0.5, (h1 - h2) * 0.5],
        ].map((p) => p.map((x) => x / root2))
      );
    }
  };

  let smallValley1 = (n) => {
    const h = h1;
    const θ = n * π;
    p.background(background);
    p.scale(size);

    p.fill(sideB);
    polygon(
      ...[
        [-1, 0],
        [1, 0],
        [h * 0.5, -1 + h * 0.5],
        [-h * 0.5, -1 + h * 0.5],
      ].map((point) => point.map((x) => x / root2))
    );

    p.fill(sideA);
    p.triangle(
      ...[h * 0.5, -1 + h * 0.5, 0, -1, -h * 0.5, -1 + h * 0.5].map(
        (x) => x / root2
      )
    );

    p.translate(0, (-1 + h * 0.5) / root2);
    p.fill(sideA);

    const p1 = [-h * 0.5, -1 + h * 0.5, 0];
    const p2 = [h * 0.5, -1 + h * 0.5, 0];
    const p3 = [0, -1, 0];

    const ifc = isFacingCamera(
      [p1, p2, p3].map((p) => {
        let translate = [0.0, 1 - h * 0.5, 0.0];
        let q = add(p, translate);
        let r = rotateX(q, -θ);
        let s = sub(r, translate);
        let t = scale(s, size);
        return t;
      })
    );

    p.fill(ifc ? sideA : sideB);
    p.rotateX(-θ);

    p.triangle(...[-h * 0.5, 0, 0, -h * 0.5, h * 0.5, 0].map((x) => x / root2));
  };

  let largeValleyFold = (n) => {
    const θ = n * π;

    const a = scale([-1, 0, 0], size);
    const b = scale([0, cos(θ), sin(θ)], size);
    const c = scale([1, 0, 0], size);
    const ifc = isFacingCamera([a, b, c]);

    p.scale(size);
    p.background(background);

    p.fill(sideA);
    p.triangle(-root2 / 2, 0, 0, -root2 / 2, root2 / 2, 0);

    p.rotateX(θ);
    p.fill(ifc ? sideB : sideA);
    p.triangle(-root2 / 2, 0, 0, root2 / 2, root2 / 2, 0);
  };

  const x = 0.5 * (1 - h2);
  const y = 0.5 * h1;

  const { polygon1, polygon2, tip, quad1, petal, t1 } = (() => {
    const leftEdge = linearEquation(
      [(-1 * root2) / 2, 0],
      [0, (-1 * root2) / 2]
    );
    const e1 = [1, -1, 0];
    const e2 = linearEquation(
      [0, (-1 * root2) / 2],
      [-oneMinusTanθ / (root2 * 2), -oneMinusTanθ / (root2 * 2)]
    );
    const e3 = linearEquation(
      [(-0.5 * h2 * root2) / 2, ((0.5 * h2 - 1) * root2) / 2],
      [0, ((h2 - 1) * root2) / 2]
    );
    const int = intersect(e1, e2).intersection;
    if (!int) {
      throw new Error("no intersection");
    }
    const int2 = intersect(e3, e2).intersection;
    if (!int) {
      throw new Error("no intersection");
    }
    const e4 = [0, 1, ((1 - h2 + 0.5 * h1) * root2) / 2];
    const int3 = intersect(e4, e3).intersection;
    if (!int3) {
      throw new Error("no intersection 3");
    }
    const int4 = intersect([1, 0, 0], e4).intersection;
    if (!int4) {
      throw new Error("no intersection 4");
    }
    const int5 = intersect(e2, [
      0,
      -1,
      ((0.5 * h2 - 1) * root2) / 2,
    ]).intersection;
    if (!int5) {
      throw new Error("no intersection 5");
    }
    const f = ([x, y]) => [-x, y];

    const quad = [
      intersect(e1, leftEdge).intersection,
      intersect(e3, leftEdge).intersection,
      int2,
      int,
    ];
    const t1 = [
      int2,
      intersect(e3, leftEdge).intersection,
      [0, (-1 * root2) / 2],
    ];
    const transform = ([x, y]) => {
      let tx = oneMinusTanθ / (2 * root2);
      let ty = oneMinusTanθ / (2 * root2);
      const v = [x + tx, y + ty, 0];
      let [xx, yy, zz] = rotateZ(v, θ + π / 4);
      return [xx, yy];
    };
    return {
      polygon1: [[0, 0], int, int2, int3, int4, f(int3), f(int2), f(int)],
      polygon2: [int4, int3, int2, int5, f(int5), f(int2), f(int3)],
      tip: [int5, [0, (-1 * root2) / 2], f(int5)],
      quad1: quad.map(transform),
      t1: t1.map(transform),
      petal: [
        [0, 0],
        [1 / cosθ, 0],
        [sinθ * tanθ, -sinθ],
      ],
    };
  })();

  const p2 = petal.map(([x, y]) => {
    const v = [x, y, 0];
    const [xr, yr, zr] = rotateZ(v, -θ - π / 4);
    let tx = xr - oneMinusTanθ / root2;
    let ty = yr - oneMinusTanθ / root2;
    return [(tx * size) / root2, (ty * size) / root2];
  });

  let fold2 = (n) => {
    const θ = -n * π;
    p.scale(size);
    p.background(background);
    p.fill(sideB);
    polygon(
      [-0.5 / root2, -0.5 / root2],
      [0, 0],
      [0.5 / root2, -0.5 / root2],
      [(0.5 - x) / root2, (-0.5 - x) / root2],
      [y / root2, (-1 + h2 - 0.5 * h1) / root2],
      [-y / root2, (-1 + h2 - 0.5 * h1) / root2],
      [(-0.5 + x) / root2, (-0.5 - x) / root2]
    );
    p.push();
    p.fill(sideA);
    polygon(
      [(0.5 - x) / root2, (-0.5 - x) / root2],
      [y / root2, (-1 + h2 - 0.5 * h1) / root2],
      [-y / root2, (-1 + h2 - 0.5 * h1) / root2],
      [(-0.5 + x) / root2, (-0.5 - x) / root2]
    );

    p.triangle(
      (0.5 - x) / root2,
      (-0.5 - x) / root2,
      (-0.5 + x) / root2,
      (-0.5 - x) / root2,
      0,
      -1 / root2
    );
    p.pop();

    p.push();
    p.rotateZ((-3 * π) / 4);
    //    p.rect(0, 0, 1, 1);

    p.fill(sideB);
    p.rotateX(θ);
    p.triangle(0, 0, 1 / 2, 0, 1 / 2, -1 / 2);

    p.pop();
    p.rotateZ((3 * π) / 4);
    p.rotateX(θ);
    p.triangle(0, 0, -1 / 2, 0, -1 / 2, -1 / 2);
  };

  const f = (β, estimate) => {
    const cosβ = cos(β);
    const sinβ = sin(β);

    const k = [sinθ, cosθ, 0];
    const v = [-cos2θ, sin2θ, 0];
    const kDotV = dot(k, v);

    const a = sin2θ * cosβ + cosθ * kDotV * (1 - cosβ);
    const b = -(sinθ * sin2θ + cosθ * cos2θ) * sinβ;
    const c = 0;

    const f = (β) => a * cos(β) + b * sin(β) + c;
    const fp = (β) => -a * sin(β) + b * cos(β);
    const fpp = (β) => -a * cos(β) - b * sin(β);

    const φ = mnr(f, fp, fpp, estimate);
    let α = 2 * φ;
    while (α > 2 * π) {
      α = α - 2 * π;
    }
    while (α < -2 * π) {
      α = α + 2 * π;
    }
    return α;
  };

  let stage4Estimate = 0.0;

  let petalFoldv2 = (n) => {
    p.scale(size);

    const β = n * π;
    const α = f(β, stage4Estimate);
    stage4Estimate = α;

    p.background(background);

    p.push();
    /*    polygon(
      [-0.5 * root2, -0.5 * root2],
      [0, 0],
      [0.5 * root2, -0.5 * root2],
      [(0.5 - x) * root2, (-0.5 - x) * root2],
      [y * root2, (-1 + h2 - 0.5 * h1) * root2],
      [-y * root2, (-1 + h2 - 0.5 * h1) * root2],
      [(-0.5 + x) * root2, (-0.5 - x) * root2]
      );
      */
    p.pop();

    p.push();
    p.fill(sideB);
    polygon(...polygon1);
    p.pop();

    p.fill("pink");
    for (const [x, y] of p2) {
      p.circle(x, y, 0.1);
    }

    p.fill(sideA);
    polygon(...polygon2);
    polygon(...tip);

    p.translate(-oneMinusTanθ / (2 * root2), -oneMinusTanθ / (2 * root2));
    p.rotateZ(π / 4);

    p.fill(sideB);
    p.triangle(0, 0, oneMinusTanθ / 2, 0, (c * cos2θ) / 2, (-c * sin2θ) / 2);

    p.push();

    const ifc = false;
    p.rotateZ(-θ - halfPi);
    p.rotateX(-1 * β);
    if (ifc) {
      p.fill("pink");
      p.triangle(0, 0, 1 / (2 * cosθ), 0, (sinθ * tanθ) / 2, -sinθ / 2);
    } else {
      p.fill("white");
      polygon(...quad1);
      p.fill("gray");
      polygon(...t1);
    }

    p.pop();
    p.rotateZ(-2 * θ);

    p.rotateX(-1 * (π - α));
    p.fill("lightyellow");
    p.triangle(0, 0, c / 2, 0, tanθ / 2, -1 / 2);

    p.rotateZ(θ - halfPi);
    p.rotateX(β);
    p.fill("pink");
    p.triangle(0, 0, 1 / (2 * cosθ), 0, (sinθ * tanθ) / 2, -sinθ / 2);
  };

  let stages = [
    /*
    {
      duration: 0,
      draw: () => {},
    },
    {
      duration: 3.0 * 1000,
      draw: paper,
    },
    {
      duration: 3.0 * 1000,
      draw: largeValleyFold,
    },
    {
      duration: 3.0 * 1000,
      draw: smallValley1,
    },
      */
    {
      duration: 3.0 * 1000,
      draw: smallValley2,
    },
    {
      duration: 3.0 * 1000,
      draw: fold2,
    },

    {
      duration: 3 * 1000,
      draw: petalFoldv2,
    },
  ];
  let t = 0;
  for (const stage of stages) {
    stage.startTime = t;
    t = t + stage.duration;
    stage.endTime = t;
  }

  let stageIndex = 0;
  let currentStage = stages[stageIndex];
  p.draw = function () {
    let t = p.millis();
    if (currentStage && t < currentStage.startTime) {
      throw new Error();
    }
    while (currentStage && t > currentStage.endTime) {
      stageIndex = stageIndex + 1;
      currentStage = stages[stageIndex];
    }
    if (currentStage) {
      let n = (t - currentStage.startTime) / currentStage.duration;
      currentStage.draw(n);
    }
  };
};

const crease = ({ background, height, light }) => {
  const a = [0, 0];
  const b = [1, 0];
  const c = [1, 1];
  const d = [0, 1];

  const top = linearEquation(a, b);
  const right = linearEquation(b, c);
  const bottom = linearEquation(c, d);
  const left = linearEquation(d, a);

  const e = intersect(
    [1, 0, -0.5],
    linearEquation([0, 0], [1, tanθ])
  ).intersection;

  const center = mid(mid(a, c), mid(b, d));

  let camera;

  return (p) => {
    const line = ([a, b], [c, d]) => p.line(a, b, c, d);
    p.setup = function () {
      p.createCanvas(height, height, p.WEBGL);
      camera = p.createCamera();
    };
    p.draw = function () {
      p.background(background);
      p.scale((height * 2) / 3);
      p.translate(-0.5, -0.5);
      p.fill(light);
      p.rect(0, 0, 1, 1);
      line(a, e);
      line(e, b);
    };
  };
};

switch (window.location.pathname) {
  case "/crease":
    const params = new URLSearchParams(document.location.search);
    new p5(
      crease({
        background: parseInt(params.get("background") || "200"),
        height: parseInt(params.get("height") || 500),
        light: params.get("light") || "lightyellow",
      }),
      containerElement
    );
    break;
  default:
    new p5(sketch, containerElement);
    break;
}
