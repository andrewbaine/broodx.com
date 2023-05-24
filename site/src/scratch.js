const crease = ({ background, height, light }) => {
  const a = [0, 0];
  const b = [1, 0];
  const c = [1, 1];
  const d = [0, 1];

  const top = linearEquation(a, b);
  const right = linearEquation(b, c);
  const bottom = linearEquation(c, d);
  const left = linearEquation(d, a);

  const e = intersect(
    [1, 0, -0.5],
    linearEquation([0, 0], [1, tanθ])
  ).intersection;

  const center = mid(mid(a, c), mid(b, d));

  return (p) => {
    const line = ([a, b], [c, d]) => p.line(a, b, c, d);
    p.setup = function () {
      p.createCanvas(height, height, p.WEBGL);
      p.camera(0, 0, height / 2 / tan(Math.PI / 6), 0, 0, 0, 0, 1, 0);
    };
    p.draw = function () {
      p.background(background);
      p.scale((height * 2) / 3);
      p.translate(-0.5, -0.5);
      p.fill(light);
      p.rect(0, 0, 1, 1);
      line(a, e);
      line(e, b);
    };
  };
};
