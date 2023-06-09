import tap from "tap";

import { assert } from "chai";
import {
  add,
  cross,
  dot,
  magnitude,
  mid,
  normalize,
  rotate,
  rotateX,
  rotateZ,
  scale,
  sub,
  sum,
  distance,
} from "../src/vector.js";

// https://www.vcalc.com/wiki/vector-rotation

const π = Math.PI;
const cos = Math.cos;
const sin = Math.sin;

const xAxis = [1, 0, 0];
const yAxis = [0, 1, 0];
const zAxis = [0, 0, 1];

const randomAngle = () => 2 * π * (1 - 2 * Math.random());

const assertSameVector = (v1, v2, t) => {
  const tolerance = 1e-11;
  close(distance(v1, v2), 0, tolerance, `expect ${v1} to be ${v2}`, t);
};

const close = (a, b, tolerance, message, t) => {
  const diff = Math.abs(b - a);
  (t || tap).ok(diff <= tolerance, message + ` but differ by ${diff}`);
};

const randomVector = () => [
  1 - 2 * Math.random(),
  1 - 2 * Math.random(),
  1 - 2 * Math.random(),
];

tap.test("magnitude", (t) => {
  for (const permutation of [
    [3, 4, 0],
    [0, 3, 4],
    [0, 4, 3],
    [3, 0, 4],
    [4, 0, 3],
    [4, 3, 0],
  ]) {
    t.equal(magnitude(permutation), 5);
  }
  t.end();
});

tap.test("rotation test vectors", (t) => {
  for (const { k, v, θ, expected } of [
    {
      v: [1, 3, 5],
      k: [-1, 17, 0.5],
      θ: 1,
      expected: [4.581350846611806, 3.3061013909407224, 1.7552544012390658],
    },
  ]) {
    assertSameVector(rotate(v, normalize(k), θ), expected, t);
  }

  t.end();
});

tap.test("this is another test suite", (t) => {
  const numIterations = parseInt(process.env.NUM_ITERATIONS || "100");
  for (let i = 0; i < numIterations; i++) {
    const v = randomVector();
    const k = normalize(randomVector());
    const θ = randomAngle();
    const v2 = rotate(v, k, θ);

    assertSameVector(v2, rotate(v, k, θ + 2 * π));
    assertSameVector(v2, rotate(v, k, θ - 2 * π));
    assertSameVector(rotate(v2, k, -θ), v);
    assertSameVector(rotate(v2, k, 2 * π - θ), v);

    assertSameVector(rotate(v, k, 2 * π), v);
    assertSameVector(rotate(v, k, -2 * π), v);

    const u = randomVector();
    const d1 = distance(u, v);
    const u2 = rotate(u, k, θ);
    const tolerance = 0.000000001;
    assert.approximately(distance(u2, v2), distance(u, v), tolerance);

    assert.approximately(dot(u2, v2), dot(u, v), tolerance);

    const crossUV = cross(u, v);

    close(dot(crossUV, u), 0, tolerance);
    close(dot(crossUV, v), 0, tolerance);

    assertSameVector(rotate(crossUV, k, θ), cross(u2, v2));

    assert.deepEqual(sum(u, v, v), [
      u[0] + v[0] + v[0],
      u[1] + v[1] + v[1],
      u[2] + v[2] + v[2],
    ]);

    let s = Math.random();
    assert.deepEqual(scale(u, s), [u[0] * s, u[1] * s, u[2] * s]);
    assert.approximately(magnitude(sub(u, v)), distance(u, v), tolerance);

    let m = mid(u, v);
    let n = scale(add(u, v), 0.5);
    assert.deepEqual(m, n);

    let vAboutX = rotate(v, xAxis, θ);
    let vAboutY = rotate(v, yAxis, θ);
    let vAboutZ = rotate(v, zAxis, θ);

    const [x, y, z] = v;
    assertSameVector(vAboutX, [
      x,
      y * cos(θ) - z * sin(θ),
      y * sin(θ) + z * cos(θ),
    ]);
  }

  t.end();
});

tap.same(add([0, 1, 2], [-1, -2, -4]), [-1, -1, -2]);

tap.same(
  rotateX([1, 2, 3], π / 4),
  [1, -0.7071067811865472, 3.5355339059327378]
);

tap.same(
  rotateZ([1, 2, 3], π / 6),
  [-0.13397459621556118, 2.232050807568877, 3]
);
