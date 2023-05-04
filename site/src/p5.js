let p5 = require("p5");

let sin = Math.sin;
let cos = Math.cos;
let tan = Math.tan;

const root2 = Math.sqrt(2);

const containerElement = document.getElementById("main");

let cartesian = (r, theta) => {
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
  };
};

const sketch = (p) => {
  let PI = p.PI;
  const π = PI;
  const translatePolar = (r, θ) => {
    return {
      x: r * cos(θ),
      y: r * sin(θ),
    };
  };

  const θ = p.PI / 12;
  const c = (1 - tan(θ)) / (Math.sqrt(2) * sin((3 * PI) / 4 - 2 * θ));
  let size = 250;
  p.setup = function () {
    p.createCanvas(600, 600, p.WEBGL);
  };

  let stage1 = (n) => {
    p.scale(size);
    p.background(200);

    p.fill("blue");
    p.triangle(-1, 0, 0, -1, 1, 0);
    p.rotateX((n * 2 * p.PI) / 4);
    if (Math.random() < 0.01) {
      console.log(p.millis());
    }
    // Draw triangle in the center of the canvas
    p.fill("red");
    p.triangle(-1, 0, 0, 1, 1, 0);
  };

  let stage2 = (n) => {
    p.scale(size);
    p.background(200);

    p.fill("blue");
    p.triangle(-1, 0, 0, -1, 1, 0);
    p.rotateX(((1 + n) * p.PI) / 2);
    if (Math.random() < 0.01) {
      console.log(p.millis());
    }
    // Draw triangle in the center of the canvas
    p.fill("green");
    p.triangle(-1, 0, 0, 0);
  };

  let stage3 = (n) => {
    p.background(200);
    p.scale(size / root2);

    let oneMinusTanθ = 1 - tan(θ);
    let a = oneMinusTanθ;
    let b = (oneMinusTanθ * sin(2 * θ)) / sin((3 * p.PI) / 4 - 2 * θ);

    p.fill("lightblue");
    p.circle(0, 0, 0.05);
    let translation = cartesian(oneMinusTanθ, (-3 * PI) / 4);
    p.translate(translation.x, translation.y);
    p.circle(0, 0, 0.05);

    p.fill("pink");
    p.rotateZ(PI / 4);
    let pA = cartesian(1 / cos(θ), -(PI / 2 + θ));
    p.triangle(0, 0, oneMinusTanθ, 0, pA.x, pA.y);

    let α = p.fill("lightblue");
    p.rotateZ(-(PI / 2 + θ));
    p.rotateX(-n * PI);
    let point = cartesian(tan(θ), θ - PI / 2);
    let point2 = cartesian(1 / cos(θ), 2 * θ - PI);
    p.triangle(0, 0, 1 / cos(θ), 0, point2.x, point2.y);

    p.fill("lightyellow");
    p.rotateZ(2 * θ - π);
    p.rotateX(-n * PI);
    point = cartesian(c, θ - PI / 2);
    p.triangle(0, 0, 1 / cos(θ), 0, point.x, point.y);

    p.fill("lightgreen");
    p.rotateZ(θ - PI / 2);
    p.rotateX(n * PI);
    point = cartesian(oneMinusTanθ, -2 * θ);
    p.triangle(0, 0, c, 0, point.x, point.y);
  };

  let stages = [
    {
      duration: 0,
      draw: () => {},
    },
    {
      duration: 0,
      draw: stage1,
    },
    {
      duration: 0,
      draw: stage2,
    },
    {
      duration: 3000,
      draw: stage3,
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
