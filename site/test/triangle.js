import tap from "tap";

import { linearEquation, ccw } from "../src/point2d.js";
import { divide } from "../src/triangle.js";

const a = [0, -1];
const b = [2, 1];
const c = [0, 1];
const o = [0, 0];

const triangle = [a, b, c];
const line = [1, -1, -1];

const division = divide(triangle, line);
tap.same([[[c, a, b]], []], division);

tap.test("above-below-1", (t) => {
  const a = [0, -1];
  const b = [2, 1];
  const c = [0, 1];
  const o = [0, 0];

  const line = [0, 1, 0];
  const below = [[a, [1, 0], o]];
  const above = [
    [o, [1, 0], b],
    [b, c, o],
  ];
  const expected = [below, above];
  t.same(divide([a, b, c], line), expected, "s1");
  t.same(divide([b, c, a], line), expected, "s2");
  t.same(divide([c, a, b], line), expected, "s3");
  t.end();
});

tap.test("above-below-2", (t) => {
  const a = [0, -1];
  const b = [2, 1];
  const c = [0, 1];
  const o = [0, 0];

  const line = [0, -1, 0];
  const below = [
    [b, c, [1, 0]],
    [[1, 0], c, o],
  ];

  const above = [[o, a, [1, 0]]];
  const expected = [below, above];
  t.same(divide([a, b, c], line), expected, "x1");
  t.same(divide([b, c, a], line), expected, "x2");
  t.same(
    divide([c, a, b], line),
    [
      [
        [c, o, b],
        [b, o, [1, 0]],
      ],
      [[[1, 0], o, a]],
    ],
    "x3"
  );
  t.end();
});

(function () {
  const a = [0, -1];
  const b = [2, 1];
  const c = [0, 1];
  const o = [0, 0];

  const line = [1, -2, 0];
  tap.same(divide([a, b, c], line), [[[c, o, b]], [[b, o, a]]], "t1");
})();

(function () {
  const a = [0, -1];
  const b = [2, 1];
  const c = [0, 1];
  const o = [0, 0];

  const line = [-1, 2, 0];
  const expected = [[[a, b, o]], [[o, b, c]]];
  const actual = divide([a, b, c], line);
  tap.same(actual, expected, "t2");
})();

(function () {
  const a = [0, -1];
  const b = [2, 1];
  const c = [0, 1];
  const o = [0, 0];

  const line = [1, 0, 10];
  const expected = [[], [[a, b, c]]];
  const actual = divide([a, b, c], line);
  tap.same(actual, expected, "t3");
})();
(function () {
  const a = [0, -1];
  const b = [2, 1];
  const c = [0, 1];
  const o = [0, 0];

  const line = [1, 0, -10];
  const expected = [[[a, b, c]], []];
  const actual = divide([a, b, c], line);
  tap.same(actual, expected, "t4");
})();
tap.test("random", (t) => {
  for (let i = 0; i < 100; i++) {
    const a = [Math.random(), Math.random()];
    const b = [Math.random(), Math.random()];
    const c = [Math.random(), Math.random()];

    let line = linearEquation(a, b);
    const delta = line[0] * c[0] + line[1] * c[1] + line[2];

    if (delta > 0) {
      let actual = divide([a, b, c], [line[0], line[1], line[2] + 1], 1e-10);
      const below = [];
      const above = [[a, b, c]];
      const expected = [below, above];
      t.same(actual, expected);
    } else {
      let actual = divide([a, b, c], [line[0], line[1], line[2] - 1], 1e-10);
      const below = [[a, b, c]];
      const above = [];
      const expected = [below, above];
      t.same(actual, expected);
    }
  }
  t.end();
});
