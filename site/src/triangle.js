import { linearEquation, intersect } from "./point2d.js";

export function divide(triangle, line, tolerance = 0.0) {
  const [a, b, c] = line;
  let errors = [0, 0, 0];
  let i = 0;
  const [p1, p2, p3] = triangle;
  for (const p of triangle) {
    const [x, y] = p;
    const ε = a * x + b * y + c;
    errors[i] = Math.abs(ε) > tolerance ? (ε > 0 ? 1 : -1) : 0;
    i++;
  }
  let [e1, e2, e3] = errors;
  if (e1 < 0) {
    if (e2 < 0) {
      if (e3 <= 0) {
        return [[triangle], []];
      } else {
        // below, below, above
        const p4 = intersect(linearEquation(p1, p3), line).intersection;
        const p5 = intersect(linearEquation(p2, p3), line).intersection;
        const below = [
          [p1, p2, p4],
          [p4, p2, p5],
        ];
        const above = [[p5, p3, p4]];
        return [below, above];
      }
    } else if (e2 == 0) {
      if (e3 <= 0) {
        return [[triangle], []];
      } else {
        // below, equal, above
        const p4 = intersect(linearEquation(p1, p3), line).intersection;
        const below = [[p1, p2, p4]];
        const above = [[p4, p2, p3]];
        return [below, above];
      }
    } else {
      if (e3 < 0) {
        // below, above, below
        const p4 = intersect(linearEquation(p1, p2), line).intersection;
        const p5 = intersect(linearEquation(p3, p2), line).intersection;
        const below = [
          [p1, p4, p3],
          [p3, p4, p5],
        ];
        const above = [[p5, p4, p2]];
        return [below, above];
      } else if (e3 == 0) {
        // below, above, equal
        const p4 = intersect(linearEquation(p1, p2), line).intersection;
        const below = [[p1, p4, p3]];
        const above = [[p3, p4, p2]];
        return [below, above];
      } else {
        // below, above, above
        const p4 = intersect(linearEquation(p1, p2), line).intersection;
        const p5 = intersect(linearEquation(p1, p3), line).intersection;
        const below = [[p1, p4, p5]];
        const above = [
          [p5, p4, p2],
          [p2, p3, p5],
        ];
        return [below, above];
      }
    }
  } else if (e2 < 0) {
    return divide([p2, p3, p1], line, tolerance);
  } else if (e3 < 0) {
    return divide([p3, p1, p2], line, tolerance);
  } else {
    // since none is below the line,
    // they're all above or on the line
    return [[], [triangle]];
  }
}
