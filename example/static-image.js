"use strict";
exports.__esModule = true;
var render = require("../dist/render.js");
var mapboxRenderOptions = {
    styleUrl: "data/cyclemap-simple.json",
    accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg",
    debug: true,
    ratio: 2
};
var mbr = new render.MapboxRender(mapboxRenderOptions);
var renderParam = {
    center: [12.75491, 47.75418],
    zoom: 14,
    width: 1280,
    height: 768
};
mbr.loadStyle("data/cyclemap-simple.json")
    .then(function () {
    mbr.render(renderParam, "example/image.png")
        .then(function () {
        console.log("done");
    })["catch"](function (err) {
        console.error(err);
    });
})["catch"](function (err) {
    console.error(err);
});
//# sourceMappingURL=static-image.js.map