import * as benchmark from "benchmark";
import { Projection, Wgs84, Mercator, MercatorBoundingBox, WGS84BoundingBox, Tile, TileList } from "../src/projection";

const suite = new benchmark.Suite;

suite.add("getTilePyramid", function () {
    let proj = new Projection();
    let list: TileList = proj.getTilePyramid({ z: 9, x: 271, y: 178 }, 6);
})
    .on("cycle", function (event: { target: any }) {
        console.log(String(event.target));
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    // run async
    .run({ 'async': true });

