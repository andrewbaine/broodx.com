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
  θ: π / 15,
  h1Normalized: 1.0,
  h2Normalized: 0.0,
  h3Normalized: 1.0,
  h4Normalized: 0.4,
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
const sideA = "orange";
const sideB = "white";

const sketch = (p) => {
  const height = 600;
  const paperScale = 400;

  const cameraEyeX = 0;
  const cameraEyeY = 0;
  const cameraEyeZ = height / 2 / tan(Math.PI / 6);
  const cameraCoordinates = [cameraEyeY, cameraEyeX, cameraEyeZ].map(
    (x) => x / paperScale
  );

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
    if (h2 > h3) {
      polygon(...polygon2);
      polygon(...polygon3);
    } else {
      polygon(...polygon4);
    }
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
    if (h2 > h3) {
      polygon(...polygon2);
      polygon(...polygon3);
    } else {
      polygon(...polygon4);
    }

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
    p.stroke("lightblue");
    p.scale(paperScale);
    p.background(background);
    p.push();
    p.fill(sideB);
    polygon(...polygon1);

    p.fill(sideA);
    if (h2 > h3) {
      polygon(...polygon2);
      polygon(...polygon3);
    } else {
      polygon(...polygon4);
    }

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
      [0, (-1 * root2) / 2],
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

    console.log({ m, n });

    const f = ([x, y]) => [-x, y];
    const polygons = [[a, d, f(d), f(a)]];
    console.log(polygons[0]);
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
  } = (() => {
    const leftEdge = linearEquation(
      [(-1 * root2) / 2, 0],
      [0, (-1 * root2) / 2]
    );
    // y = x
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
    const e5 = linearEquation(
      [0, -root2 / 2],
      [-tan(π / 4 - 2 * θ) / root2, 0]
    );

    const e6 = linearEquation(
      [0, -((1 - tan(θ)) * sin(2 * θ)) / sin((3 * π) / 4 - 2 * θ) / 2],
      [-oneMinusTanθ / (root2 * 2), -oneMinusTanθ / (root2 * 2)]
    );

    const h3CreaseLine = [0, 1, ((1 - 0.5 * h3) * root2) / 2];
    const int6 = intersect(e5, h3CreaseLine).intersection;
    const int7 = intersect(e2, h3CreaseLine).intersection;
    const int3 = intersect(e4, e3).intersection;
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
    const t1 = [int2, intersect(e3, leftEdge).intersection, int5];
    const t2 = [
      intersect(e3, leftEdge).intersection,
      int5,
      [0, (-1 * root2) / 2],
    ];
    const transform = ([x, y]) => {
      let tx = oneMinusTanθ / (2 * root2);
      let ty = oneMinusTanθ / (2 * root2);
      const v = [x + tx, y + ty, 0];
      let [xx, yy, zz] = rotateZ(v, θ + π / 4);
      return [xx, yy];
    };
    const tippyTop = [0, -root2 / 2];
    const tips = {
      a: [int6, int7, tippyTop],
      b: [int6, tippyTop, f(int6)],
      c: [f(int6), f(int7), f(tippyTop)],
      d: [int7, tippyTop, f(int7)],
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

    return {
      polygon1: [[0, 0], int, int2, int3, int4, f(int3), f(int2), f(int)],
      polygon2: [int4, int3, int2, int5, f(int5), f(int2), f(int3)],
      polygon3: [int5, int7, f(int7), f(int5)],
      polygon4: [int4, int3, int2, int7, f(int7), f(int2), f(int3)],
      tip: [int5, tippyTop, f(int5)],
      quad1: quad.map(transform),
      t1: t1.map(transform),
      t2: t2.map(transform),
      petal: [
        [0, 0],
        [1 / cosθ, 0],
        [sinθ * tanθ, -sinθ],
      ],
      tips,
      toops,
      int8,
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
    if (n > 0.75) return;
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

  const dur = 333.0;
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
