import * as render from "../dist/render.js";

let mapboxRenderOptions: render.MapboxRenderOptions = {
    styleUrl: "data/cyclemap-simple.json",  // see https://en.wikipedia.org/wiki/URL; https://url.spec.whatwg.org/
    accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg",
    debug: true,
    ratio: 2
}

let mbr = new render.MapboxRender(mapboxRenderOptions);

let renderParam: render.RenderParameters = {
    center: [12.75491, 47.75418],
    zoom: 14,
    width: 1280,
    height: 768
}

mbr.loadStyle("data/cyclemap-simple.json")
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

