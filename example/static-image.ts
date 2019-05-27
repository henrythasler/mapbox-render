import * as render from "../dist/index";

let mapboxRenderOptions: render.MapboxRenderOptions = {
    styleUrl: "",
    accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg",
    debug: true,
    ratio: 1
}

let mbr = new render.MapboxRender(mapboxRenderOptions);

let renderParam: render.RenderParameters = {
    center: [11.6, 47.28],
    zoom: 11,
    width: 512,
    height: 512
}

mbr.loadStyle("example/hillshading.style.json")
    .then(() => {
        mbr.render(renderParam, "example/hillshading.png")
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

