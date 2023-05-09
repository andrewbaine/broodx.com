const p5 = require("p5");
const nr = require("newton-raphson-method");
const mnr = require("./mnr");

const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;

const root2 = Math.sqrt(2);
const dot = ([x1, y1, z1], [x2, y2, z2]) => x1 * x2 + y1 * y2 + z1 * z2;

const unit = (n) => {
  if (n < 0) {
    return 0;
  }
  if (n > 1) {
    return 1;
  }
  return n;
};

const cross = ([a1, a2, a3], [b1, b2, b3]) => [
  a2 * b3 - a3 * b2,
  a3 * b1 - a1 * b3,
  a1 * b2 - a2 * b1,
];

const sum = (...vectors) => {
  const result = [0, 0, 0];
  for (const [a, b, c] of vectors) {
    result[0] += a;
    result[1] += b;
    result[2] += c;
  }
  return result;
};

const scale = ([a, b, c], s) => [s * a, s * b, s * c];

const rotate = (v, k, θ) =>
  sum(
    scale(v, cos(θ)),
    scale(cross(k, v), sin(θ)),
    scale(k, dot(k, v) * (1 - cos(θ)))
  );
const distance = ([a, b, c]) => Math.sqrt(a * a + b * b + c * c);

const π = Math.PI;
const θ = π / 10;
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

const f = (β) => {
  const v1 = rotate(v, k, β);
  let [x, y, z] = v1;

  const kDotV = dot(k1, v1);
  const kXv = -cosθ * z;

  let kx = k1[0];
  let f = (α) => x * cos(α) + kXv * sin(α) + kx * kDotV * (1 - cos(α)) - cos2θ;
  let fPrime = (α) => -x * sin(α) + kXv * cos(α) + kx * kDotV * sin(α);
  let fpp = (α) => -x * cos(α) - kXv * sin(α) + kx * kDotV * cos(α);
  let α = mnr(f, fPrime, fpp, 2 * β);

  const v2 = rotate(v1, k1, α);
  const [_, targetY, targetZ] = v2;
  [x, y, z] = v;
  f = (γ) => y * cos(γ) - targetY;
  let fp = (γ) => -y * sin(γ);
  fpp = (γ) => -y * cos(γ);
  const γ = mnr(f, fp, fpp, -β);

  const actual = f(γ);
  if (Math.abs(actual) > 0.00001) {
    throw new Error("wtf man");
  }

  const v3 = rotate(v, [1, 0, 0], γ);
  console.log(sum(v2, scale(v3, -1)));

  return [α, γ];
};

const sketch = (p) => {
  const b = ((1 - tan(θ)) * sin(2 * θ)) / sin((3 * π) / 4 - 2 * θ);

  const c = (1 - tan(θ)) / (Math.sqrt(2) * sin((3 * π) / 4 - 2 * θ));
  let size = 250;
  p.setup = function () {
    p.createCanvas(600, 600, p.WEBGL);
  };

  let stage1 = (n) => {
    n = unit((n - 0.3) / 0.7);
    p.scale(size);
    p.background(200);

    p.fill("lightyellow");
    p.triangle(-1, 0, 0, -1, 1, 0);

    const θ = (n * π) / 2;
    p.rotateX(θ);
    p.fill("lightyellow");
    p.triangle(-1, 0, 0, 1, 1, 0);
  };

  let stage2 = (n) => {
    n = unit(n / 0.7);
    p.scale(size);
    p.background(200);
    p.fill("lightyellow");
    p.triangle(-1, 0, 0, -1, 1, 0);

    const θ = ((n + 1) * π) / 2;
    p.rotateX(θ);
    p.fill("lightgreen");
    p.triangle(-1, 0, 0, 1, 1, 0);
  };

  let stage3 = (n) => {
    p.scale(size / root2);
    p.background(200);
    p.rotateZ((-3 * π) / 4);
    p.fill("lightgreen");
    p.rect(0, 0, 1, 1);

    p.triangle(0, 0, 0, 1, -1, 1);

    const θ = (1 - n) * π;
    p.rotateX(θ);
    p.fill("pink");
    p.triangle(0, 0, 1, 0, 1, -1);
  };

  let stage4 = (n) => {
    p.scale(size / root2);
    p.background(200);
    p.rotateZ((-3 * π) / 4);
    p.fill("lightgreen");
    p.rect(0, 0, 1, 1);

    //    p.triangle(0, 0, 0, 1, -1, 1);

    const theta = n * π;

    p.translate(oneMinusTanθ, 0);
    p.fill("pink");
    p.triangle(0, 0, -oneMinusTanθ, 0, -c * cos2θ, c * sin2θ);

    p.rotateZ(-2 * θ);
    p.rotateX(theta);
    p.triangle(0, 0, -c, 0, -tanθ, 1);

    p.rotateZ(θ - π / 2);
    p.triangle(0, 0, -1 / cosθ, 0, -tanθ * sinθ, sinθ);
  };

  let stage5 = (n) => {
    p.scale(size / root2);
    const β = π * (1 - n);
    const [α, γ] = f(β);
    test(α, β, γ);
    p.background(200);

    let a = oneMinusTanθ;
    let translation = cartesian(oneMinusTanθ, (-3 * π) / 4);
    p.translate(translation.x, translation.y);

    p.fill("lightblue");
    p.circle(0, 0, 0.05);

    p.push();
    p.fill("white");
    p.rotateZ(π / 4);
    p.rotateX(γ - π);
    let pX = cartesian(c, 2 * θ);
    p.triangle(0, 0, oneMinusTanθ, 0, pX.x, pX.y);
    p.pop();

    p.fill("pink");
    p.rotateZ(π / 4);
    let pA = cartesian(1 / cos(θ), -(π / 2 + θ));
    p.triangle(0, 0, oneMinusTanθ, 0, pA.x, pA.y);

    p.fill("lightblue");
    p.rotateZ(-(π / 2 + θ));

    p.rotateX(α - π);
    let point = cartesian(tan(θ), θ - π / 2);
    let point2 = cartesian(1 / cos(θ), 2 * θ - π);
    p.triangle(0, 0, 1 / cos(θ), 0, point2.x, point2.y);

    p.fill("lightyellow");
    p.rotateZ(2 * θ - π);
    p.rotateX(β - π);
    point = cartesian(c, θ - π / 2);
    p.triangle(0, 0, 1 / cos(θ), 0, point.x, point.y);

    p.fill("lightgreen");
    p.rotateZ(θ - π / 2);
    //    p.rotateX(n * π);
    point = cartesian(oneMinusTanθ, -2 * θ);
    //    p.triangle(0, 0, c, 0, point.x, point.y);
  };

  let stages = [
    {
      duration: 0,
      draw: () => {},
    },
    {
      duration: 000,
      draw: stage1,
    },
    {
      duration: 000,
      draw: stage2,
    },
    {
      duration: 000,
      draw: stage3,
    },
    {
      duration: 1000,
      draw: stage4,
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
