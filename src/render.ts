import * as util from "util";
import * as fs from "fs";
import * as mbgl from "@mapbox/mapbox-gl-native";
import * as sharp from "sharp";
// import * as path from "path";
import * as requestPromise from "request-promise-native";
import * as URL from "url-parse";
import { resolve } from "dns";

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
    center: number[],
    zoom: number,
    width: number,
    height: number
}

enum UrlType {
    unknown = 0,
    mapbox,
    mapboxTile,
    file,
    http
}


class MapboxRender {
    protected options: MapboxRenderOptions;
    protected style: string;
    protected map: mbgl.Map;
    //    protected asyncMapRender: Promise<Buffer>;

    constructor(options: MapboxRenderOptions) {
        this.options = options;
        this.map = new mbgl.Map(this.mapOptions);
        //        this.asyncMapRender = util.promisify(this.map.render)

    }

    private debug(message: any): void {
        if (this.options.debug) {
            console.log(message);
        }
    }

    private error(errorMsg: any): never {
        throw new Error(errorMsg);
    }

    private resolveUrl(url: string): string {
        // adapt/modify url if needed
        let urlType = this.getUrlType(url);
        this.debug(`${url}  ${urlType}`);

        switch (urlType) {
            case UrlType.mapbox:
            case UrlType.mapboxTile:
                let urlObject = new URL(url, true);
                // this.debug(urlObject);

                if (urlType === UrlType.mapboxTile) {
                    // combine given query string with access_token and secury-property. Given properties are preserved
                    urlObject.set("query", { ...{ access_token: this.options.accessToken }, ...urlObject.query });
                    urlObject.set("pathname", `/v4${urlObject.pathname}`);
                }
                else {
                    // combine given query string with access_token and secury-property. Given properties are preserved
                    urlObject.set("query", { ...{ secure: true, access_token: this.options.accessToken }, ...urlObject.query });
                    urlObject.set("pathname", `/v4/${urlObject.origin.split('mapbox://')[1]}.json`);
                }
                urlObject.set("protocol", "https");
                urlObject.set("host", "api.mapbox.com");
                return urlObject.toString();
            case UrlType.http:
                // resolvedUrl is already fine. Do nothing
                break;
            default:
                this.debug(`Unknown UrlType: ${urlType}`);
                return "";
        }
        return url;
    }

    private handleRequest = async (mapSourceRequest: mbgl.MapSourceRequest,
        callback: (error: Error | null, sourceResponse?: mbgl.MapSourceResponse) => void) => {

        let resolvedUrl: string = this.resolveUrl(mapSourceRequest.url);

        if (resolvedUrl.length === 0) {
            callback(new Error("Unknown UrlType"));
        }
        else {
            console.log(`Using: ${resolvedUrl}`);
            try {
                let responseData = await requestPromise({
                    url: resolvedUrl,
                    encoding: null,
                    gzip: true,
                    resolveWithFullResponse: true
                });

                if (responseData.statusCode == 200) {
                    let mapSourceResponse: mbgl.MapSourceResponse = {
                        modified: (responseData.headers.modified) ? new Date(responseData.headers.modified[0]) : undefined,
                        expires: (responseData.headers.expires) ? new Date(responseData.headers.expires) : undefined,
                        etag: (responseData.headers.etag) ? responseData.headers.etag : undefined,
                        data: responseData.body
                    }
                    // console.log(mapSourceResponse);
                    callback(null, mapSourceResponse);
                }
                else {
                    callback(new Error(JSON.parse(responseData.body).message));
                }
            } catch (error) {
                console.log("[ERROR] %s", error);
                callback(error);
            }
        }
    }

    protected mapOptions: mbgl.MapOptions = {
        request: this.handleRequest,
        ratio: 1.0
    };


    private getUrlType(url: string): UrlType {
        // FIXME: Use a map with regex or something
        if (url.startsWith("mapbox://tiles")) {
            return UrlType.mapboxTile
        }
        else if (url.startsWith("mapbox://")) {
            return UrlType.mapbox;
        }
        else if (url.startsWith('http://')) {
            return UrlType.http
        }
        return UrlType.unknown
    }


    private wait(delay: number, callback: any) { /* … */
        const id = setInterval(() => {
            // Generate a random number between 0 and 1
            const rand = Math.random();

            if (rand > 0.95) {
                callback(null, 'Congratulations, you have finished waiting.');
                clearInterval(id);
            } else if (rand < 0.02) {
                callback('Could not wait any longer!', null);
                clearInterval(id);
            } else {
                //              console.log('Waiting ...');
            }
        }, Number(delay));
    };
    private asyncWait = util.promisify(this.wait);

    async loadStyle() {
        // await Promise.all([
        //     asyncReadFile(this.options.styleUrl, { encoding: "utf-8" }),
        //     this.asyncWait(1)
        // ])
        try {
            this.style = await asyncReadFile(this.options.styleUrl, { encoding: "utf-8" });
            this.map.load(this.style);
        } catch (error) {
            console.error(error);
        }

        // let result:string="";
        // try {
        //     result = <string>await this.asyncWait(1);
        // } catch (error) {
        //     console.error(error);
        // }
    }


    render(param: RenderParameters, output: string) {
        this.map.render(param, (err, buffer) => {
            if (err) throw err;

            this.map.release();

            var image = sharp(buffer, {
                raw: {
                    width: param.width,
                    height: param.height,
                    channels: 4
                }
            });

            // Convert raw image buffer to PNG
            image.toFile('data/image.png', function (err) {
                if (err) throw err;
            });
        });
        // try {
        //     let buffer = await this.asyncMapRender({ zoom: 11, width: 1024, height: 512, center: [12.5, 47.9] })
        //     console.log(buffer);
        //     // this.map.release();
        //     // var image = sharp(buffer, {
        //     //     raw: {
        //     //         width: 1024,
        //     //         height: 512,
        //     //         channels: 4
        //     //     }
        //     // });
        //     // // Convert raw image buffer to PNG
        //     // image.toFile('data/image.png', function (err) {
        //     //     if (err) throw err;
        //     // });

        // } catch (error) {
        //     console.error(error);
        // }


        // this.loadStyle().then(() => {
        //     console.log("setup done.");
        // });

        // Prepare stuff
        //         Promise.all([
        //             asyncReadFile(this.options.styleUrl, { encoding: "utf-8" }),
        //             this.asyncWait(1)
        //         ]).then((data:any[]) => {
        //             let message:string;
        //             [this.style, message] = data
        //             this.style = data[0]
        //             this.debug(this.style[0])
        //             this.debug(message)
        //         }).catch((err:Error) => {
        // //            this.error(err)
        //             console.error(`[Error]: ${err}`)
        //         });
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
    center: [12.6584, 47.7589],
    zoom: 12,
    width: 1025,
    height: 512
}

mbr.loadStyle().then(() => {
    console.log("setup done.");
    mbr.render(renderParam, "data/image.png");
    // mbr.render(renderParam, "data/image.png").then(() => {
    //     console.log("done")
    // }).catch((err: Error) => {
    //     console.error(err)
    // });
});


