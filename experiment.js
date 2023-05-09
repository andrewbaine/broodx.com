const cos = Math.cos;
const sin = Math.sin;

let dot = ([x1, y1, z1], [x2, y2, z2]) => {
  return x1 * x2 + y1 * y2 + z1 * z2;
};

let cross = ([a1, a2, a3], [b1, b2, b3]) => {
  return [a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1];
};

let sum = (...vectors) => {
  let result = [0, 0, 0];
  for (const [a, b, c] of vectors) {
    result[0] += a;
    result[1] += b;
    result[2] += c;
  }
  return result;
};

let scale = (s, [a, b, c]) => [s * a, s * b, s * c];

let rotate = (v, k, θ) =>
  sum(
    scale(cos(θ), v),
    scale(sin(θ), cross(k, v)),
    scale(dot(k, v) * (1 - cos(θ)), k)
  );
const distance = ([a, b, c]) => Math.sqrt(a * a + b * b + c * c);

const π = Math.PI;
const θ = 0.23 * π;

const makeV = (θ) => [-cos(2 * θ), sin(2 * θ), 0];
const makeK = (θ) => [sin(θ), cos(θ), 0];
const v = makeV(θ);
const k = makeK(θ);

const vPrime = (θ, β) => {
  const v = makeV(θ);
  const k = makeK(θ);
  return rotate(v, k, β);
};

for (let i = 0; i < 360; i++) {
  const β = (2 * Math.PI * i) / 360;
  const v2 = rotate(v, k, (i * 2 * Math.PI) / 360);
  const v3 = vPrime(θ, β);
  console.log(distance(v2));
  console.log(distance(v3));
}
