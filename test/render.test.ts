import * as render from "../dist/render.js";
import { expect } from "chai";

/** You can easily switch between jest and mocha. Just use the right import below. 
 * Use `npm run test:mocha` for mocha
 * `npm test` for jest */ 
import "jest";
// import "mocha";

import * as sharp from "sharp";
import pixelmatch = require('pixelmatch');

// const asyncReadFile = util.promisify(fs.readFile);
const testAssetsPath = "test/assets/";
const testOutputPath = "test/out/";

describe("Coordinate Transformation Tests", function () {
    it("getWGS84FromMercator with zeros", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let pos = mbr.getWGS84FromMercator({ x: 0, y: 0 })
        expect(pos).to.include({"lng": 0, "lat": 0});
    });

    it("getWGS84FromMercator with positive values", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let pos = mbr.getWGS84FromMercator({ x: 1252344, y: 6105178 })
        expect(pos).to.have.property("lng");
        expect(pos).to.have.property("lat");
        expect(pos.lng).to.be.closeTo(11.249999999999993, 0.00001)
        expect(pos.lat).to.be.closeTo(47.989921667414194, 0.00001)
    });

    it("getWGS84FromMercator with negative values", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let pos = mbr.getWGS84FromMercator({ x: -7604567, y: -7330617 })
        expect(pos).to.have.property("lng");
        expect(pos).to.have.property("lat");
        expect(pos.lng).to.be.closeTo(-68.31298828125001, 0.00001)
        expect(pos.lat).to.be.closeTo(-54.838663612975104, 0.00001)
    });

    it("getWGS84FromMercator projected bounds", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let pos = mbr.getWGS84FromMercator({ x: -20037508.342789, y: 20037508.342789 })
        expect(pos).to.have.property("lng");
        expect(pos).to.have.property("lat");
        expect(pos.lng).to.be.closeTo(-180, 0.00001)
        expect(pos.lat).to.be.closeTo(85.051129, 0.00001)
    });

    it("getMercatorFromPixels at Null-Island", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let pos = mbr.getMercatorFromPixels({ x: 256, y: 256 }, 1)
        expect(pos).to.have.property("x");
        expect(pos).to.have.property("y");
        expect(pos.x).to.be.closeTo(0, 0.00001)
        expect(pos.y).to.be.closeTo(0, 0.00001)
    });

    it("getMercatorFromPixels #1", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let pos = mbr.getMercatorFromPixels({ x: 0, y: 0 }, 1)
        expect(pos).to.have.property("x");
        expect(pos).to.have.property("y");
        expect(pos.x, "pos.x").to.be.closeTo(-20037508.342789, 0.00001)
        expect(pos.y, "pos.y").to.be.closeTo(20037508.342789, 0.00001)
    });

    it("getMercatorFromPixels #2", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let pos = mbr.getMercatorFromPixels({ x: 1301248, y: 2864384 }, 14)
        expect(pos).to.have.property("x");
        expect(pos).to.have.property("y");
        expect(pos.x, "pos.x").to.be.closeTo(-7604567.070035616, 0.00001)
        expect(pos.y, "pos.y").to.be.closeTo(-7330616.760661542, 0.00001)
    });

    it("getMercatorTileBounds #1", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let bound = mbr.getMercatorTileBounds({ x: 0, y: 0 }, 1)
        expect(bound).to.have.property("leftbottom");
        expect(bound).to.have.property("righttop");
        expect(bound.leftbottom.x, "bound.leftbottom.x").to.be.closeTo(-20037508.342789, 0.00001)
        expect(bound.leftbottom.y, "bound.leftbottom.y").to.be.closeTo(0, 0.00001)
        expect(bound.righttop.x, "bound.righttop.x").to.be.closeTo(0, 0.00001)
        expect(bound.righttop.y, "bound.righttop.y").to.be.closeTo(20037508.342789, 0.00001)
    });

    it("getMercatorTileBounds #2", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let bound = mbr.getMercatorTileBounds({ x: 5083, y: 11188 }, 14)
        expect(bound).to.have.property("leftbottom");
        expect(bound).to.have.property("righttop");
        expect(bound.leftbottom.x, "bound.leftbottom.x").to.be.closeTo(-7604567.070035616, 0.00001)
        expect(bound.leftbottom.y, "bound.leftbottom.y").to.be.closeTo(-7330616.760661542, 0.00001)
        expect(bound.righttop.x, "bound.righttop.x").to.be.closeTo(-7602121.08513049, 0.00001)
        expect(bound.righttop.y, "bound.righttop.y").to.be.closeTo(-7328170.775756419, 0.00001)
    });

    it("getWGS84TileBounds #1", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let bound = mbr.getWGS84TileBounds({ x: 0, y: 0 }, 1)
        expect(bound).to.have.property("leftbottom");
        expect(bound).to.have.property("righttop");
        expect(bound.leftbottom.lng, "bound.leftbottom.lng").to.be.closeTo(-180, 0.00001)
        expect(bound.leftbottom.lat, "bound.leftbottom.lat").to.be.closeTo(0, 0.00001)
        expect(bound.righttop.lng, "bound.righttop.lng").to.be.closeTo(0, 0.00001)
        expect(bound.righttop.lat, "bound.righttop.lat").to.be.closeTo(85.051129, 0.00001)
    });

    it("getWGS84TileBounds #2", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let bound = mbr.getWGS84TileBounds({ x: 272, y: 177 }, 9)
        expect(bound).to.have.property("leftbottom");
        expect(bound).to.have.property("righttop");
        expect(bound.leftbottom.lng, "bound.leftbottom.lng").to.be.closeTo(11.25, 0.00001)
        expect(bound.leftbottom.lat, "bound.leftbottom.lat").to.be.closeTo(47.98992189, 0.00001)
        expect(bound.righttop.lng, "bound.righttop.lng").to.be.closeTo(11.95312466, 0.00001)
        expect(bound.righttop.lat, "bound.righttop.lat").to.be.closeTo(48.45835188, 0.00001)
    });

    it("getWGS84TileBounds #3", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let bound = mbr.getWGS84TileBounds({ x: 4383, y: 2854 }, 13)
        expect(bound).to.have.property("leftbottom");
        expect(bound).to.have.property("righttop");
        expect(bound.leftbottom.lng, "bound.leftbottom.lng").to.be.closeTo(12.61230469, 0.00001)
        expect(bound.leftbottom.lat, "bound.leftbottom.lat").to.be.closeTo(47.78363486, 0.00001)
        expect(bound.righttop.lng, "bound.righttop.lng").to.be.closeTo(12.65624966, 0.00001)
        expect(bound.righttop.lat, "bound.righttop.lat").to.be.closeTo(47.81315452, 0.00001)
    });

    it("getWGS84TileBounds #4", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let bound = mbr.getWGS84TileBounds({ x: 5, y: 10 }, 10)
        expect(bound).to.have.property("leftbottom");
        expect(bound).to.have.property("righttop");
        expect(bound.leftbottom.lng, "bound.leftbottom.lng").to.be.closeTo(-178.242187, 0.00001)
        expect(bound.leftbottom.lat, "bound.leftbottom.lat").to.be.closeTo(84.706049, 0.00001)
        expect(bound.righttop.lng, "bound.righttop.lng").to.be.closeTo(-177.890625, 0.00001)
        expect(bound.righttop.lat, "bound.righttop.lat").to.be.closeTo(84.738387, 0.00001)
    });

    it("getWGS84TileCenter #1", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let center = mbr.getWGS84TileCenter({ x: 0, y: 0 }, 0)
        expect(center).to.have.property("lng");
        expect(center).to.have.property("lat");
        expect(center.lng, "center.lng").to.be.closeTo(0, 0.00001)
        expect(center.lat, "center.lat").to.be.closeTo(0, 0.00001)
    });

    it("getWGS84TileCenter #2", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let center = mbr.getWGS84TileCenter({ x: 4383, y: 2854 }, 13)
        expect(center).to.have.property("lng");
        expect(center).to.have.property("lat");
        expect(center.lng, "center.lng").to.be.closeTo(12.63427717, 0.00001)
        expect(center.lat, "center.lat").to.be.closeTo(47.79839469, 0.00001)
    });
})


