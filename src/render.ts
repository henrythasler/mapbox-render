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
    debug?: boolean,
    ratio?: number
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
    mapboxFont,
    file,
    http
}


class MapboxRender {
    protected options: MapboxRenderOptions;
    protected style: string;
    protected map: mbgl.Map;
    // protected asyncRender: any;

    private handleRequest = async (mapSourceRequest: mbgl.MapSourceRequest, callback: (error: Error | null, sourceResponse?: mbgl.MapSourceResponse) => void) => {

        let resolvedUrl: string = this.resolveUrl(mapSourceRequest.url);
        this.debug(`${mapSourceRequest.kind} ${mapSourceRequest.url}\n => ${resolvedUrl}`);

        if (resolvedUrl.length === 0) {
            callback(new Error(`Unknown UrlType ${mapSourceRequest.url}`));
        }
        else {
            try {
                let responseData = await requestPromise({
                    url: resolvedUrl,
                    encoding: null,
                    gzip: true,
                    resolveWithFullResponse: true
                });

                if (responseData.statusCode === 200) {
                    let mapSourceResponse: mbgl.MapSourceResponse = {
                        modified: (responseData.headers.modified) ? new Date(responseData.headers.modified[0]) : undefined,
                        expires: (responseData.headers.expires) ? new Date(responseData.headers.expires) : undefined,
                        etag: (responseData.headers.etag) ? responseData.headers.etag : undefined,
                        data: responseData.body
                    }
                    callback(null, mapSourceResponse);
                }
                else {
                    callback(new Error(`${responseData.statusCode} - ${responseData.statusMessage}: ${responseData.request.href}`));
                }
            } catch (err) {
                callback(new Error(`${err.response.statusCode} - ${err.response.statusMessage}: ${err.response.request.href}`));
            }
        }
    }

    protected mapOptions: mbgl.MapOptions = {
        request: this.handleRequest,
        ratio: 1.0
    };

    constructor(options: MapboxRenderOptions) {
        this.options = options;
        this.mapOptions = { ...this.mapOptions, ...{ ratio: this.options.ratio || 1.0 } }
        this.map = new mbgl.Map(this.mapOptions);
        // this.asyncRender = util.promisify(this.map.render);

    }

    private debug(message: any): void {
        if (this.options.debug) {
            console.log(message);
        }
    }

    private error(error: Error): never {
        throw error;
    }

    private resolveUrl(url: string): string {
        // adapt/modify url if needed
        let urlType = this.getUrlType(url);

        switch (urlType) {
            case UrlType.mapbox:
            case UrlType.mapboxTile:
            case UrlType.mapboxFont:
                let urlObject = new URL(url, true);
                // this.debug(urlObject);

                if (urlType === UrlType.mapboxTile) {
                    // combine given query string with access_token and secury-property. Given properties are preserved
                    urlObject.set("query", { ...{ access_token: this.options.accessToken }, ...urlObject.query });
                    urlObject.set("pathname", `/v4${urlObject.pathname}`);
                }
                else if (urlType === UrlType.mapboxFont) {
                    urlObject.set("query", { ...{ access_token: this.options.accessToken }, ...urlObject.query });
                    urlObject.set("pathname", `/fonts/v1${urlObject.pathname}`);
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





    private getUrlType(url: string): UrlType {
        // FIXME: Use a map with regex or something
        if (url.startsWith("mapbox://tiles")) {
            return UrlType.mapboxTile
        }
        else if (url.startsWith("mapbox://fonts")) {
            return UrlType.mapboxFont;
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

    async loadStyle(styleUrl?: string) {
        // await Promise.all([
        //     asyncReadFile(this.options.styleUrl, { encoding: "utf-8" }),
        //     this.asyncWait(1)
        // ])

        this.options.styleUrl = styleUrl ? styleUrl : this.options.styleUrl;
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

    async render(param: RenderParameters, outputFile: string) {
        // FIXME: find out why that does not work
        //        var asyncRender = util.promisify(this.map.render);
        // this.asyncRender(param)
        //     .then((buffer:any) => {
        //         this.map.release();
        //         var image = sharp(buffer, {
        //             raw: {
        //                 width: param.width,
        //                 height: param.height,
        //                 channels: 4
        //             }
        //         });
        //         // Convert raw image buffer to PNG
        //         image.toFile('data/image.png', function (err) {
        //             if (err) throw err;
        //         });
        //     })
        //     .catch((err:Error) => {
        //         this.debug(err)
        //     });

        this.map.render(param, (err, buffer) => {
            if (err) this.error(err);
            this.map.release();
            var image = sharp(buffer, {
                raw: {
                    width: param.width,
                    height: param.height,
                    channels: 4
                }
            });
            // Convert raw image buffer to PNG
            image.toFile(outputFile, function (err) {
                if (err) throw err;
            });
        });

        // try {
        //     let buffer = await this.asyncRender(param)
        //     this.map.release();
        //     var image = sharp(buffer, {
        //         raw: {
        //             width: param.width,
        //             height: param.height,
        //             channels: 4
        //         }
        //     });
        //     // Convert raw image buffer to PNG
        //     image.toFile('data/image.png', function (err) {
        //         if (err) throw err;
        //     });
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
    styleUrl: "data/cyclemap-simple.json",  // see https://en.wikipedia.org/wiki/URL; https://url.spec.whatwg.org/
    accessToken: "pk.eyJ1IjoibXljeWNsZW1hcCIsImEiOiJjaXJhYnoxcGEwMDRxaTlubnk3cGZpbTBmIn0.TEO9UhyyX1nFKDTwO4K1xg",
    debug: true,
    ratio: 2
}

let mbr = new MapboxRender(mapboxRenderOptions);

let renderParam: RenderParameters = {
    center: [12.75491, 47.75418],
    zoom: 14,
    width: 1280,
    height: 768
}

mbr.loadStyle("data/cyclemap-simple.json")
    .then(() => {
        mbr.render(renderParam, "data/image.png")
            .then(() => {
                console.log("done")
            }).catch((err: Error) => {
                console.error(err)
            });
    });


