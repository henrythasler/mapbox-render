import * as render from "../src/render";
import { Projection, Wgs84} from "../src/projection";
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

const mapboxRenderOptions: render.MapboxRenderOptions = {
    styleUrl: "test/assets/background-only.style.json",
    debug: false,
    accessToken: ""
};

const proj = new Projection();

describe("Render Tests", function () {
    it("load a mapbox style", function () {
        let mbr = new render.MapboxRender(mapboxRenderOptions);
        return mbr.loadStyle("test/assets/background-only.style.json")
    });

    it("render background", async function () {
        let renderParam: render.RenderParameters = {
            center: [0, 0],
            zoom: 0,
            width: 256,
            height: 256
        };
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        await mbr.loadStyle();
        await mbr.renderToFile(renderParam, `${testOutputPath}background-only.png`);
        let specimen = await sharp(`${testOutputPath}background-only.png`).metadata();
        expect(specimen).to.include({ "format": "png", "width": 256, "height": 256, "channels": 4 });
    });

    it("render features from local file #1", async function () {
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
        await mbr.renderToFile(renderParam, "test/out/landuse-roads-points.png");

        let specimen = await sharp("test/out/landuse-roads-points.png").raw().toBuffer();
        let reference = await sharp("test/assets/landuse-roads-points-golden.png").raw().toBuffer();
        let diff = await sharp({ create: { width: width, height: height, channels: 4, background: "#000" } }).raw().toBuffer();
        let mismatchedPixels = pixelmatch(specimen, reference, diff, width, height);
        await sharp(diff, { raw: { width: width, height: height, channels: 4 } }).png().toFile("test/out/landuse-roads-points-golden-diff.png");
        expect(mismatchedPixels, "mismatchedPixels").to.be.closeTo(0, 5);
    });

    it("render features from local file #2 (negative test)", async function () {
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
        await mbr.renderToFile(renderParam, "test/out/landuse-roads-points.png");

        let specimen = await sharp("test/out/landuse-roads-points.png").raw().toBuffer();
        let reference = await sharp("test/assets/landuse-roads-points-negative.png").raw().toBuffer();
        let diff = await sharp({ create: { width: width, height: height, channels: 4, background: "#000" } }).raw().toBuffer();
        let mismatchedPixels = pixelmatch(specimen, reference, diff, width, height);
        await sharp(diff, { raw: { width: width, height: height, channels: 4 } }).png().toFile("test/out/landuse-roads-points-negative-diff.png");
        expect(mismatchedPixels, "mismatchedPixels").to.be.closeTo(459, 15);
    });

    it("render raster and vector features from external mapbox ressources", async function () {
        let width: number = 512;
        let height: number = 512;

        let mbr = new render.MapboxRender({ ...mapboxRenderOptions, ...{ accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg" } });
        let center: Wgs84 = proj.getWGS84TileCenter({ x: 1093, y: 715 }, 11)
        let renderParam: render.RenderParameters = {
            center: [center.lng, center.lat],
            zoom: 11,
            width: width,
            height: height
        };

        await mbr.loadStyle(`${testAssetsPath}mapbox-ressource.style.json`);
        await mbr.renderToFile(renderParam, `${testOutputPath}hillshading-contourlines.png`);

        let specimen = await sharp(`${testOutputPath}hillshading-contourlines.png`).raw().toBuffer();
        let reference = await sharp(`${testAssetsPath}hillshading-contourlines-golden.png`).raw().toBuffer();
        let diff = await sharp({ create: { width: width, height: height, channels: 4, background: "#000" } }).raw().toBuffer();
        let mismatchedPixels = pixelmatch(specimen, reference, diff, width, height);
        await sharp(diff, { raw: { width: width, height: height, channels: 4 } }).png().toFile(`${testOutputPath}hillshading-contourlines-golden-diff.png`);
        expect(mismatchedPixels, "mismatchedPixels").to.be.closeTo(0, 5);
    });

    it("render text and icons from external mapbox ressources", async function () {
        let width: number = 512;
        let height: number = 512;

        let mbr = new render.MapboxRender({ ...mapboxRenderOptions, ...{ debug: false, accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg" } });
        let center: Wgs84 = proj.getWGS84TileCenter({ x: 4383, y: 2854 }, 13)
        let renderParam: render.RenderParameters = {
            center: [center.lng, center.lat],
            zoom: 13,
            width: width,
            height: height
        };

        await mbr.loadStyle(`${testAssetsPath}mapbox-fonts-glyphs.style.json`);
        await mbr.renderToFile(renderParam, `${testOutputPath}text-icons.png`);

        let specimen = await sharp(`${testOutputPath}text-icons.png`).raw().toBuffer();
        let reference = await sharp(`${testAssetsPath}text-icons-golden.png`).raw().toBuffer();
        let diff = await sharp({ create: { width: width, height: height, channels: 4, background: "#000" } }).raw().toBuffer();
        let mismatchedPixels = pixelmatch(specimen, reference, diff, width, height);
        await sharp(diff, { raw: { width: width, height: height, channels: 4 } }).png().toFile(`${testOutputPath}text-icons-golden-diff.png`);
        expect(mismatchedPixels, "mismatchedPixels").to.be.closeTo(0, 5);
    });

    // this test fails with "@mapbox/mapbox-gl-native": "4.1.0"
    // see https://github.com/mapbox/mapbox-gl-native/issues/14532
    it("render text and icons from external mapbox ressources with format-expression", async function () {
        let width: number = 512;
        let height: number = 512;

        let mbr = new render.MapboxRender({ ...mapboxRenderOptions, ...{ debug: false, accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg" } });
        let center: Wgs84 = proj.getWGS84TileCenter({ x: 4383, y: 2854 }, 13)
        let renderParam: render.RenderParameters = {
            center: [center.lng, center.lat],
            zoom: 13,
            width: width,
            height: height
        };

        await mbr.loadStyle(`${testAssetsPath}mapbox-fonts-glyphs-format.style.json`);
        await mbr.renderToFile(renderParam, `${testOutputPath}text-icons-format.png`);

        let specimen = await sharp(`${testOutputPath}text-icons-format.png`).raw().toBuffer();
        let reference = await sharp(`${testAssetsPath}text-icons-golden.png`).raw().toBuffer();
        let diff = await sharp({ create: { width: width, height: height, channels: 4, background: "#000" } }).raw().toBuffer();
        let mismatchedPixels = pixelmatch(specimen, reference, diff, width, height);
        await sharp(diff, { raw: { width: width, height: height, channels: 4 } }).png().toFile(`${testOutputPath}text-icons-format-golden-diff.png`);
        // expect(mismatchedPixels, "mismatchedPixels").to.be.closeTo(0, 5);
    });

    it("render text and icons from external mapbox ressources with x2 scaling", async function () {
        let width: number = 512;
        let height: number = 512;

        let mbr = new render.MapboxRender({ ...mapboxRenderOptions, ...{ ratio: 2, accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg" } });
        let center: Wgs84 = proj.getWGS84TileCenter({ x: 4383, y: 2854 }, 13)
        let renderParam: render.RenderParameters = {
            center: [center.lng, center.lat],
            zoom: 13,
            width: width,
            height: height
        };

        await mbr.loadStyle(`${testAssetsPath}mapbox-fonts-glyphs.style.json`);
        await mbr.renderToFile(renderParam, `${testOutputPath}text-icons@2.png`);

        let specimen = await sharp(`${testOutputPath}text-icons@2.png`).raw().toBuffer();
        let reference = await sharp(`${testAssetsPath}text-icons@2-golden.png`).raw().toBuffer();
        let diff = await sharp({ create: { width: 2 * width, height: 2 * height, channels: 4, background: "#000" } }).raw().toBuffer();
        let mismatchedPixels = pixelmatch(specimen, reference, diff, 2 * width, 2 * height);
        await sharp(diff, { raw: { width: 2 * width, height: 2 * height, channels: 4 } }).png().toFile(`${testOutputPath}text-icons@2-golden-diff.png`);
        expect(mismatchedPixels, "mismatchedPixels").to.be.closeTo(0, 5);
    });

});


describe('Error handling tests', function () {
    let renderParam: render.RenderParameters = {
        center: [12.63427717, 47.79839469],
        zoom: 13,
        width: 256,
        height: 256
    };
    it("Try to load a NOT existing style", function () {
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        return mbr.loadStyle("this-file-does-not-exist.json")
            .catch((e) => {
                expect(e).to.be.an("Error");
                expect(e).to.have.property("errno");
                expect(e.errno).to.be.below(0);
                expect(e).to.include({ "code": "ENOENT", "syscall": "open", "path": "this-file-does-not-exist.json" });
            });
    });

    it("Try to load a corrupted style", function () {
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        return mbr.loadStyle("test/assets/this-is-not-a-style.json")
            .catch((e) => {
                expect(e).to.be.an("Error");
                expect(e).to.have.property("message", "Failed to parse style: 0 - Invalid value.");
            });
    });

    it("Try to save image to invalid location", async function () {
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        await mbr.loadStyle("test/assets/local-file.style.json");
        try {
            await mbr.renderToFile(renderParam, "test/not-existing/not-existing.png");
        }
        catch (e) {
            expect(e).to.be.an("Error");
            expect(e).to.have.property("message");
            expect(e.message).to.have.match(/unable to open file/);
        }
    });

    it("Try url that does not exist", async function () {
        let mbr = new render.MapboxRender({ ...mapboxRenderOptions, ...{ accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg" } });

        await mbr.loadStyle(`${testAssetsPath}url-not-found.style.json`);
        try {
            await mbr.renderToFile(renderParam, `${testOutputPath}dummy.png`);
        }
        catch (e) {
            expect(e).to.be.an("Error");
            expect(e).to.have.property("message");
            expect(e.message).to.have.match(/404 - Not Found/);
        }
    });

    it("Try to use an invalid mapbox-token", async function () {
        let mbr = new render.MapboxRender({ ...mapboxRenderOptions, ...{ accessToken: "pk.xxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx" } });

        await mbr.loadStyle(`${testAssetsPath}mapbox-fonts-glyphs.style.json`);
        try {
            await mbr.renderToFile(renderParam, `${testOutputPath}dummy.png`);
        }
        catch (e) {
            expect(e).to.be.an("Error");
            expect(e).to.have.property("message");
            expect(e.message).to.have.match(/401 - Unauthorized/);
        }
    });

    it("Try to read empty remote content", async function () {
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        await mbr.loadStyle(`${testAssetsPath}http-empty-response.style.json`);
        try {
            await mbr.renderToFile(renderParam, `${testOutputPath}dummy.png`);
        }
        catch (e) {
            expect(e).to.be.an("Error");
            expect(e).to.have.property("message");
            expect(e.message).to.have.match(/204 - No Content/);
        }
    });

    it("Try to use unknown protocol for source", async function () {
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        await mbr.loadStyle(`${testAssetsPath}protocol-error.style.json`);
        try {
            await mbr.renderToFile(renderParam, `${testOutputPath}dummy.png`);
        }
        catch (e) {
            expect(e).to.be.an("Error");
            expect(e).to.have.property("message", "Unknown type: 0");
        }
    });

    it("Try to read non-existing local file", async function () {
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        await mbr.loadStyle(`${testAssetsPath}local-file-not-found.style.json`);
        try {
            await mbr.renderToFile(renderParam, `${testOutputPath}dummy.png`);
        }
        catch (e) {
            expect(e).to.be.an("Error");
            expect(e).to.have.property("message", "ENOENT: no such file or directory, open \'test/assets/not_available_13_4383_2854.pbf\'");
        }
    });

    it("Try to use empty url", async function () {
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        await mbr.loadStyle(`${testAssetsPath}url-empty.style.json`);
        try {
            await mbr.renderToFile(renderParam, `${testOutputPath}dummy.png`);
        }
        catch (e) {
            expect(e).to.be.an("Error");
            expect(e).to.have.property("message", "Invalid Url ");
        }
    });

    it("Try to connect to unknown remote port", async function () {
        let mbr = new render.MapboxRender(mapboxRenderOptions);

        await mbr.loadStyle(`${testAssetsPath}host-not-found.style.json`);
        try {
            await mbr.renderToFile(renderParam, `${testOutputPath}dummy.png`);
        }
        catch (e) {
            expect(e).to.be.an("Error");
            expect(e).to.have.property("message", "connect - https://localhost:1: ECONNREFUSED");
        }
    });



});
