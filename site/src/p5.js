const p5 = require("p5");
const nr = require("newton-raphson-method");
const mnr = require("./mnr");
const {
  cross,
  normalize,
  mid,
  rotate,
  scale,
  sub,
  sum,
  dot,
} = require("./vector");

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

const test = (α, β, γ) => {
  const v1 = rotate(v, k, β);
  const v2 = rotate(v1, k1, α);

  if (Math.abs(v2[0] - cos(2 * θ)) > 0.00001) {
    throw new Error("wtf");
  }

  const v3 = rotate(v, xAxis, γ);
  const diffs = [v3[0] - v2[0], v3[1] - v2[1], v3[2] - v2[2]];
  //  console.log("v3 - v2", diffs);
};

const background = 200;
const sideA = "white";
const sideB = "lightblue";

const sketch = (p) => {
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

  const isFacingCamera = (a, b, c, camera) => {
    const v1 = sub(a, b);
    const v2 = sub(c, b);
    const interior = mid(mid(a, b), c);

    const normal = cross(v1, v2);

    const camVector = normalize(sub(camera, interior));

    const d = dot(normal, camVector);
    const ifc = d < 0;
    return d < 0;
  };

  let fold1 = (n) => {
    const t = [0.0, 0.0, 0.0];
    const θ = n * π;

    const a = scale(sum([-1, 0, 0], t), size);
    const b = scale(sum([0, cos(θ), sin(θ)], t), size);
    const c = scale(sum([1, 0, 0], t), size);
    const ifc = isFacingCamera(a, b, c, [
      camera.eyeX,
      camera.eyeY,
      camera.eyeZ,
    ]);

    p.scale(size);
    p.background(background);

    p.translate(t[0], t[1]);
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

    p.push();
    p.rotateZ((-3 * π) / 4);
    p.rect(0, 0, 1, 1);

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

  let petalFold = (n) => {
    const β = n * π;
    const α = f(β, stage4Estimate);
    stage4Estimate = α;
    p.scale(size / root2);
    p.background(background);

    p.rotateZ((-3 * π) / 4);
    p.translate(oneMinusTanθ, 0);

    p.rotateZ(2 * θ);
    p.fill("pink");

    p.fill(sideB);
    p.triangle(0, 0, -oneMinusTanθ, 0, -c * cos2θ, c * sin2θ);

    p.rotateZ(-2 * θ);
    p.fill(sideB);
    p.rotateX(π - α);
    p.triangle(0, 0, -c, 0, -tanθ, 1);

    p.rotateZ(θ - π / 2);
    p.fill(sideB);

    //    p.triangle(0, 0, -1 / cosθ, 0, -tanθ * sinθ, sinθ);
    p.color("white");
    p.rotateX(-β);
    p.triangle(0, 0, -1 / cosθ, 0, -tanθ * sinθ, sinθ);
  };

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
    p.fill("lightgreen");
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
    {
      duration: 0,
      draw: () => {},
    },
    {
      duration: 0.2 * 1000,
      draw: paper,
    },
    {
      duration: 3.0 * 1000,
      draw: fold1,
    },
    {
      duration: 3.0 * 1000,
      draw: fold2,
    },
    {
      duration: 2 * 1000,
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