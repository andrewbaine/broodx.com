import { linearEquation } from "../src/point2d.js";
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
