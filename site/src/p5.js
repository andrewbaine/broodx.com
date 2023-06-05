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

import { divide } from "./triangle.js";

import { linearEquation, intersect, ccw } from "./point2d.js";

const π = Math.PI;
const halfPi = π / 2;

const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;

const root2 = Math.sqrt(2);

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
  θ: π / 10.7,
  h1Normalized: 1.0,
  h2Normalized: 1.0,
  h3Normalized: 1.0,
  h4Normalized: 0.8,
};
const θ = judgments.θ;
const cosθ = cos(θ);
const sinθ = sin(θ);
const tanθ = sinθ / cosθ;
const cos2θ = cos(2 * θ);
const sin2θ = sin(2 * θ);
const containerElement = document.getElementById("main");
let oneMinusTanθ = 1 - tan(θ);

const makeTriangle = (h1, h2, ty) => {
  if (h1 < h2) {
    return makeTriangle(h2, h1, ty);
  }
  const a = [-h1 * tan(π / 4 - θ), 0 + ty];
  const b = [-h1 * tan(π / 4 - 2 * θ), 0 + ty];
  const c = [0, 0 + ty];

  const d = [-h2 * tan(π / 4 - θ), h1 - h2 + ty];
  const e = [-h2 * tan(π / 4 - θ), h1 - h2 + ty];
  const f = [0, h1 - h2 + ty];

  return [
    [a, b, e, d],
    [b, c, f, e],
  ];
};

const mt = (h) => {
  const a = (0.5 * h * tan(π / 4 - θ) * root2) / 2;
  const b = (0.5 * h * tan(π / 4 - 2 * θ) * root2) / 2;
  return [-a, -b];
};

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
const sideB = "pink";

const folds =
  ({ height, background, paperScale, thetaDivisor }) =>
  (p) => {
    const θ = π / thetaDivisor;
    const a = [0, 0];
    const b = [0, 1];
    const c = [1, 1];
    const d = [1, 0];
    const triangles = [
      [a, b, c],
      [c, d, a],
    ];

    const e1 = linearEquation(mid(a, d), mid(b, c));
    const e2 = [-tan(θ), 1, 0];
    const pA = intersect(e1, e2).intersection;

    p.setup = function () {
      p.createCanvas(height, height, p.WEBGL);
    };

    const triangle = ([[a, b], [c, d], [e, f]]) => {
      p.triangle(a, b, c, d, e, f);
    };
    let triangles2 = [];
    for (const t of triangles) {
      const [above, below] = divide(t, e2, 0.001);
      for (const s of above) {
        triangles2.push(s);
      }
      for (const r of below) {
        triangles2.push(r);
      }
    }

    p.draw = function () {
      p.scale(height * paperScale);
      p.background(background);
      p.fill("white");
      p.circle(pA[0], pA[1], 0.01);
      for (const t of triangles2) {
        triangle(t);
      }
    };
  };