describe("Render Tests", function () {
    it("load a mapbox style", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        return mbr.loadStyle("test/assets/background-only.style.json")
    });

    it("render background", async function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let renderParam: render.RenderParameters = {
            center: [0, 0],
            zoom: 0,
            width: 256,
            height: 256
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        await mbr.loadStyle(`${testAssetsPath}background-only.style.json`);
        await mbr.render(renderParam, `${testOutputPath}background-only.png`);
        let specimen = await sharp(`${testOutputPath}background-only.png`).metadata();
        expect(specimen).to.include({"format": "png", "width": 256, "height": 256, "channels": 4});
    });

    it("render features from local file #1", async function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let width: number = 512;
        let height: number = 512;

        let renderParam: render.RenderParameters = {
            center: [12.63427717, 47.79839469],
            zoom: 13,
            width: width,
            height: height
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        await mbr.loadStyle("test/assets/local-file.style.json");
        await mbr.render(renderParam, "test/out/landuse-roads-points.png");

        let specimen = await sharp("test/out/landuse-roads-points.png").raw().toBuffer();
        let reference = await sharp("test/assets/landuse-roads-points-golden.png").raw().toBuffer();
        let diff = await sharp({ create: { width: width, height: height, channels: 4, background: "#000" } }).raw().toBuffer();
        let mismatchedPixels = pixelmatch(specimen, reference, diff, width, height);
        await sharp(diff, { raw: { width: width, height: height, channels: 4 } }).png().toFile("test/out/landuse-roads-points-golden-diff.png");
        expect(mismatchedPixels, "mismatchedPixels").to.be.closeTo(0, 5);
    });

    it("render features from local file #2 (negative test)", async function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let width: number = 512;
        let height: number = 512;
        let renderParam: render.RenderParameters = {
            center: [12.63427717, 47.79839469],
            zoom: 13,
            width: width,
            height: height
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        await mbr.loadStyle("test/assets/local-file.style.json");
        await mbr.render(renderParam, "test/out/landuse-roads-points.png");

        let specimen = await sharp("test/out/landuse-roads-points.png").raw().toBuffer();
        let reference = await sharp("test/assets/landuse-roads-points-negative.png").raw().toBuffer();
        let diff = await sharp({ create: { width: width, height: height, channels: 4, background: "#000" } }).raw().toBuffer();
        let mismatchedPixels = pixelmatch(specimen, reference, diff, width, height);
        await sharp(diff, { raw: { width: width, height: height, channels: 4 } }).png().toFile("test/out/landuse-roads-points-negative-diff.png");
        expect(mismatchedPixels, "mismatchedPixels").to.be.closeTo(459, 15);
    });

    it("render features from external mapbox ressources", async function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false,
            accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg"
        };
        let width: number = 512;
        let height: number = 512;

        let mbr = new render.MapboxRender(mapboxRenderOptions);
        let center:render.WGS84 = mbr.getWGS84TileCenter({x: 1093, y:715}, 11)
        let renderParam: render.RenderParameters = {
            center: [center.lng, center.lat],
            zoom: 11,
            width: width,
            height: height
        };
        
        await mbr.loadStyle(`${testAssetsPath}mapbox-ressource.style.json`);
        await mbr.render(renderParam, `${testOutputPath}hillshading-contourlines.png`);

        expect(true).to.be.true;

        let specimen = await sharp(`${testOutputPath}hillshading-contourlines.png`).raw().toBuffer();
        let reference = await sharp(`${testAssetsPath}hillshading-contourlines-golden.png`).raw().toBuffer();
        let diff = await sharp({ create: { width: width, height: height, channels: 4, background: "#000" } }).raw().toBuffer();
        let mismatchedPixels = pixelmatch(specimen, reference, diff, width, height);
        await sharp(diff, { raw: { width: width, height: height, channels: 4 } }).png().toFile(`${testOutputPath}hillshading-contourlines-golden-diff.png`);
        expect(mismatchedPixels, "mismatchedPixels").to.be.closeTo(0, 5);
    });

});


describe('Error handling tests', function () {

    it("Try to load a NOT existing style", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        return mbr.loadStyle("this-file-does-not-exist.json")
            .catch((e) => {
                expect(e).to.be.an("Error");
                expect(e).to.have.property("errno");
                expect(e.errno).to.be.below(0);
                expect(e).to.include({"code": "ENOENT", "syscall": "open", "path": "this-file-does-not-exist.json"});
            });
    });

    it("Try to load a corrupted style", function () {
        let mapboxRenderOptions: render.MapboxRenderOptions = {
            styleUrl: "",
            debug: false
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        return mbr.loadStyle("test/assets/this-is-not-a-style.json")
            .catch((e) => {
                expect(e).to.be.an("Error");
                expect(e).to.have.property("message", "Failed to parse style: 0 - Invalid value.");
            });
    });

    // it("Try to save image to a write-protected file");  // to-do for mocha
    test.todo("Try to save image to a write-protected file"); // to-do for jest
});
