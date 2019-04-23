import * as mbgl from "@mapbox/mapbox-gl-native";
import * as sharp from "sharp";
// import * as fs from "fs";
// import * as path from "path";
import * as request from "request";

let debug: boolean = true;

let options: mbgl.MapOptions = {
    request: function (mapSourceRequest, callback) {
        if (debug) {
            console.log("url=`" + mapSourceRequest.url + "` kind=" + mapSourceRequest.kind)
        }

        request({
            url: mapSourceRequest.url,
            encoding: null,
            gzip: true
        }, function (err, res, body) {
            if (err) {
                callback(err);
            } else if (res.statusCode == 200) {
                let response: mbgl.MapSourceResponse = {
                    modified: (res.headers.modified) ? new Date(res.headers.modified[0]) : undefined,
                    expires: (res.headers.expires) ? new Date(res.headers.expires) : undefined,
                    etag: (res.headers.etag) ? res.headers.etag : undefined,
                    data: body
                }
                callback(null, response);
            } else {
                callback(new Error(JSON.parse(body).message));
            }
        });
    },
    ratio: 1.0
};

var map = new mbgl.Map(options);

import * as style from '../data/cyclemap.json';
map.load(<any>style);

map.render({ zoom: 11, width: 1024, height: 512, center: [12.5, 47.9] }, function (err, buffer) {
    if (err) throw err;

    map.release();

    var image = sharp(buffer, {
        raw: {
            width: 1024,
            height: 512,
            channels: 4
        }
    });

    // Convert raw image buffer to PNG
    image.toFile('data/image.png', function (err) {
        if (err) throw err;
    });
});


interface MapboxRenderOptions {
    accessToken?: string,
}


class MapboxRender {
    options: MapboxRenderOptions;

    constructor(options: MapboxRenderOptions) {
        this.options = options;
    }
}


let mapboxRenderOptions: MapboxRenderOptions = {
    accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg"
}
let mbr = new MapboxRender(mapboxRenderOptions);
