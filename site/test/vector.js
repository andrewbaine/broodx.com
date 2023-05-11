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
  scale,
  sub,
  sum,
  distance,
} from "../src/vector.js";

const π = Math.PI;

const i = [1, 0, 0];
const j = [0, 1, 0];
const k = [0, 0, 1];

const randomAngle = () => 2 * π * (1 - 2 * Math.random());

const assertSameVector = (v1, v2) => {
  const tolerance = 0.000000001;
  assert.approximately(distance(v1, v2), 0, tolerance);
};

const close = (a, b, tolerance) => {
  if (!tolerance) {
    tolerance = 0;
  }
  tap.ok(Math.abs(b - a) <= tolerance);
};

const randomVector = () => [
  1 - 2 * Math.random(),
  1 - 2 * Math.random(),
  1 - 2 * Math.random(),
];

for (const permutation of [
  [3, 4, 0],
  [0, 3, 4],
  [0, 4, 3],
  [3, 0, 4],
  [4, 0, 3],
  [4, 3, 0],
]) {
  tap.equal(magnitude(permutation), 5);
}

for (const { k, v, θ, expected } of [
  {
    v: [1, 3, 5],
    k: [-1, 17, 0.5],
    θ: 1,
    expected: [4.5813508466, 3.3061013909, 1.7552544012],
  },
]) {
  assertSameVector(rotate(v, normalize(k), θ), expected);
}

for (let i = 0; i < 1000; i++) {
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

  let x = Math.random();
  assert.deepEqual(scale(u, x), [u[0] * x, u[1] * x, u[2] * x]);
  assert.approximately(magnitude(sub(u, v)), distance(u, v), tolerance);

  let m = mid(u, v);
  let n = scale(add(u, v), 0.5);
  assert.deepEqual(m, n);
}
