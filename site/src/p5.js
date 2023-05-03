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
    //    p.clear();
    let theta = p.PI / 12;
    let oneMinusTanTheta = 1 - tan(theta);
    let a = oneMinusTanTheta;
    let b =
      (oneMinusTanTheta * sin(2 * theta)) / sin((3 * p.PI) / 4 - 2 * theta);

    p.fill("pink");
    p.circle(250, 250, 40);

    p.push();
    p.rotateZ(PI / 4);
    p.rotateX(n * PI);
    p.circle(250, 250, 40);
    let pA = cartesian(a, PI);
    let pB = cartesian(b, (3 * PI) / 4);
    p.triangle(0, 0, pA.x, pA.y, pB.x, pB.y);
    p.pop();

    p.push();
    p.translate(0, -root2);
    p.rotateZ(PI / 4 - theta);

    p.translate(0, 1 / cos(theta));

    p.rotateY(n * PI);
    let point = cartesian(2, theta + PI / 2);
    p.triangle(0, 0, 0, 1 / cos(theta), point.x, point.y);
    p.pop();
  };

  let stages = [
    {
      duration: 0,
      draw: () => {},
    },
    {
      duration: 100,
      draw: stage1,
    },
    {
      duration: 1000,
      draw: stage2,
    },
    {
      duration: 2000,
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
