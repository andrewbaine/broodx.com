import { ccw, linearEquation, intersect } from "../src/point2d.js";
import tap from "tap";

let sameLinearEquation = (e1, e2, tolerance, t) => {
  let [a1, b1, c1] = e1;
  let [a2, b2, c2] = e2;
  let fail = (message) => t.fail(`${message}, ${e1}, ${e2}`);
  if (a1 == 0) {
    if (a2 != 0) {
      fail("only one x term is zero");
    } else {
      if (b1 == 0) {
        fail("0x + 0y + c == 0 is not a linear equation.");
      } else {
        e1.forEach((x, i) => {
          if (Math.abs((x * b2) / b1 - e2[i]) > tolerance) {
            fail("different");
          }
        });
      }
    }
  } else {
    e1.forEach((x, i) => {
      if (Math.abs((x * b2) / b1 - e2[i]) > tolerance) {
        fail("different");
      }
    });
  }
};

tap.test("linear equations", (t) => {
  const tolerance = 1e-12;
  for (const { a, b, expected } of [
    {
      a: [0, 1],
      b: [0, 2],
      expected: [-1, 0, 0],
    },
    {
      a: [0, 1],
      b: [0, 2],
      expected: [1, 0, 0],
    },
    {
      a: [1, 0],
      b: [2, 0],
      expected: [0, 1, 0],
    },
    {
      a: [1, 1],
      b: [2, 2],
      expected: [1, -1, 0],
    },
    {
      a: [1, 1],
      b: [2, 0],
      expected: [1, 1, -2],
    },
    {
      a: [2, 1],
      b: [8, 11],
      expected: [5, -3, -7],
    },
    {
      a: [2, -1],
      b: [20, -11],
      expected: [5, 9, -1],
    },
  ]) {
    let actual = linearEquation(a, b);
    sameLinearEquation(expected, actual, tolerance, t);
  }
  t.end();
});

tap.throws(() => {
  linearEquation([1, 1], [1, 1]);
});

//tap.same(intersect(

tap.test("intersections", (t) => {
  for (const [e1, e2, expected] of [
    [[0, 1, -2], [1, 0, -10], { intersection: [10, 2] }],
    [[0, 1, -2], [1, -1, 10], { intersection: [-8, 2] }],
    [[0, 1, 2], [0, 1, 1], { none: true }],
    [[1, 1, 1], [1, 1, 1], { infinitelyManySolutions: true }],
    [[1, 0, 1], [1, 0, 2], { none: true }],
  ]) {
    tap.same(intersect(e1, e2), expected);
  }
  t.end();
});

tap.ok(ccw([0, 0], [1, 0], [0, 1]));
tap.false(ccw([0, 0], [0, 1], [1, 0]));
