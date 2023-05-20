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