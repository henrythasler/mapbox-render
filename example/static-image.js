"use strict";
exports.__esModule = true;
var render = require("../dist/index");
var mapboxRenderOptions = {
    styleUrl: "",
    accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg",
    debug: true,
    ratio: 1
};
var mbr = new render.MapboxRender(mapboxRenderOptions);
var renderParam = {
    center: [11.6, 47.28],
    zoom: 11,
    width: 512,
    height: 512
};
mbr.loadStyle("example/hillshading.style.json")
    .then(function () {
    mbr.render(renderParam, "example/hillshading.png")
        .then(function () {
        console.log("done");
    })["catch"](function (err) {
        console.error(err);
    });
})["catch"](function (err) {
    console.error(err);
});
//# sourceMappingURL=static-image.js.map