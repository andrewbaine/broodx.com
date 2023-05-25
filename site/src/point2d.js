export const linearEquation = ([x1, y1], [x2, y2]) => {
  if (x1 == x2) {
    if (y1 == y2) {
      throw new Error("non-distinct points");
    } else {
      let [a, b, c] = linearEquation([y1, x1], [y2, x2]);
      return [b, a, c];
    }
  } else {
    let a = (y2 - y1) / (x2 - x1);
    let c = 0.5 * (y1 - a * x1 + y2 - a * x2);
    return [a, -1, c];
  }
};

export const intersect = (e1, e2) => {
  const [a1, b1, c1] = e1;
  const [a2, b2, c2] = e2;
  let d = a1 * b2 - b1 * a2;
  let dx = b1 * c2 - c1 * b2;
  let dy = c1 * a2 - a1 * c2;

  if (d == 0) {
    if (dx == 0 && dy == 0) {
      return {
        infinitelyManySolutions: true,
      };
    } else {
      return {
        none: true,
      };
    }
  } else {
    return {
      intersection: [dx / d, dy / d],
    };
  }
};

export const ccw = ([ax, ay], [bx, by], [cx, cy]) => {
  return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
};
