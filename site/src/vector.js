const dot = ([x1, y1, z1], [x2, y2, z2]) => x1 * x2 + y1 * y2 + z1 * z2;

const cross = ([a1, a2, a3], [b1, b2, b3]) => [
  a2 * b3 - a3 * b2,
  a3 * b1 - a1 * b3,
  a1 * b2 - a2 * b1,
];

const sum = (...vectors) => {
  const result = [0, 0, 0];
  for (const [a, b, c] of vectors) {
    result[0] += a;
    result[1] += b;
    result[2] += c;
  }
  return result;
};

const normalize = ([a, b, c]) => {
  const d = Math.sqrt(a * a + b * b + c * c);
  return [a / d, b / d, c / d];
};

const add = ([a, b, c], [x, y, z]) => [a + x, b + y, c + z];
const scale = ([a, b, c], s) => [s * a, s * b, s * c];
const mid = ([a, b, c], [x, y, z]) => [
  a + (x - a) / 2,
  b + (y - b) / 2,
  c + (z - c) / 2,
];
const sub = ([a, b, c], [x, y, z]) => [a - x, b - y, c - z];

const distance = ([a, b, c]) => Math.sqrt(a * a + b * b + c * c);

const rotate = (v, k, θ) =>
  sum(
    scale(v, Math.cos(θ)),
    scale(cross(k, v), Math.sin(θ)),
    scale(k, dot(k, v) * (1 - Math.cos(θ)))
  );

module.exports = {
  add,
  cross,
  dot,
  sum,
  normalize,
  scale,
  mid,
  sub,
  distance,
  rotate,
};
