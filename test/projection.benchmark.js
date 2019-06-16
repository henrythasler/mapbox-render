"use strict";
exports.__esModule = true;
var benchmark = require("benchmark");
var projection_1 = require("../src/projection");
var suite = new benchmark.Suite;
suite.add("getTilePyramid", function () {
    var proj = new projection_1.Projection();
    var list = proj.getTilePyramid({ z: 9, x: 271, y: 178 }, 6);
    // let res: string = "";
    // for (let x = 0; x < 1000; x++) {
    //     res += x.toString();
    // }
})
    .add("getTilePyramid 2", function () {
    var proj = new projection_1.Projection();
    var list = proj.getTilePyramid2({ z: 9, x: 271, y: 178 }, 6);
    // let res: string = "";
    // for (let x = 0; x < 1000; x++) {
    //     res = x.toString();
    // }
})
    .on("cycle", function (event) {
    console.log(String(event.target));
})
    .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
})
    // run async
    .run({ 'async': true });
