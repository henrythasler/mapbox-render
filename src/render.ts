import * as util from "util";
import * as fs from "fs";
import * as mbgl from "@mapbox/mapbox-gl-native";
import * as sharp from "sharp";
// import * as path from "path";
import * as request from "request";

const asyncReadFile = util.promisify(fs.readFile);

// let debug: boolean = true;

// let options: mbgl.MapOptions = {
//     request: function (mapSourceRequest, callback) {
//         if (debug) {
//             console.log("url=`" + mapSourceRequest.url + "` kind=" + mapSourceRequest.kind)
//         }

//         request({
//             url: mapSourceRequest.url,
//             encoding: null,
//             gzip: true
//         }, function (err, res, body) {
//             if (err) {
//                 callback(err);
//             } else if (res.statusCode == 200) {
//                 let response: mbgl.MapSourceResponse = {
//                     modified: (res.headers.modified) ? new Date(res.headers.modified[0]) : undefined,
//                     expires: (res.headers.expires) ? new Date(res.headers.expires) : undefined,
//                     etag: (res.headers.etag) ? res.headers.etag : undefined,
//                     data: body
//                 }
//                 callback(null, response);
//             } else {
//                 callback(new Error(JSON.parse(body).message));
//             }
//         });
//     },
//     ratio: 1.0
// };

// var map = new mbgl.Map(options);

// import * as style from '../data/cyclemap.json';
// map.load(<any>style);

// map.render({ zoom: 11, width: 1024, height: 512, center: [12.5, 47.9] }, function (err, buffer) {
//     if (err) throw err;

//     map.release();

//     var image = sharp(buffer, {
//         raw: {
//             width: 1024,
//             height: 512,
//             channels: 4
//         }
//     });

//     // Convert raw image buffer to PNG
//     image.toFile('data/image.png', function (err) {
//         if (err) throw err;
//     });
// });


interface MapboxRenderOptions {
    styleUrl: string,
    accessToken?: string,
    debug?: boolean
}

interface RenderParameters {
    lat: number,
    lng: number,
    zoom: number,
    width: number,
    height: number
}

enum UrlType {
    mapbox = 0,
    file,
    http
}


class MapboxRender {
    protected options: MapboxRenderOptions;
    protected style: string = "";

    constructor(options: MapboxRenderOptions) {
        this.options = options;
    }

    private debug(message: any): void {
        if (this.options.debug) {
            console.log(message);
        }
    }

    private error(errorMsg: any): never {
        throw new Error(errorMsg);
    }

    private getUrlType(url: string): UrlType {
        this.debug(url);
        return UrlType.file
    }

    private wait(delay: number, callback:any) { /* … */ 
        const id = setInterval(() => {
            // Generate a random number between 0 and 1
            const rand = Math.random();
        
            if (rand > 0.95) {
              callback(null, 'Congratulations, you have finished waiting.');
              clearInterval(id);
            } else if (rand < 0.1) {
              callback('Could not wait any longer!', null);
              clearInterval(id);
            } else {
//              console.log('Waiting ...');
            }
          }, Number(delay));
    };
    private asyncWait = util.promisify(this.wait);

    render(param: RenderParameters, output: string): void {

        // Prepare stuff
        Promise.all([
            asyncReadFile(this.options.styleUrl, { encoding: "utf-8" }),
            this.asyncWait(1)
        ]).then((data:any[]) => {
            let message:string;
            [this.style, message] = data
            this.style = data[0]
            this.debug(this.style[0])
            this.debug(message)
        }).catch((err:Error) => {
//            this.error(err)
            console.error(`[Error]: ${err}`)
        });
    }
}

// main()
let mapboxRenderOptions: MapboxRenderOptions = {
    styleUrl: "data/cyclemap.json",  // see https://en.wikipedia.org/wiki/URL; https://url.spec.whatwg.org/
    accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg",
    debug: true
}

let mbr = new MapboxRender(mapboxRenderOptions);

let renderParam: RenderParameters = {
    lat: 12.5,
    lng: 47.9,
    zoom: 11,
    width: 1025,
    height: 512
}
mbr.render(renderParam, "data/image.png");