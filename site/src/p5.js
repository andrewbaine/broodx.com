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

const reflectY = ([x, y]) => [-x, y];

const unit = (n) => {
  if (n < 0) {
    return 0;
  }
  if (n > 1) {
    return 1;
  }
  return n;
};

const cartesian = (r, θ) => {
  return {
    x: r * Math.cos(θ),
    y: r * Math.sin(θ),
  };
};

const xAxis = [1, 0, 0];

const background = 200;
const lightSide = "white";
const darkSide = "pink";

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

const sketch = ({ height }) => {
  const judgments = {
    θ: π / 12,
    h1Normalized: 1.0,
    h3Normalized: 0.8,
    h4Normalized: 0.3,
    headTopNormalized: 0.0,
    headBottomNormalized: 0.0,
  };
  const θ = judgments.θ;
  const cosθ = cos(θ);
  const sinθ = sin(θ);
  const tanθ = sinθ / cosθ;
  const cos2θ = cos(2 * θ);
  const sin2θ = sin(2 * θ);

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
  const θ2 = π / 4 - 2 * θ;
  const origin = [0, 0];
  const e45 = [1, -1, 0];

  const e45Neg = [1, 1, 0];
  const tipp = [0, -root2 / 2];
  const petalTip = add(tipp, [-sin(θ2), cos(θ2)]);
  const petalP1 = mid(tipp, petalTip);
  const biggestH1 = Math.abs(-root2 / 2 - petalP1[1]) * root2;
  const h1 = biggestH1 * judgments.h1Normalized;
  const h2 = 1.5 * h1;
  const h2CreaseLine = [0, 1, ((1 - 0.5 * h2) * root2) / 2];
  const h1CreaseLine = [0, 1, ((1 - 0.5 * h1) * root2) / 2];

  const headHeight = 2 * (h2 - 0.5 * h1);
  const h3 = judgments.h3Normalized * 2 * (h2 - 0.5 * h1);
  const h3CreaseLine = [0, 1, ((1 - 0.5 * h3) * root2) / 2];
  const headSize = headHeight - h3;

  const h4 = (() => {
    let [min, max] = 0.5 * h3 < headSize ? [0.5 * h3, h3] : [h3 - headSize, h3];
    return min + judgments.h4Normalized * (max - min);
  })();

  const headHeightLine = [0, -1, ((h1 - 1) * root2) / 2];
  const headDiagonal = [1, -1, ((-1 + h2) * root2) / 2];
  const headPointThatMayBeHidden = intersect(
    headDiagonal,
    headHeightLine
  ).intersection;
  const eLeft = linearEquation(tipp, [(-tan(θ2) * root2) / 2, 0]);
  const eRight = linearEquation(tipp, [(tan(θ2) * root2) / 2, 0]);

  const transpose = ([x, y]) => [-x, y];

  const bodyTopLeft = intersect(eLeft, [
    0,
    1,
    ((1 - 0.5 * h3) * root2) / 2,
  ]).intersection;
  const bodyTopRight = transpose(bodyTopLeft);

  const bodyLeft = intersect(e45, eLeft).intersection;

  const headPointIsIndeedHidden = ccw(
    bodyTopLeft,
    bodyLeft,
    headPointThatMayBeHidden
  );

  const v = [cos2θ, sin2θ, 0];
  const k = [-sinθ, cosθ, 0];
  const k1 = [-sinθ, -cosθ, 0];
  const petalP2 = [
    0,
    -((1 - tan(θ)) * sin(2 * θ)) / sin((3 * π) / 4 - 2 * θ) / 2,
  ];

  const petalP3 = intersect(
    linearEquation(petalTip, petalP2),
    e45
  ).intersection;

  const wingLeft = intersect(
    linearEquation(petalP1, petalP2),
    e45
  ).intersection;
  const crux = wingLeft;
  const cruxTipLine = linearEquation(crux, tipp);
  const cruxRight = reflectY(crux);

  const petalFoldHeadTopY = (-1 + 0.5 * h2) / root2;
  const petalFoldHeadBottomY = (-1 + h1) / root2;
  const petalFoldHeadTopLeft = intersect(
    linearEquation(crux, tipp),
    h2CreaseLine
  ).intersection;
  const petalFoldBody =
    petalFoldHeadTopY > crux[1]
      ? [
          origin,
          [petalFoldHeadTopY, petalFoldHeadTopY],
          [-petalFoldHeadTopY, petalFoldHeadTopY],
        ]
      : [
          origin,
          crux,
          petalFoldHeadTopLeft,
          reflectY(petalFoldHeadTopLeft),
          reflectY(crux),
        ];

  const petalFoldHeadBottomLeft = intersect(
    petalFoldHeadBottomY > crux[1] ? e45 : linearEquation(crux, tipp),
    [0, 1, ((1 - h1) * root2) / 2]
  ).intersection;

  const petalFoldHead = (() => {
    if (petalFoldHeadTopY < crux[1]) {
      if (petalFoldHeadBottomY < crux[1]) {
        if (
          ccw(tipp, crux, intersect(headDiagonal, headHeightLine).intersection)
        ) {
          return [
            petalFoldHeadBottomLeft,
            petalFoldHeadTopLeft,
            reflectY(petalFoldHeadTopLeft),
            reflectY(petalFoldHeadBottomLeft),
          ];
        } else {
          return [
            intersect(headDiagonal, headHeightLine).intersection,
            intersect(headDiagonal, cruxTipLine).intersection,
            intersect(cruxTipLine, h2CreaseLine).intersection,
            reflectY(intersect(cruxTipLine, h2CreaseLine).intersection),
            reflectY(intersect(headDiagonal, cruxTipLine).intersection),
            reflectY(intersect(headDiagonal, headHeightLine).intersection),
          ];
        }
      } else {
        if (h2 < 1) {
          return [
            intersect(headDiagonal, headHeightLine).intersection,
            intersect(headDiagonal, cruxTipLine).intersection,
            intersect(cruxTipLine, h2CreaseLine).intersection,
            reflectY(intersect(cruxTipLine, h2CreaseLine).intersection),
            reflectY(intersect(headDiagonal, cruxTipLine).intersection),
            reflectY(intersect(headDiagonal, headHeightLine).intersection),
          ];
        } else {
          return [
            petalFoldHeadBottomLeft,
            crux,
            petalFoldHeadTopLeft,
            reflectY(petalFoldHeadTopLeft),
            reflectY(crux),
            reflectY(petalFoldHeadBottomLeft),
          ];
        }
      }
    } else {
      return [
        petalFoldHeadBottomLeft,
        petalFoldHeadTopLeft,
        reflectY(petalFoldHeadTopLeft),
        reflectY(petalFoldHeadBottomLeft),
      ];
    }
  })();

  return (p) => {
    const paperScale = (2 * height) / 3;

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

    const paper = (p) => (n) => {
      p.fill(lightSide);
      polygon(
        ...[
          [-root2 / 2, 0],
          [0, -root2 / 2],
          [root2 / 2, 0],
          [0, root2 / 2],
        ]
      );
    };

    let smallValley2 = (n) => {
      let h = h2;
      const θ = n * π;
      p.fill(darkSide);
      polygon(
        ...[
          [-1, 0],
          [1, 0],
          [h * 0.5, -1 + h * 0.5],
          [-h * 0.5, -1 + h * 0.5],
        ].map((p) => p.map((x) => x / root2))
      );

      if (2 * h1 > h2) {
        p.fill(lightSide);
        triangle(
          ...[
            [-h1 + h2 * 0.5, -1 + h2 * 0.5],
            [0, -1 + h2 * 0.5 + (h1 - h2 * 0.5)],
            [h1 - h2 * 0.5, -1 + h2 * 0.5],
          ].map((p) => p.map((x) => x / root2))
        );
      }

      p.fill(lightSide);
      p.triangle(
        ...[h * 0.5, -1 + h * 0.5, 0, -1, -h * 0.5, -1 + h * 0.5].map(
          (x) => x / root2
        )
      );

      p.translate(0, (-1 + h * 0.5) / root2);
      p.fill(lightSide);

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
        p.fill(lightSide);
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
        p.fill(darkSide);
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
        p.fill(lightSide);
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
      console.log("smallValley3");
      const α = 0.0;
      const β = π;
      p.push();
      p.fill(darkSide);
      //      polygon(...polygon1);

      p.fill(lightSide);
      //      polygon(...polygon2);

      for (const x of [-1, 1]) {
        p.push();
        p.translate(
          (x * oneMinusTanθ) / (2 * root2),
          -oneMinusTanθ / (2 * root2)
        );
        p.rotateZ((x * -1 * π) / 4);

        p.fill(darkSide);
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
          p.fill(darkSide);
          polygon(...quad1.map(m));
          p.fill(lightSide);
          polygon(...t1.map(m));
          polygon(...t2.map(m));
        }

        p.pop();
        p.rotateZ(x * 2 * θ);

        p.rotateX(-1 * (π - α));
        p.fill(darkSide);
        p.triangle(0, 0, (x * -1 * c) / 2, 0, (x * -1 * tanθ) / 2, -1 / 2);

        p.rotateZ(x * -1 * (θ - halfPi));
        p.rotateX(β);

        p.fill(darkSide);
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

      p.fill(darkSide);
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
        p.fill(darkSide);
        triangle(...tips.a.map(t));
        p.fill(lightSide);
        triangle(...tips.b.map(t));
        p.fill(darkSide);
        triangle(...tips.c.map(t));
      } else {
        p.fill(darkSide);
        triangle(...tips.d.map(t));
      }
    };

    const smallValley4 = (n) => {
      const α = 0.0;
      const β = π;
      p.push();
      p.fill(darkSide);
      polygon(...polygon1);

      p.fill(lightSide);
      polygon(...polygon2);

      for (const x of [-1, 1]) {
        p.push();
        p.translate(
          (x * oneMinusTanθ) / (2 * root2),
          -oneMinusTanθ / (2 * root2)
        );
        p.rotateZ((x * -1 * π) / 4);

        p.fill(darkSide);
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
          p.fill(darkSide);
          polygon(...quad1.map(m));
          p.fill(lightSide);
          polygon(...t1.map(m));
          polygon(...t2.map(m));
        } else {
          p.fill(darkSide);
        }

        p.pop();
        p.rotateZ(x * 2 * θ);

        p.rotateX(-1 * (π - α));
        p.fill(darkSide);
        p.triangle(0, 0, (x * -1 * c) / 2, 0, (x * -1 * tanθ) / 2, -1 / 2);

        p.rotateZ(x * -1 * (θ - halfPi));
        p.rotateX(β);

        p.fill(darkSide);
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

      p.fill(darkSide);
      polygon(...toops.a);
      polygon(...toops.b);

      const ty = ((1 - 0.5 * h3) * root2) / 2;
      p.translate(0, -ty);

      p.push();

      p.rotateX(-π);

      p.fill(darkSide);
      const t = ([x, y]) => {
        return [x, y + ty];
      };
      let tips2Polys = tips2.polygons.map((x) => x.map(t));
      p.fill(darkSide);
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
        p.fill(darkSide);
        triangle(...tips2.triangles.a.map(t));
        p.fill(lightSide);
        triangle(...tips2.triangles.b.map(t));
        p.fill(darkSide);
        triangle(...tips2.triangles.c.map(t));
        p.pop();
      } else {
        p.fill(darkSide);
        triangle(...tips2.triangles.d.map(t));
      }
    };

    const smallMountain1 = (n) => {
      const α = 0.0;
      const β = π;
      p.push();
      p.fill(darkSide);
      polygon(...polygon1);

      p.fill(lightSide);
      polygon(...polygon2);

      for (const x of [-1, 1]) {
        p.push();
        p.translate(
          (x * oneMinusTanθ) / (2 * root2),
          -oneMinusTanθ / (2 * root2)
        );
        p.rotateZ((x * -1 * π) / 4);

        p.fill(darkSide);
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
          p.fill(darkSide);
          polygon(...quad1.map(m));
          p.fill(lightSide);
          polygon(...t1.map(m));
          polygon(...t2.map(m));
        } else {
          p.fill(darkSide);
        }

        p.pop();
        p.rotateZ(x * 2 * θ);

        p.rotateX(-1 * (π - α));
        p.fill(darkSide);
        p.triangle(0, 0, (x * -1 * c) / 2, 0, (x * -1 * tanθ) / 2, -1 / 2);

        p.rotateZ(x * -1 * (θ - halfPi));
        p.rotateX(β);

        p.fill(darkSide);
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

      p.fill(darkSide);
      polygon(...toops.a);
      polygon(...toops.b);

      const ty = ((1 - 0.5 * h3) * root2) / 2;
      p.translate(0, -ty);

      p.push();

      p.rotateX(-π);

      p.fill(darkSide);
      const t = ([x, y]) => {
        return [x, y + ty];
      };

      let tips2Polys = tips2.polygons.map((x) => x.map(t));
      p.fill(darkSide);
      polygon(...tips2Polys[0]);

      let t2 = ((h4 - h3) * 0.5) / root2;
      p.translate(0, t2);
      p.rotateX(π);
      p.translate(0, -t2);

      p.fill(darkSide);
      polygon(...tips2.polygons2.a.map(t));
      p.fill(lightSide);
      polygon(...tips2.polygons2.b.map(t));
      p.fill(darkSide);
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
        p.fill(darkSide);
        triangle(...tips2.triangles2.a.map(t));
        p.fill(lightSide);
        triangle(...tips2.triangles2.b.map(t));
        p.fill(darkSide);
        triangle(...tips2.triangles2.c.map(t));
        p.pop();
      }
    };

    const smallMountain1v2 = (n) => {
      console.log("smallMountain1v2");
      mountain2(0);
      const h = 2 * h4 - h3;
      const [c, d] = mt(h);

      const p1 = [c, (-1 + 0.5 * h3) / root2, 0];
      const p2 = [0, (-1 + h3 - h4) / root2, 0];
      const p3 = [-c, (-1 + 0.5 * h3) / root2, 0];

      const ifc = isFacingCamera(
        [p1, p2, p3].map((p) => {
          let translate = [0.0, (-0.5 * h3) / root2, 0.0];
          let q = sub(p, translate);
          let r = rotateX(q, n * π);
          let s = add(r, translate);
          return s;
        })
      );
      if (ifc) {
        const height = -(0.5 * h) / root2;
        p.translate(0, (-1 + 0.5 * h3) / root2);

        p.rotateX(n * π);
        p.fill(darkSide);
        p.triangle(c, 0, 0, height, d, 0);
        p.triangle(-c, 0, 0, height, -d, 0);
        p.fill(lightSide);
        p.triangle(d, 0, 0, height, -d, 0);
      }
    };

    let smallValley1 = (n) => {
      const h = h1;
      const θ = n * π;

      p.fill(darkSide);
      polygon(
        ...[
          [-1, 0],
          [1, 0],
          [h * 0.5, -1 + h * 0.5],
          [-h * 0.5, -1 + h * 0.5],
        ].map((point) => point.map((x) => x / root2))
      );

      p.fill(lightSide);
      p.triangle(
        ...[h * 0.5, -1 + h * 0.5, 0, -1, -h * 0.5, -1 + h * 0.5].map(
          (x) => x / root2
        )
      );

      p.translate(0, (-1 + h * 0.5) / root2);
      p.fill(lightSide);

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

      p.fill(ifc ? lightSide : darkSide);
      p.rotateX(-θ);

      p.triangle(
        ...[-h * 0.5, 0, 0, -h * 0.5, h * 0.5, 0].map((x) => x / root2)
      );
    };

    let largeValleyFold = (n) => {
      const θ = n * π;

      const a = scale([-1, 0, 0], 1 / root2);
      const b = scale([0, cos(θ), sin(θ)], 1 / root2);
      const c = scale([1, 0, 0], 1 / root2);
      const ifc = isFacingCamera([a, b, c]);

      p.background(background);

      p.fill(lightSide);
      p.triangle(-root2 / 2, 0, 0, -root2 / 2, root2 / 2, 0);

      p.rotateX(θ);
      p.fill(ifc ? darkSide : lightSide);
      p.triangle(-root2 / 2, 0, 0, root2 / 2, root2 / 2, 0);
    };

    const y = 0.5 * h1;

    const tips3 = (() => {
      const tip = [0, -root2 / 2];
      const e2 = linearEquation(tip, [
        -oneMinusTanθ / (root2 * 2),
        -oneMinusTanθ / (root2 * 2),
      ]);

      const e5 = linearEquation(tip, [-tan(π / 4 - 2 * θ) / root2, 0]);

      const h4CreaseLine = [0, 1, ((1 - 0.5 * h4) * root2) / 2];
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
      petalLayer1,
      petalLayer2,
      petalLayer3,
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

      const polygon1 = [
        [0, 0],
        int,
        int2,
        int3,
        int4,
        f(int3),
        f(int2),
        f(int),
      ];
      const polygon99 = [[0, 0], int, int24, f(int24), f(int)];
      const polygon2 = [int4, int3, int2, int7, f(int7), f(int2), f(int3)];
      const polygon3 = [int5, int7, f(int7), f(int5)];
      const polygon100 = [int24, int5, f(int5), f(int24)];

      const petalLayer1 = [
        top,
        crux,
        intersect(e45, linearEquation([-root2 / 2, 0], [0, -root2 / 2]))
          .intersection,
      ];
      const squareCorner = intersect(
        e45,
        linearEquation([-root2 / 2, 0], [0, -root2 / 2])
      ).intersection;
      const ghi = intersect(
        h2CreaseLine,
        linearEquation([-root2 / 2, 0], [0, -root2 / 2])
      ).intersection;

      const def = intersect(
        h2CreaseLine,
        linearEquation(tipp, crux)
      ).intersection;

      const petalLayer2 = ccw(crux, squareCorner, ghi)
        ? [crux, squareCorner, ghi, def]
        : [crux, def, intersect(h2CreaseLine, e45).intersection];
      console.log(ccw(crux, squareCorner, ghi));
      const petalLayer3 = ccw(crux, squareCorner, ghi)
        ? ccw(crux, tipp, intersect(headHeightLine, headDiagonal).intersection)
          ? [
              intersect(
                h2CreaseLine,
                linearEquation([-root2 / 2, 0], [0, -root2 / 2])
              ).intersection,
              intersect(h2CreaseLine, linearEquation(tipp, crux)).intersection,
              intersect(headDiagonal, linearEquation(tipp, crux)).intersection,
            ]
          : [
              intersect(headHeightLine, headDiagonal).intersection,
              intersect(
                h2CreaseLine,
                linearEquation([-root2 / 2, 0], [0, -root2 / 2])
              ).intersection,
              def,
            ]
        : crux[1] > petalFoldHeadBottomY
        ? [
            ghi,
            def,
            intersect(
              headHeightLine,
              linearEquation([-root2 / 2, 0], [0, -root2 / 2])
            ).intersection,
            intersect(headHeightLine, linearEquation(tipp, crux)).intersection,
          ]
        : petalLayer2;

      return {
        petalLayer1: petalLayer1.map(transform),
        petalLayer2: petalLayer2.map(transform),
        petalLayer3: petalLayer3.map(transform),
        polygon1: ccw(int, top, int34) ? polygon1 : polygon99,
        polygon2: ccw(int, top, int34) ? polygon2 : polygon100,
        polygon3: polygon3,
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
      const θ = -n * π;
      p.fill(lightSide);
      polygon(
        [0, 0],
        [-0.5 / root2, -0.5 / root2],
        [0, -1 / root2],
        [0.5 / root2, -0.5 / root2]
      );
      if (h2 < 1) {
        polygon(
          intersect(h2CreaseLine, headDiagonal).intersection,

          intersect(headHeightLine, headDiagonal).intersection,
          reflectY(intersect(headHeightLine, headDiagonal).intersection),
          reflectY(intersect(h2CreaseLine, headDiagonal).intersection)
        );
      } else {
        polygon(
          intersect(h2CreaseLine, e45).intersection,

          intersect(headHeightLine, e45).intersection,
          reflectY(intersect(headHeightLine, e45).intersection),
          reflectY(intersect(h2CreaseLine, e45).intersection)
        );
      }
      /*      polygon(
        [-0.5 / root2, -0.5 / root2],
        [0, 0],
        [0.5 / root2, -0.5 / root2],
        [(0.5 - x) / root2, (-0.5 - x) / root2],
        [y / root2, (-1 + h1) / root2],
        [-y / root2, (-1 + h1) / root2],
        [(-0.5 + x) / root2, (-0.5 - x) / root2]
        );
        */
      p.fill(lightSide);
      /*
      polygon(
        [(0.5 - x) / root2, (-0.5 - x) / root2],
        [y / root2, (-1 + h1) / root2],
        [-y / root2, (-1 + h1) / root2],
        [(-0.5 + x) / root2, (-0.5 - x) / root2]
        );
        */
      /*
      p.triangle(
        (0.5 - x) / root2,
        (-0.5 - x) / root2,
        (-0.5 + x) / root2,
        (-0.5 - x) / root2,
        0,
        -1 / root2
        );
      */
      p.fill(darkSide);
      p.push();
      p.rotateZ((-3 * π) / 4);

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
      const β = n * π;
      const α = f(β, stage4Estimate);
      stage4Estimate = α;

      // this is the big white background
      p.fill(lightSide);
      polygon(origin, crux, tipp, cruxRight);

      // this is the pink body
      p.fill(darkSide);
      polygon(...petalFoldBody);

      p.fill(lightSide);
      polygon(...petalFoldHead);
      for (const x of [-1, 1]) {
        p.push();
        p.translate(
          (x * oneMinusTanθ) / (2 * root2),
          -oneMinusTanθ / (2 * root2)
        );
        p.rotateZ((x * -1 * π) / 4);

        p.fill(darkSide);
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
          p.fill(lightSide);
          polygon(...petalLayer1.map(m));
          p.fill(darkSide);
          polygon(...petalLayer2.map(m));
          p.fill(lightSide);
          polygon(...petalLayer3.map(m));
        } else {
          p.fill(darkSide);
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
        p.fill(darkSide);
        p.triangle(0, 0, (x * -1 * c) / 2, 0, (x * -1 * tanθ) / 2, -1 / 2);

        p.rotateZ(x * -1 * (θ - halfPi));
        p.rotateX(β);

        p.fill(darkSide);
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

    const head = headPointIsIndeedHidden
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
    let eyeA = [];
    let eyeB = [];
    let eyeC = [];
    let eyeD = [];
    const wing = [
      petalTip,
      wingLeft,
      wingTopLeft,
      intersect(h3CreaseLine, linearEquation(tipp, petalTip)).intersection,
    ];

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

    const petalTriangle = [petalTip, petalP1, petalP2];

    const lastLittleTriangle = (() => {
      let pp = [-oneMinusTanθ / (2 * root2), -oneMinusTanθ / (2 * root2)];
      let pp2 = scale(sub(pp, wingLeft), 2);
      let pp3 = add(pp, pp2);
      let eq = linearEquation(
        petalTip,
        add(wingLeft, scale(sub(petalP1, wingLeft), 2))
      );
      let ppx = intersect(e45, eq).intersection;
      let [kx, ky] = sub(petalP1, petalTip);
      let kk = normalize([kx, ky, 0]);
      let [vvx, vvy] = sub(ppx, petalTip);
      let ppx2 = rotate([vvx, vvy, 0], kk, π);
      let ppx3 = add(ppx2, petalTip);
      let [vva, vvb] = sub(petalP3, petalTip);
      let ppx4 = rotate([vva, vvb, 0], kk, π);
      let ppx5 = add(ppx4, petalTip);
      return [petalTip, ppx3, ppx5];
    })();

    const mountain2 = (n) => {
      p.fill(darkSide);
      polygon(...body1);

      p.push();
      p.fill(lightSide);
      polygon(...head);
      p.pop();
      p.fill(darkSide);

      triangle(...petalTriangle);
      triangle(...petalTriangle.map(reflectY));

      p.push();

      polygon(...eyeA);
      p.fill(lightSide);
      polygon(...head2);

      p.fill(darkSide);
      polygon(...eyeB);
      polygon(...eyeB.map(transpose));

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
      const p4 = [p3[0] + tx, p3[1] + ty, 0];

      const ifc = isFacingCamera(
        [petalTip, petalP1, p4].map(([x, y]) => [x, y, 0])
      );

      for (const reflect of [true, false]) {
        p.push();
        p.translate(tx * (reflect ? -1 : 1), ty);
        p.rotateZ((-π / 4 - 2 * θ) * (reflect ? -1 : 1));
        p.rotateX(n * π);
        if (!ifc) {
          polygon(
            ...wing.map(tt).map(([x, y]) => (reflect ? [-x, y] : [x, y]))
          );
          polygon(
            ...eyeC.map(tt).map(([x, y]) => (reflect ? [-x, y] : [x, y]))
          );
          polygon(
            ...eyeD.map(tt).map(([x, y]) => (reflect ? [-x, y] : [x, y]))
          );
        } else {
          p.fill(darkSide);
          triangle(
            ...lastLittleTriangle
              .map(tt)
              .map(([x, y]) => (reflect ? [-x, y] : [x, y]))
          );
        }
        p.pop();
      }
    };

    const smallValley4v2 = (n) => {
      console.log("smallValley4v2");
      p.fill(darkSide);
      polygon(...body1);

      p.fill(lightSide);
      polygon(...head);

      p.fill(darkSide);
      triangle(...petalTriangle);
      triangle(...petalTriangle.map(reflectY));
      polygon(...wing);
      polygon(...wing.map(reflectY));
      polygon(
        wingTopLeft,
        eyeAPointThatMayBeInView,
        reflectY(eyeAPointThatMayBeInView),
        reflectY(wingTopLeft)
      );
      const ty = (-1 + 0.5 * (2 * h3 - h4)) / root2;
      const ifc = isFacingCamera(
        [
          [-1, 0],
          [1, 0],
          [0, -1],
        ].map(([x, y]) => {
          let q = rotateX([x, y, 0], n * π);
          let r = add(q, [0, ty, 0]);
          return r;
        })
      );
      p.translate(0, ty);
      const [a, b] = mt(h4);
      p.rotateX(n * π);
      const h = (0.5 * h4) / root2;
      if (ifc) {
        p.fill(darkSide);
        triangle([a, 0], [0, h], [b, 0]);
        p.fill(lightSide);
        triangle([b, 0], [0, h], [-b, 0]);
        p.fill(darkSide);
        triangle([-a, 0], [0, h], [-b, 0]);
      } else {
        p.fill(darkSide);
        triangle([a, 0], [0, h], [-a, 0]);
      }
    };

    const smallValley3v2 = (n) => {
      console.log("smallValley4v2");
      p.fill(darkSide);
      polygon(...body1);

      p.fill(lightSide);
      polygon(...head);

      p.fill(darkSide);
      triangle(...petalTriangle);
      triangle(...petalTriangle.map(reflectY));
      polygon(...wing);
      polygon(...wing.map(reflectY));
      /*      polygon(
        wingTopLeft,
        eyeAPointThatMayBeInView,
        reflectY(eyeAPointThatMayBeInView),
        reflectY(wingTopLeft)
      );
      */

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
        p.fill(darkSide);
        triangle(...tips.a.map(t));
        p.fill(lightSide);
        triangle(...tips.b.map(t));
        p.fill(darkSide);
        triangle(...tips.c.map(t));
      } else {
        p.fill(darkSide);
        triangle(...tips.d.map(t));
      }
    };

    const pauseBegin = (f) => (n) => f(0);
    const pauseEnd = (f) => (n) => f(1);

    const stages = [
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
        duration: 0.0 * dur,
        draw: pauseBegin(petalFoldv2),
      },
      {
        duration: 1.0 * dur,
        draw: petalFoldv2,
      },
      {
        duration: 0.0 * dur,
        draw: pauseEnd(petalFoldv2),
      },
      {
        duration: 0 * dur,
        draw: pauseBegin(smallValley3),
      },
      {
        duration: 0 * dur,
        draw: smallValley3,
      },
      {
        duration: 0 * dur,
        draw: pauseEnd(smallValley3),
      },
      {
        duration: 1 * dur,
        draw: smallValley3v2,
      },
      {
        duration: 0 * dur,
        draw: pauseBegin(smallValley4v2),
      },
      {
        duration: 1 * dur,
        draw: smallValley4v2,
      },
      {
        duration: 0 * dur,
        draw: pauseEnd(smallValley4v2),
      },
      {
        duration: 0 * dur,
        draw: pauseBegin(smallMountain1v2),
      },
      {
        duration: 1 * dur,
        draw: smallMountain1v2,
      },
      {
        duration: 0 * dur,
        draw: pauseEnd(smallMountain1v2),
      },
      {
        duration: 0 * dur,
        draw: pauseBegin(mountain2),
      },
      {
        duration: 1 * dur,
        draw: mountain2,
      },
      {
        duration: 1 * dur,
        draw: pauseEnd(mountain2),
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
        p.scale(paperScale);
        p.background(background);
        currentStage.draw(n);
      }
    };
  };
};

const debug = ({ background, stage, height, n }) => {
  return (p) => {
    p.setup = function () {
      p.createCanvas(height, height, p.WEBGL);
    };
    p.draw = () => {
      p.background(background);
    };
  };
};

const containerElement = document.getElementById("main");
const params = new URLSearchParams(document.location.search);
let height;
let dur;
switch (window.location.pathname) {
  case "/debug":
    height = parseInt(params.get("height") || "500");
    const background = parseInt(params.get("background") || "200");
    const stage = parseInt(params.get("stage") || "0");
    const start = parseFloat(params.get("start") || "0");
    const end = parseFloat(params.get("end") || "1");
    new p5(debug({ height, background, stage, start, end }), containerElement);
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
    dur = parseFloat(params.get("dur") || "1000");
    height = parseInt(params.get("height") || "500");
    new p5(sketch({ dur, height }), containerElement);
    break;
}