const sketch = (p) => {
  const height = 600;
  const paperScale = 400;

  const cameraEyeX = 0;
  const cameraEyeY = 0;
  const cameraEyeZ = height / 2 / tan(Math.PI / 6);
  const cameraCoordinates = [cameraEyeY, cameraEyeX, cameraEyeZ].map(
    (x) => x / paperScale
  );

  let debugPoint = ([x, y], color) => {
    p.push();
    p.fill(color || "lightblue");
    p.circle(x, y, 0.05);
    p.pop();
  };

  // this function is for unit paper scale
  const isFacingCamera = ([a, b, c]) => {
    const v1 = sub(a, b);
    const v2 = sub(c, b);
    const interior = mid(mid(a, b), c);
    const camVector = normalize(sub(cameraCoordinates, interior));
    const normal = cross(v1, v2);

    const d = dot(normal, camVector);
    return d < 0;
  };

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

  const b = ((1 - tan(θ)) * sin(2 * θ)) / sin((3 * π) / 4 - 2 * θ);

  const c = (1 - tan(θ)) / (Math.sqrt(2) * sin((3 * π) / 4 - 2 * θ));
  p.setup = function () {
    p.createCanvas(height, height, p.WEBGL);
  };

  let paper = (n) => {
    p.scale(paperScale);
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

  const h1 = (judgments.h1Normalized * 2) / 3;
  const h2 = 1.5 * h1 + judgments.h2Normalized * (1 - 1.5 * h1);
  const h3 = judgments.h3Normalized * h2;
  const h4 = (0.5 + judgments.h4Normalized * 0.5) * h3;

  let smallValley2 = (n) => {
    p.scale(paperScale);
    p.background(background);

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

    if (2 * h1 > h2) {
      p.fill(sideA);
      triangle(
        ...[
          [-h1 + h2 * 0.5, -1 + h2 * 0.5],
          [0, -1 + h2 * 0.5 + (h1 - h2 * 0.5)],
          [h1 - h2 * 0.5, -1 + h2 * 0.5],
        ].map((p) => p.map((x) => x / root2))
      );
    }

    p.fill(sideA);
    p.triangle(
      ...[h * 0.5, -1 + h * 0.5, 0, -1, -h * 0.5, -1 + h * 0.5].map(
        (x) => x / root2
      )
    );

    p.translate(0, (-1 + h * 0.5) / root2);
    p.fill(sideA);

    const p1 = [-h * 0.5, -1 + h * 0.5, 0];
    const p2 = [0, -1, 0];
    const p3 = [h * 0.5, -1 + h * 0.5, 0];

    const ifc = isFacingCamera(
      [p1, p2, p3].map((p) => {
        p = p.map((x) => x / root2);
        let translate = [0.0, 1 - h * 0.5, 0.0];
        let q = add(p, translate);
        let r = rotateX(q, -θ);
        let s = sub(r, translate);
        return s;
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

  let smallValley3 = (n) => {
    const α = 0.0;
    const β = π;
    p.scale(paperScale);
    p.background(background);
    p.push();
    p.fill(sideB);
    polygon(...polygon1);

    p.fill(sideA);
    polygon(...polygon2);
    polygon(...polygon3);

    for (const x of [-1, 1]) {
      p.push();
      p.translate(
        (x * oneMinusTanθ) / (2 * root2),
        -oneMinusTanθ / (2 * root2)
      );
      p.rotateZ((x * -1 * π) / 4);

      p.fill(sideB);
      p.triangle(
        0,
        0,
        (x * -1 * oneMinusTanθ) / 2,
        0,
        (x * -1 * (c * cos2θ)) / 2,
        (-c * sin2θ) / 2
      );

      p.push();

      let wing1 = wings(α, β);
      const ifc = isFacingCamera(wing1);
      p.rotateZ(x * (θ + halfPi));
      p.rotateX(-β);
      let m = ([a, b]) => [a * -1 * x, b];
      if (ifc) {
        p.fill(sideB);
        polygon(...quad1.map(m));
        p.fill(sideA);
        polygon(...t1.map(m));
        polygon(...t2.map(m));
      } else {
        p.fill(sideB);
        /*        p.triangle(
          0,
          0,
          (x * -1 * 1) / (2 * cosθ),
          0,
          (x * -1 * (sinθ * tanθ)) / 2,
          -sinθ / 2
          );
          */
      }

      p.pop();
      p.rotateZ(x * 2 * θ);

      p.rotateX(-1 * (π - α));
      p.fill(sideB);
      p.triangle(0, 0, (x * -1 * c) / 2, 0, (x * -1 * tanθ) / 2, -1 / 2);

      p.rotateZ(x * -1 * (θ - halfPi));
      p.rotateX(β);

      p.fill(sideB);
      p.triangle(
        0,
        0,
        (x * -1 * 1) / (2 * cosθ),
        0,
        (x * -1 * (sinθ * tanθ)) / 2,
        -sinθ / 2
      );
      p.pop();
    }

    p.pop();

    p.fill(sideB);
    polygon(...toops.a);
    polygon(...toops.b);

    const ty = ((1 - 0.5 * h3) * root2) / 2;
    p.translate(0, -ty);
    p.rotateX(-n * π);

    const p1 = [-h3 * 0.5, -1 + h3 * 0.5, 0];
    const p2 = [0, -1, 0];
    const p3 = [h3 * 0.5, -1 + 3 * 0.5, 0];

    const ifc = isFacingCamera(
      [p1, p2, p3].map((p) => {
        p = p.map((x) => x / root2);
        let translate = [0.0, (1 - h3 * 0.5) / root2, 0.0];
        let q = add(p, translate);
        let r = rotateX(q, -n * π);
        let s = sub(r, translate);
        return s;
      })
    );

    const t = ([x, y]) => {
      return [x, y + ty];
    };
    if (ifc) {
      p.fill(sideB);
      triangle(...tips.a.map(t));
      p.fill(sideA);
      triangle(...tips.b.map(t));
      p.fill(sideB);
      triangle(...tips.c.map(t));
    } else {
      p.fill(sideB);
      triangle(...tips.d.map(t));
    }
  };

  const smallValley4 = (n) => {
    const α = 0.0;
    const β = π;
    p.scale(paperScale);
    p.background(background);
    p.push();
    p.fill(sideB);
    polygon(...polygon1);

    p.fill(sideA);
    polygon(...polygon2);
    polygon(...polygon3);

    for (const x of [-1, 1]) {
      p.push();
      p.translate(
        (x * oneMinusTanθ) / (2 * root2),
        -oneMinusTanθ / (2 * root2)
      );
      p.rotateZ((x * -1 * π) / 4);

      p.fill(sideB);
      p.triangle(
        0,
        0,
        (x * -1 * oneMinusTanθ) / 2,
        0,
        (x * -1 * (c * cos2θ)) / 2,
        (-c * sin2θ) / 2
      );

      p.push();

      let wing1 = wings(α, β);
      const ifc = isFacingCamera(wing1);
      p.rotateZ(x * (θ + halfPi));
      p.rotateX(-β);
      let m = ([a, b]) => [a * -1 * x, b];
      if (ifc) {
        p.fill(sideB);
        polygon(...quad1.map(m));
        p.fill(sideA);
        polygon(...t1.map(m));
        polygon(...t2.map(m));
      } else {
        p.fill(sideB);
        /*        p.triangle(
          0,
          0,
          (x * -1 * 1) / (2 * cosθ),
          0,
          (x * -1 * (sinθ * tanθ)) / 2,
          -sinθ / 2
          );
          */
      }

      p.pop();
      p.rotateZ(x * 2 * θ);

      p.rotateX(-1 * (π - α));
      p.fill(sideB);
      p.triangle(0, 0, (x * -1 * c) / 2, 0, (x * -1 * tanθ) / 2, -1 / 2);

      p.rotateZ(x * -1 * (θ - halfPi));
      p.rotateX(β);

      p.fill(sideB);
      p.triangle(
        0,
        0,
        (x * -1 * 1) / (2 * cosθ),
        0,
        (x * -1 * (sinθ * tanθ)) / 2,
        -sinθ / 2
      );
      p.pop();
    }

    p.pop();

    p.fill(sideB);
    polygon(...toops.a);
    polygon(...toops.b);

    const ty = ((1 - 0.5 * h3) * root2) / 2;
    p.translate(0, -ty);

    p.push();

    p.rotateX(-π);

    p.fill(sideB);
    const t = ([x, y]) => {
      return [x, y + ty];
    };
    /*
      
    triangle(...tips.a.map(t));
    p.fill(sideA);
    triangle(...tips.b.map(t));
    p.fill(sideB);
    triangle(...tips.c.map(t));
    */
    let tips2Polys = tips2.polygons.map((x) => x.map(t));
    p.fill(sideB);
    polygon(...tips2Polys[0]);

    let t2 = ((h4 - h3) * 0.5) / root2;
    p.translate(0, t2);
    p.rotateX(n * π);
    p.translate(0, -t2);

    const ifc = isFacingCamera(
      [
        [-1, 0],
        [1, 0],
        [0, -1],
      ].map(([x, y]) => {
        const ty = (-1 + 0.5 * (2 * h3 - h4)) / root2;
        let q = rotateX([x, y, 0], n * π);
        let r = add(q, [0, ty, 0]);
        return r;
      })
    );
    if (ifc) {
      p.fill(sideB);
      triangle(...tips2.triangles.a.map(t));
      p.fill(sideA);
      triangle(...tips2.triangles.b.map(t));
      p.fill(sideB);
      triangle(...tips2.triangles.c.map(t));
      p.pop();
    } else {
      p.fill(sideB);
      triangle(...tips2.triangles.d.map(t));
    }
  };

  const smallMountain1 = (n) => {
    const α = 0.0;
    const β = π;
    p.scale(paperScale);
    p.background(background);
    p.push();
    p.fill(sideB);
    polygon(...polygon1);

    p.fill(sideA);
    polygon(...polygon2);
    polygon(...polygon3);

    for (const x of [-1, 1]) {
      p.push();
      p.translate(
        (x * oneMinusTanθ) / (2 * root2),
        -oneMinusTanθ / (2 * root2)
      );
      p.rotateZ((x * -1 * π) / 4);

      p.fill(sideB);
      p.triangle(
        0,
        0,
        (x * -1 * oneMinusTanθ) / 2,
        0,
        (x * -1 * (c * cos2θ)) / 2,
        (-c * sin2θ) / 2
      );

      p.push();

      let wing1 = wings(α, β);
      const ifc = isFacingCamera(wing1);
      p.rotateZ(x * (θ + halfPi));
      p.rotateX(-β);
      let m = ([a, b]) => [a * -1 * x, b];
      if (ifc) {
        p.fill(sideB);
        polygon(...quad1.map(m));
        p.fill(sideA);
        polygon(...t1.map(m));
        polygon(...t2.map(m));
      } else {
        p.fill(sideB);
        /*        p.triangle(
          0,
          0,
          (x * -1 * 1) / (2 * cosθ),
          0,
          (x * -1 * (sinθ * tanθ)) / 2,
          -sinθ / 2
          );
          */
      }

      p.pop();
      p.rotateZ(x * 2 * θ);

      p.rotateX(-1 * (π - α));
      p.fill(sideB);
      p.triangle(0, 0, (x * -1 * c) / 2, 0, (x * -1 * tanθ) / 2, -1 / 2);

      p.rotateZ(x * -1 * (θ - halfPi));
      p.rotateX(β);

      p.fill(sideB);
      p.triangle(
        0,
        0,
        (x * -1 * 1) / (2 * cosθ),
        0,
        (x * -1 * (sinθ * tanθ)) / 2,
        -sinθ / 2
      );
      p.pop();
    }

    p.pop();

    p.fill(sideB);
    polygon(...toops.a);
    polygon(...toops.b);

    const ty = ((1 - 0.5 * h3) * root2) / 2;
    p.translate(0, -ty);

    p.push();

    p.rotateX(-π);

    p.fill(sideB);
    const t = ([x, y]) => {
      return [x, y + ty];
    };

    let tips2Polys = tips2.polygons.map((x) => x.map(t));
    p.fill(sideB);
    polygon(...tips2Polys[0]);

    let t2 = ((h4 - h3) * 0.5) / root2;
    p.translate(0, t2);
    p.rotateX(π);
    p.translate(0, -t2);

    p.fill(sideB);
    polygon(...tips2.polygons2.a.map(t));
    p.fill(sideA);
    polygon(...tips2.polygons2.b.map(t));
    p.fill(sideB);
    polygon(...tips2.polygons2.c.map(t));

    let t3 = (2 * (h4 - h3) * 0.5) / root2;
    p.translate(0, t3);
    p.rotateX(n * π);
    p.translate(0, -t3);

    const ifc = isFacingCamera(
      [
        [-1, 0],
        [1, 0],
        [0, -1],
      ].map(([x, y]) => {
        const ty = (-1 + 0.5 * h3) / root2;
        let q = rotateX([x, y, 0], n * π);
        let r = add(q, [0, ty, 0]);
        return r;
      })
    );

    if (!ifc) {
      p.fill(sideB);
      triangle(...tips2.triangles2.a.map(t));
      p.fill(sideA);
      triangle(...tips2.triangles2.b.map(t));
      p.fill(sideB);
      triangle(...tips2.triangles2.c.map(t));
      p.pop();
    }
  };

  const mountain2 = (n) => {
    const θ2 = π / 4 - 2 * θ;
    const origin = [0, 0];
    const e45 = [1, -1, 0];
    const e45Neg = [1, 1, 0];
    const tip = [0, -root2 / 2];
    const petalTip = add(tip, [-sin(θ2), cos(θ2)]);
    const petalP1 = mid(tip, petalTip);
    const petalP2 = [
      0,
      -((1 - tan(θ)) * sin(2 * θ)) / sin((3 * π) / 4 - 2 * θ) / 2,
    ];

    const petalP3 = intersect(
      linearEquation(petalTip, petalP2),
      e45
    ).intersection;

    const eLeft = linearEquation(tip, [(-tan(θ2) * root2) / 2, 0]);
    const eRight = linearEquation(tip, [(tan(θ2) * root2) / 2, 0]);

    const transpose = ([x, y]) => [-x, y];
    const bodyTopLeft = intersect(eLeft, [
      0,
      1,
      ((1 - 0.5 * h3) * root2) / 2,
    ]).intersection;
    const bodyTopRight = transpose(bodyTopLeft);

    const bodyLeft = intersect(e45, eLeft).intersection;

    const body = [
      origin,
      bodyLeft,
      bodyTopLeft,
      intersect(eRight, [0, 1, ((1 - 0.5 * h3) * root2) / 2]).intersection,
      intersect(e45Neg, eRight).intersection,
    ];
    /*
    const body1 = [
      origin,
      petalP3,
      petalP2,
      petalP1,
      bodyTopLeft,
      bodyTopRight,

      transpose(petalP1),
      transpose(petalP2),
      transpose(petalP3),
      ];
      */

    const headHeight = ((-1 + h2 - 0.5 * h1) * root2) / 2;
    const headHeightLine = [0, -1, headHeight];
    const headDiagonal = [1, -1, ((-1 + h2) * root2) / 2];
    const headPointThatMayBeHidden = intersect(
      headDiagonal,
      headHeightLine
    ).intersection;

    const head = ccw(bodyTopLeft, bodyLeft, headPointThatMayBeHidden)
      ? [
          intersect(headHeightLine, eLeft).intersection,
          bodyTopLeft,
          transpose(bodyTopLeft),
          transpose(intersect(headHeightLine, eLeft).intersection),
        ]
      : [
          headPointThatMayBeHidden,
          intersect(eLeft, headDiagonal).intersection,
          bodyTopLeft,
          transpose(bodyTopLeft),
          transpose(intersect(eLeft, headDiagonal).intersection),
          transpose(headPointThatMayBeHidden),
        ];

    const eyeAHeight = ((-1 + h3 - 0.5 * h4) * root2) / 2;
    const eyeAHeightLine = [0, -1, eyeAHeight];
    const [x1, x2] = mt(h4);
    const wingTopLeft = (() => {
      const [x1, x2] = mt(h3);
      return [x1, ((-1 + 0.5 * h3) * root2) / 2];
    })();

    const eyeAPointThatMayBeInView = [x1, eyeAHeight];
    const eyeBBottomRight = [x2, eyeAHeight];

    const eyeEdgeIntersection = intersect(eyeAHeightLine, eLeft).intersection;

    let eyeA = [];
    let eyeC = [];
    if (ccw(bodyTopLeft, bodyLeft, eyeAPointThatMayBeInView)) {
      eyeA = [
        eyeEdgeIntersection,
        bodyTopLeft,
        transpose(bodyTopLeft),
        transpose(eyeEdgeIntersection),
      ];
      eyeC = [
        wingTopLeft,
        bodyTopLeft,
        eyeEdgeIntersection,
        eyeAPointThatMayBeInView,
      ];
    } else {
      const xx = intersect(
        eLeft,
        linearEquation(wingTopLeft, eyeAPointThatMayBeInView)
      ).intersection;
      eyeA = [
        eyeAPointThatMayBeInView,
        xx,
        eyeEdgeIntersection,
        bodyTopLeft,
        transpose(bodyTopLeft),
        transpose(xx),
        transpose(eyeAPointThatMayBeInView),
      ];
      eyeC = [xx, wingTopLeft, bodyTopLeft];
    }

    let tippy = [0, ((-1 + h3 - h4) * root2) / 2];
    let eyeBTopRight = intersect(linearEquation(tippy, eyeBBottomRight), [
      0,
      -1,
      ((-1 + 0.5 * h3) * root2) / 2,
    ]).intersection;
    const leq = linearEquation(tippy, eyeAPointThatMayBeInView);
    const head2MaybeB = intersect(leq, [
      0,
      -1,
      ((-1 + 0.5 * h3) * root2) / 2,
    ]).intersection;
    const head2MaybeC = intersect(leq, eLeft).intersection;
    let head2;

    let eyeB = [];
    let eyeD = [];
    if (ccw(bodyTopLeft, bodyLeft, eyeAPointThatMayBeInView)) {
      if (ccw(bodyTopLeft, bodyLeft, head2MaybeB)) {
        head2 = [
          eyeEdgeIntersection,
          bodyTopLeft,
          transpose(bodyTopLeft),
          transpose(eyeEdgeIntersection),
        ];
        eyeB = [
          eyeEdgeIntersection,
          bodyTopLeft,
          eyeBTopRight,
          eyeBBottomRight,
        ];
        eyeD = [
          head2MaybeB,
          bodyTopLeft,
          eyeEdgeIntersection,
          eyeAPointThatMayBeInView,
        ];
      } else {
        head2 = [
          eyeEdgeIntersection,
          head2MaybeC,
          head2MaybeB,
          transpose(head2MaybeB),
          transpose(head2MaybeC),
          transpose(eyeEdgeIntersection),
        ];
        eyeB = [
          eyeEdgeIntersection,
          head2MaybeC,
          head2MaybeB,
          eyeBTopRight,
          eyeBBottomRight,
        ];
        eyeD = [head2MaybeC, eyeEdgeIntersection, eyeAPointThatMayBeInView];
      }
    } else {
      head2 = [
        eyeAPointThatMayBeInView,
        head2MaybeB,
        transpose(head2MaybeB),
        transpose(eyeAPointThatMayBeInView),
      ];
      eyeB = [
        eyeAPointThatMayBeInView,
        head2MaybeB,
        eyeBTopRight,
        eyeBBottomRight,
      ];
      eyeD = [];
    }
    const wingLeft = intersect(
      linearEquation(petalP1, petalP2),
      e45
    ).intersection;
    const wing = [petalTip, wingLeft, wingTopLeft, bodyTopLeft];

    p.scale(paperScale);
    p.background(background);

    p.fill(sideB);
    polygon(...body);

    p.push();
    p.fill(sideA);
    polygon(...head);
    p.pop();
    p.fill(sideB);

    triangle(petalTip, petalP1, petalP2);
    triangle(transpose(petalTip), transpose(petalP1), transpose(petalP2));

    p.push();

    polygon(...eyeA);

    p.fill(sideA);
    polygon(...head2);

    p.fill(sideB);
    polygon(...eyeB);
    polygon(...eyeB.map(transpose));

    p.push();
    const [tx, ty] = petalTip;
    const tt = ([x, y]) => {
      let v = [x - tx, y - ty, 0];
      let p1 = rotateZ(v, π / 4 + 2 * θ);
      return p1;
    };

    const p1 = wingLeft;
    const p2 = [p1[0] - tx, p1[1] - ty, 0];
    const k = normalize([petalP1[0] - tx, petalP1[1] - ty, 0]);
    const p3 = rotate(p2, k, n * π);
    //    const p3 = p2;
    const p4 = [p3[0] + tx, p3[1] + ty, 0];

    const ifc = isFacingCamera(
      [petalTip, petalP1, p4].map(([x, y]) => [x, y, 0])
    );
    p.translate(tx, ty);
    p.rotateZ(-π / 4 - 2 * θ);
    p.rotateX(n * π);
    polygon(...wing.map(tt));
    wing.map((p) => {
      const [x, y] = p;
      const translate = [petalTip[0], petalTip[1], 0];
      let q = sub([x, y, 0], translate);
      let k = sub([petalP1[0], petalP2[1], 0], translate);
      let r = rotate(q, k, n * π);
      let s = add(r, translate);
      return s;
    });

    if (!ifc) {
      polygon(...eyeC.map(tt));
      polygon(...eyeD.map(tt));
    }
    p.pop();
  };

  let smallValley1 = (n) => {
    p.scale(paperScale);
    const h = h1;
    const θ = n * π;
    p.background(background);

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
        p = p.map((x) => x / root2);
        let translate = [0.0, 1 - h * 0.5, 0.0];
        let q = add(p, translate);
        let r = rotateX(q, -θ);
        let s = sub(r, translate);
        return s;
      })
    );

    p.fill(ifc ? sideA : sideB);
    p.rotateX(-θ);

    p.triangle(...[-h * 0.5, 0, 0, -h * 0.5, h * 0.5, 0].map((x) => x / root2));
  };

  let largeValleyFold = (n) => {
    p.scale(paperScale);
    const θ = n * π;

    const a = scale([-1, 0, 0], 1 / root2);
    const b = scale([0, cos(θ), sin(θ)], 1 / root2);
    const c = scale([1, 0, 0], 1 / root2);
    const ifc = isFacingCamera([a, b, c]);

    p.background(background);

    p.fill(sideA);
    p.triangle(-root2 / 2, 0, 0, -root2 / 2, root2 / 2, 0);

    p.rotateX(θ);
    p.fill(ifc ? sideB : sideA);
    p.triangle(-root2 / 2, 0, 0, root2 / 2, root2 / 2, 0);
  };

  const x = 0.5 * (1 - h2);
  const y = 0.5 * h1;

  const tips3 = (() => {
    const tip = [0, -root2 / 2];
    const e2 = linearEquation(tip, [
      -oneMinusTanθ / (root2 * 2),
      -oneMinusTanθ / (root2 * 2),
    ]);

    const e5 = linearEquation(tip, [-tan(π / 4 - 2 * θ) / root2, 0]);

    const h4CreaseLine = [0, 1, ((1 - 0.5 * h4) * root2) / 2];

    /*
    const polygons = {
      a: [a, b, c, d],
      b: [b, c, f(c), f(b)],
      c: [f(a), f(b), f(c), f(d)],
      };
      */
  })();

  const tips2 = (() => {
    const e2 = linearEquation(
      [0, -root2 / 2],
      [-oneMinusTanθ / (root2 * 2), -oneMinusTanθ / (root2 * 2)]
    );

    const e5 = linearEquation(
      [0, -root2 / 2],
      [-tan(π / 4 - 2 * θ) / root2, 0]
    );

    const h3CreaseLine = [0, 1, ((1 - 0.5 * h3) * root2) / 2];
    const h4CreaseLine = [0, 1, ((1 - 0.5 * h4) * root2) / 2];
    const h5CreaseLine = [0, 1, ((1 - 0.5 * (2 * h4 - h3)) * root2) / 2];

    const tip = [0, -root2 / 2];

    const a = intersect(e2, h3CreaseLine).intersection;
    const b = intersect(e5, h3CreaseLine).intersection;
    const c = intersect(e5, h4CreaseLine).intersection;
    const d = intersect(e2, h4CreaseLine).intersection;

    const m = intersect(e2, h5CreaseLine).intersection;
    const n = intersect(e5, h5CreaseLine).intersection;

    const f = ([x, y]) => [-x, y];
    const polygons = [[a, d, f(d), f(a)]];

    const r1 = [0, -root2 / 2];
    const r2 = [(-root2 * tan(π / 4 - 2 * θ)) / 2, 0];

    return {
      polygons,
      triangles: {
        a: [c, d, tip],
        b: [c, f(c), tip],
        c: [f(c), f(d), tip],
        d: [d, f(d), tip],
      },
      polygons2: {
        a: [c, d, m, n],
        b: [c, n, f(n), f(c)],
        c: [f(c), f(d), f(m), f(n)],
      },

      polygons3: {
        a: [],
        b: [],
        c: [c, n, f(n), f(c)],
        d: [],
        e: [],
      },

      triangles2: {
        a: [m, n, tip],
        b: [n, f(n), tip],
        c: [f(m), f(n), tip],
      },
    };
  })();

  const {
    polygon1,
    polygon2,
    polygon3,
    polygon4,
    tip,
    quad1,
    petal,
    t1,
    t2,
    tips,
    toops,
    int8,
    int34,
  } = (() => {
    const top = [0, -root2 / 2];
    const p1 = [-oneMinusTanθ / (root2 * 2), -oneMinusTanθ / (root2 * 2)];
    const leftEdge = linearEquation([(-1 * root2) / 2, 0], top);
    // y = x
    const e1 = [1, -1, 0];
    const e2 = linearEquation(top, p1);
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
    const int24 = intersect(e2, e4).intersection;
    const e5 = linearEquation(top, [-tan(π / 4 - 2 * θ) / root2, 0]);

    const e6 = linearEquation(
      [0, -((1 - tan(θ)) * sin(2 * θ)) / sin((3 * π) / 4 - 2 * θ) / 2],
      p1
    );

    const h3CreaseLine = [0, 1, ((1 - 0.5 * h3) * root2) / 2];
    const int6 = intersect(e5, h3CreaseLine).intersection;
    const int7 = intersect(e2, h3CreaseLine).intersection;
    const int3 = intersect(e4, e3).intersection;
    const int34 = intersect(e3, e4).intersection;
    if (!int3) {
      throw new Error("no intersection 3");
    }
    const int4 = intersect([1, 0, 0], e4).intersection;
    if (!int4) {
      throw new Error("no intersection 4");
    }
    const h2CreaseLine = [0, 1, ((1 - 0.5 * h2) * root2) / 2];
    const int5 = intersect(e2, h2CreaseLine).intersection;
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

    const quad99 = [
      intersect(e1, leftEdge).intersection,
      intersect(e3, leftEdge).intersection,
      int3,
      int24,
      int,
    ];

    const t1 = [int2, intersect(e3, leftEdge).intersection, int5];
    const t99 = [int24, int3, intersect(e3, leftEdge).intersection, int5];
    const t2 = [intersect(e3, leftEdge).intersection, int5, top];
    const transform = ([x, y]) => {
      let tx = oneMinusTanθ / (2 * root2);
      let ty = oneMinusTanθ / (2 * root2);
      const v = [x + tx, y + ty, 0];
      let [xx, yy, zz] = rotateZ(v, θ + π / 4);
      return [xx, yy];
    };
    const tips = {
      a: [int6, int7, top],
      b: [int6, top, f(int6)],
      c: [f(int6), f(int7), f(top)],
      d: [int7, top, f(int7)],
    };
    const int8 = intersect(e6, e5).intersection;
    const toopA = [
      int6,
      int7,
      [-oneMinusTanθ / (2 * root2), -oneMinusTanθ / (2 * root2)],
      int8,
    ];
    const toops = {
      a: toopA,
      b: toopA.map(f),
    };

    const polygon1 = [[0, 0], int, int2, int3, int4, f(int3), f(int2), f(int)];
    const polygon99 = [[0, 0], int, int24, f(int24), f(int)];
    const polygon2 = [int4, int3, int2, int5, f(int5), f(int2), f(int3)];
    const polygon100 = [int24, int5, f(int5), f(int24)];

    return {
      polygon1: ccw(int, top, int34) ? polygon1 : polygon99,
      polygon2: ccw(int, top, int34) ? polygon2 : polygon100,
      polygon3: [int5, int7, f(int7), f(int5)],
      polygon4: [int4, int3, int2, int7, f(int7), f(int2), f(int3)],
      tip: [int5, top, f(int5)],
      quad1: (ccw(int, top, int34) ? quad : quad99).map(transform),
      t1: ccw(int, top, int34) ? t1.map(transform) : t99.map(transform),
      t2: t2.map(transform),
      petal: [
        [0, 0],
        [1 / cosθ, 0],
        [sinθ * tanθ, -sinθ],
      ],
      tips,
      toops,
      int8,
      int34,
    };
  })();
  let fold2 = (n) => {
    p.scale(paperScale);
    const θ = -n * π;
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

  const wings = (α, β) => {
    const dist = (0.5 * oneMinusTanθ * root2) / 2;
    const a = [-dist, -dist, 0];
    const b = [(-0.5 * root2) / 2, (-0.5 * root2) / 2, 0];
    const c = [0, (-1 * root2) / 2, 0];
    const k = normalize(sub(c, a));
    const wing1 = [a, b, c].map((p) => {
      let q = add(p, [dist, dist, 0]);
      let r = rotate(q, k, -1 * β);
      let s = add(r, [-dist, -dist, 0]);
      return s;
    });
    const wing2 = [a, b, c].map((p) => {});
    return wing1;
  };

  let petalFoldv2 = (n) => {
    p.scale(paperScale);

    const β = n * π;
    const α = f(β, stage4Estimate);
    stage4Estimate = α;

    p.background(background);

    p.push();
    p.fill(sideB);
    polygon(...polygon1);
    p.pop();

    p.fill(sideA);
    polygon(...polygon2);
    polygon(...tip);
    for (const x of [-1, 1]) {
      p.push();
      p.translate(
        (x * oneMinusTanθ) / (2 * root2),
        -oneMinusTanθ / (2 * root2)
      );
      p.rotateZ((x * -1 * π) / 4);

      p.fill(sideB);
      p.triangle(
        0,
        0,
        (x * -1 * oneMinusTanθ) / 2,
        0,
        (x * -1 * (c * cos2θ)) / 2,
        (-c * sin2θ) / 2
      );

      p.push();

      let wing1 = wings(α, β);
      const ifc = isFacingCamera(wing1);
      p.rotateZ(x * (θ + halfPi));
      p.rotateX(-β);
      let m = ([a, b]) => [a * -1 * x, b];
      if (ifc) {
        p.fill(sideB);
        polygon(...quad1.map(m));
        p.fill(sideA);
        polygon(...t1.map(m));
        polygon(...t2.map(m));
      } else {
        p.fill(sideB);
        p.triangle(
          0,
          0,
          (x * -1 * 1) / (2 * cosθ),
          0,
          (x * -1 * (sinθ * tanθ)) / 2,
          -sinθ / 2
        );
      }

      p.pop();
      p.rotateZ(x * 2 * θ);

      p.rotateX(-1 * (π - α));
      p.fill(sideB);
      p.triangle(0, 0, (x * -1 * c) / 2, 0, (x * -1 * tanθ) / 2, -1 / 2);

      p.rotateZ(x * -1 * (θ - halfPi));
      p.rotateX(β);

      p.fill(sideB);
      p.triangle(
        0,
        0,
        (x * -1 * 1) / (2 * cosθ),
        0,
        (x * -1 * (sinθ * tanθ)) / 2,
        -sinθ / 2
      );
      p.pop();
    }
  };

  const dur = 100.0;
  let stages = [
    /*
     */
    {
      duration: 0,
      draw: () => {},
    },
    {
      duration: 0.0 * dur,
      draw: paper,
    },
    {
      duration: 1.0 * dur,
      draw: largeValleyFold,
    },
    {
      duration: 1.0 * dur,
      draw: smallValley1,
    },
    {
      duration: 1.0 * dur,
      draw: smallValley2,
    },
    {
      duration: 1.0 * dur,
      draw: fold2,
    },

    {
      duration: 1.0 * dur,
      draw: petalFoldv2,
    },
    {
      duration: 1 * dur,
      draw: smallValley3,
    },
    {
      duration: 1 * dur,
      draw: smallValley4,
    },
    {
      duration: 1 * dur,
      draw: smallMountain1,
    },
    {
      duration: 10 * dur,
      draw: mountain2,
    },
    /*
     */
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

const params = new URLSearchParams(document.location.search);
switch (window.location.pathname) {
  case "/crease":
    new p5(
      crease({
        background: parseInt(params.get("background") || "200"),
        height: parseInt(params.get("height") || 500),
        light: params.get("light") || "lightyellow",
      }),
      containerElement
    );
    break;
  case "/folds":
    new p5(
      folds({
        thetaDivisor: parseFloat(params.get("t") || "12"),
        background: parseInt(params.get("background") || "200"),
        height: parseInt(params.get("height") || "500"),
        light: params.get("light") || "lightyellow",
        paperScale: parseFloat(params.get("paperScale") || "0.5"),
      }),
      containerElement
    );
    break;
  default:
    new p5(sketch, containerElement);
    break;
}
