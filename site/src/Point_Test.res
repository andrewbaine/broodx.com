let p = Point.make

Tap.equal(Point.determinant(p(1., 3.), p(2., 4.)), -2.)

Tap.ok(Point.ccw(p(0.0, 0.0), p(1.0, 0.0), p(2.0, 0.0)))
Tap.ok(Point.ccw(p(0.0, 0.0), p(1.0, 0.0), p(0.0, 1.0)))
