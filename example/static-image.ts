import * as render from "../dist/render.js";

let mapboxRenderOptions: render.MapboxRenderOptions = {
    styleUrl: "data/cyclemap-simple.json",  // see https://en.wikipedia.org/wiki/URL; https://url.spec.whatwg.org/
    accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg",
    debug: true,
    ratio: 1
}

let mbr = new render.MapboxRender(mapboxRenderOptions);

let renderParam: render.RenderParameters = {
    center: [11.5757, 47.8399],
    zoom: 14,
    width: 512,
    height: 512
}

mbr.loadStyle("example/cyclemap-simple.json")
    .then(() => {
        mbr.render(renderParam, "example/image.png")
            .then(() => {
                console.log("done")
            })
            .catch((err: Error) => {
                console.error(err)
            });
    })
    .catch( (err:Error) => {
        console.error(err)
    });

