import p5 from "p5";
import mnr from "./mnr.js";
import {
  add,
  cross,
  normalize,
  mid,
  rotate,
  rotateX,
  scale,
  sub,
  sum,
  dot,
} from "./vector.js";

const π = Math.PI;
const halfPi = π / 2;

const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;

const root2 = Math.sqrt(2);

const height = 600;

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

  let camera;

  const b = ((1 - tan(θ)) * sin(2 * θ)) / sin((3 * π) / 4 - 2 * θ);

  const c = (1 - tan(θ)) / (Math.sqrt(2) * sin((3 * π) / 4 - 2 * θ));
  let size = 250;
  p.setup = function () {
    p.createCanvas(height, height, p.WEBGL);
    camera = p.createCamera();
  };

  let paper = (n) => {
    const scale = root2 * size;
    p.scale(root2 * size);
    p.rotateZ(π / 4);
    p.translate(-0.5, -0.5);
    p.background(background);
    p.fill(sideA);
    p.rect(0, 0, 1, 1);
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

  const h1 = 0.3;
  const h2 = 0.9;

  let smallValley2 = (n) => {
    let h = h2;
    const θ = n * π;
    p.background(background);

    p.scale(size);
    p.fill(sideB);
    p.beginShape();
    p.vertex(-1, 0);
    p.vertex(1, 0);
    p.vertex(h * 0.5, -1 + h * 0.5);
    p.vertex(-h * 0.5, -1 + h * 0.5);
    p.endShape(p.CLOSE);

    p.fill(sideA);
    p.triangle(h * 0.5, -1 + h * 0.5, 0, -1, -h * 0.5, -1 + h * 0.5);

    if (2 * h1 > h2) {
      throw new Error("2 * h1 > h2");
    }

    p.translate(0, -1 + h * 0.5);
    p.fill(sideA);
    //    p.triangle(-h * 0.5, 0, h * 0.5, 0, 0, -h * 0.5);

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
        -h1 * 0.5,
        (h1 - h2) * 0.5,
        h1 * 0.5,
        (h1 - h2) * 0.5,
        0,
        (2 * h1 - h2) * 0.5
      );
      p.beginShape();

      p.fill(sideB);
      p.vertex(-h2 * 0.5, 0);
      p.vertex(h2 * 0.5, 0);
      p.vertex(h1 * 0.5, (h1 - h2) * 0.5);
      p.vertex(0, (2 * h1 - h2) * 0.5);

      p.vertex(-h1 * 0.5, (h1 - h2) * 0.5);
      p.endShape(p.CLOSE);
    } else {
      p.fill(sideA);
      p.beginShape();
      p.vertex(-h2 * 0.5, 0);
      p.vertex(h2 * 0.5, 0);
      p.vertex(h1 * 0.5, (h1 - h2) * 0.5);
      p.vertex(-h1 * 0.5, (h1 - h2) * 0.5);
      p.endShape(p.CLOSE);
    }
  };

  let smallValley1 = (n) => {
    const h = h1;
    const θ = n * π;
    p.background(background);
    p.scale(size);

    p.fill(sideB);
    p.beginShape();
    p.vertex(-1, 0);
    p.vertex(1, 0);
    p.vertex(h * 0.5, -1 + h * 0.5);
    p.vertex(-h * 0.5, -1 + h * 0.5);
    p.endShape(p.CLOSE);

    p.fill(sideA);
    p.triangle(h * 0.5, -1 + h * 0.5, 0, -1, -h * 0.5, -1 + h * 0.5);

    p.translate(0, -1 + h * 0.5);
    p.fill(sideA);
    //    p.triangle(-h * 0.5, 0, h * 0.5, 0, 0, -h * 0.5);

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

    p.triangle(-h * 0.5, 0, 0, -h * 0.5, h * 0.5, 0);
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
    p.triangle(-1, 0, 0, -1, 1, 0);

    p.rotateX(θ);
    p.fill(ifc ? sideB : sideA);
    p.triangle(-1, 0, 0, 1, 1, 0);
  };

  let stage2 = (n) => {
    n = unit(n / 0.7);
    p.scale(size);
    p.background(background);
    p.fill(sideA);
    p.triangle(-1, 0, 0, -1, 1, 0);

    const θ = ((n + 1) * π) / 2;
    p.rotateX(θ);
    p.fill(sideB);
    p.triangle(-1, 0, 0, 1, 1, 0);
  };

  let fold2 = (n) => {
    const θ = -n * π;
    p.scale(size / root2);
    p.background(background);
    p.fill(sideB);
    let x = 0.5 * (1 - h2);
    let y = 0.5 * h1;
    p.beginShape();
    p.vertex(-0.5 * root2, -0.5 * root2);
    p.vertex(0, 0);
    p.vertex(0.5 * root2, -0.5 * root2);
    p.vertex((0.5 - x) * root2, (-0.5 - x) * root2);
    p.vertex(y * root2, (-1 + h2 - 0.5 * h1) * root2);
    p.vertex(-y * root2, (-1 + h2 - 0.5 * h1) * root2);
    p.vertex((-0.5 + x) * root2, (-0.5 - x) * root2);
    p.endShape(p.CLOSE);

    p.push();
    p.fill(sideA);
    p.beginShape();
    p.vertex((0.5 - x) * root2, (-0.5 - x) * root2);
    p.vertex(y * root2, (-1 + h2 - 0.5 * h1) * root2);
    p.vertex(-y * root2, (-1 + h2 - 0.5 * h1) * root2);
    p.vertex((-0.5 + x) * root2, (-0.5 - x) * root2);
    p.endShape();

    p.triangle(
      (0.5 - x) * root2,
      (-0.5 - x) * root2,
      (-0.5 + x) * root2,
      (-0.5 - x) * root2,
      0,
      -1 * root2
    );
    p.pop();

    p.push();
    p.rotateZ((-3 * π) / 4);
    //    p.rect(0, 0, 1, 1);

    p.fill(sideB);
    p.rotateX(θ);
    p.triangle(0, 0, 1, 0, 1, -1);

    p.pop();
    p.rotateZ((3 * π) / 4);
    p.rotateX(θ);
    p.triangle(0, 0, -1, 0, -1, -1);
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
    //    console.log(α, β);
    return α;
  };

  let stage4Estimate = 0.0;

  let petalFoldv2 = (n) => {
    //    p.noStroke();
    const β = n * π;
    const α = f(β, stage4Estimate);
    stage4Estimate = α;

    p.background(background);
    p.scale(size / root2);

    p.fill(sideB);
    p.translate(-oneMinusTanθ / root2, -oneMinusTanθ / root2);
    p.rotateZ(π / 4);

    p.line(0, 0, oneMinusTanθ, 0);
    p.fill(sideB);
    p.triangle(0, 0, oneMinusTanθ, 0, c * cos2θ, -c * sin2θ);

    p.rotateZ(-2 * θ);

    p.fill(sideB);
    p.triangle(0, 0, c, 0, tanθ, -1);

    p.push();
    p.rotateZ(θ - halfPi);
    p.fill("pink");
    p.rotateX(-1 * β);
    p.triangle(0, 0, 1 / cosθ, 0, sinθ * tanθ, -sinθ);
    p.pop();

    p.rotateX(-1 * (π - α));
    p.fill("lightyellow");
    p.triangle(0, 0, c, 0, tanθ, -1);

    p.rotateZ(θ - halfPi);
    p.rotateX(β);
    p.fill("pink");
    p.triangle(0, 0, 1 / cosθ, 0, sinθ * tanθ, -sinθ);
  };

  let stages = [
    /*    {
      duration: 0,
      draw: () => {},
    },
    {
      duration: 0.2 * 1000,
      draw: paper,
    },
    {
      duration: 3.0 * 1000,
      draw: largeValleyFold,
      },
      */
    {
      duration: 3.0 * 1000,
      draw: smallValley1,
    },
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
new p5(sketch, containerElement);
