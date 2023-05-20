import { linearEquation } from "../src/point2d.js";
import tap from "tap";

let e = linearEquation([0, 1], [0, 2]);
tap.same([-1, 0, 0], e);
