export const dot = ([x1, y1, z1], [x2, y2, z2]) => x1 * x2 + y1 * y2 + z1 * z2;

export const cross = ([a1, a2, a3], [b1, b2, b3]) => [
  a2 * b3 - a3 * b2,
  a3 * b1 - a1 * b3,
  a1 * b2 - a2 * b1,
];

export const sum = (...vectors) => {
  const result = [0, 0, 0];
  for (const [a, b, c] of vectors) {
    result[0] += a;
    result[1] += b;
    result[2] += c;
  }
  return result;
};

export const normalize = ([a, b, c]) => {
  const d = Math.sqrt(a * a + b * b + c * c);
  return [a / d, b / d, c / d];
};

export const add = ([a, b, c], [x, y, z]) => [a + x, b + y, c + z];
export const scale = ([a, b, c], s) => [s * a, s * b, s * c];
export const mid = ([a, b, c], [x, y, z]) => [
  (a + x) / 2,
  (b + y) / 2,
  (c + z) / 2,
];
export const sub = ([a, b, c], [x, y, z]) => [a - x, b - y, c - z];

export const distance = ([a1, a2, a3], [b1, b2, b3]) =>
  Math.sqrt(Math.pow(a1 - b1, 2) + Math.pow(a2 - b2, 2) + Math.pow(a3 - b3, 2));

export const magnitude = ([a, b, c]) => Math.sqrt(a * a + b * b + c * c);

export const rotate = (v, k, θ) =>
  sum(
    scale(v, Math.cos(θ)),
    scale(cross(k, v), Math.sin(θ)),
    scale(k, dot(k, v) * (1 - Math.cos(θ)))
  );

export const rotateX = (v, θ) => rotate(v, [1, 0, 0], θ);
