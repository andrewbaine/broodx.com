export function point(x, y) {
  return [x, y];
}

export function segment([x1, y1], [x2, y2]) {
  return [x1, y1, x2, y2];
}

function ccw(ax, ay, bx, by, cx, cy) {
  return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
}

export function intersect([ax, ay, bx, by], [cx, cy, dx, dy]) {
  return (
    ccw(ax, ay, cx, cy, dx, dy) != ccw(bx, by, cx, cy, dx, dy) &&
    ccw(ax, ay, bx, by, cx, cy) != ccw(ax, ay, bx, by, dx, dy)
  );
}
