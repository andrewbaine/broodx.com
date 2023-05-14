import p5 from "p5";
import {
  add,
  cross,
  dot,
  normalize,
  mid,
  rotate,
  scale,
  sub,
} from "./vector.js";

const tan = Math.tan;
const cos = Math.cos;
const sin = Math.sin;

const xAxis = [1, 0, 0];
const yAxis = [0, 1, 0];
const zAxis = [0, 0, 1];

const π = Math.PI;
const θ = π / 12;
const height = 600;

const h0 = 0.1;
const h1 = 0.9;

const tanθ = tan(θ);
const sinθ = sin(θ);
const cosθ = cos(θ);
const root2 = Math.sqrt(2);

const d = (0.5 * 1) / sin(π / 4 + 2 * θ);
const log = console.log;

const background = 200;

const point = (x, y) => [x, y, 0];
const polar = (r, θ) => [r * cos(θ), r * sin(θ), 0];
const unit = (θ) => polar(1, θ);

const reflect = (v, origin, θ) => {
  const v1 = add(v, scale(origin, -1));
  const v2 = rotate(point, unit(θ), π);
  return add(v2, origin);
};

const leftHanded = (shape) => shape.reverse();

const paperTopLeft = point(0, 0);
const paperTopRight = point(1, 0);
const paperBottomRight = point(1, 1);
const paperBottomLeft = point(0, 1);
const paperCenter = mid(paperTopLeft, paperBottomRight);
const paperTopCenter = mid(paperTopLeft, paperTopRight);
const paperRightCenter = mid(paperTopRight, paperBottomRight);
const paperLeftCenter = mid(paperTopLeft, paperBottomLeft);

const p1 = scale(polar(1 / cosθ, θ), 0.5);
const p2 = polar(d, π / 4);
const p3 = add(rotate(p1, zAxis, π / 2), point(1, 0));
const p4 = sub(point(1, 1), p2);

const t0 = [paperCenter, p1, p2];
const t1 = [p2, p1, paperTopLeft];
const t2 = [paperTopLeft, p1, paperTopCenter];
const t3 = [paperTopCenter, p1, paperTopRight];
const bigFatDiamond = [paperTopRight, p1, paperCenter, p3];
const t5 = [paperTopRight, p3, paperRightCenter];
const t6 = [paperRightCenter, p3, paperBottomRight];
const t7 = [paperBottomRight, p3, p4];
const t8 = [p4, p3, paperCenter];
const t9 = [
  paperTopLeft,
  paperLeftCenter,
  scale(polar(1 / cosθ, π / 2 - θ), 0.5),
];

const t10 = [paperTopLeft, scale(polar(1 / cosθ, π / 2 - θ), 0.5), p2];
const t11 = [p2, scale(polar(1 / cosθ, π / 2 - θ), 0.5), paperCenter];

//const otherHalf = [paperBottomRight, paperTopLeft, paperBottomLeft];

const triangles = [t0, t1, t2, t3, t5, t6, t7, t8, t9, t10, t11];

const makeShape = (h0, h1) => {
  if (h0 > h1) {
    return makeShape(h1, h0);
  }
  let x = (tanθ * sin(π / 4)) / (2 * sin(π / 4 + θ));

  let span = 1 / (2 * cosθ) - x;

  const a = point(0, 0.5);
  const b = add(a, point(tanθ / 2, 0));
  const c = add(b, polar(x + h0 * span, π / 2 + θ));
  const j = add(b, polar(x + h1 * span, π / 2 + θ));
  const d = add(a, point(0, 0.5 * h0));
  const i = add(a, point(0, 0.5 * h1));

  const f = point(0.5, 1);
  const e = sub(f, point(0, tanθ / 2));
  const h = add(e, polar(x + h0 * span, π - θ));
  const k = add(e, polar(x + h1 * span, π - θ));
  const g = add(f, point(-0.5 * h0, 0));
  const l = add(f, point(-0.5 * h1, 0));

  let shape = [a, b, c, d];
  return [shape, [e, f, g, h]];
};

const shapes = [bigFatDiamond, ...makeShape(h0, h1)];
const turnOver = ([p1, p2, p3]) => [p1, p3, p2];

const isFacingCamera = ([a, b, c, ...rest], camera) => {
  const v1 = sub(a, b);
  const v2 = sub(c, b);
  const interior = mid(mid(a, b), c);
  const normal = cross(v1, v2);
  const camVector = normalize(sub(camera, interior));
  return dot(normal, camVector) > 0;
};

const sketch = (p) => {
  let camera;
  const drawTriangle = (t) => {
    const [p1, p2, p3] = t;
    const fill = isFacingCamera(t, [camera.eyeX, camera.eyeY, camera.eyeZ])
      ? "white"
      : "pink";
    p.fill(fill);
    p.triangle(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
  };

  const drawShape = (s) => {
    p.beginShape();
    for (const [x, y, z] of s) {
      p.vertex(x, y);
    }
    p.endShape(p.CLOSE);
  };

  let scale = 300;
  p.setup = function () {
    p.createCanvas(height, height, p.WEBGL);
    camera = p.createCamera();
    p.background(200);
  };
  p.draw = function () {
    p.translate(-scale / 2, -scale / 2);
    p.background(200);
    p.scale(scale);
    p.fill("white");
    for (const t of triangles) {
      drawTriangle(t);
    }
    for (const s of shapes) {
      drawShape(s);
    }
  };
};

new p5(sketch, document.getElementById("main"));
