import * as util from "util";
import * as fs from "fs";
import * as mbgl from "@mapbox/mapbox-gl-native";
import * as sharp from "sharp";
import * as requestPromise from "request-promise-native";
import * as URL from "url-parse";

const asyncReadFile = util.promisify(fs.readFile);


export interface MapboxRenderOptions {
    styleUrl: string,
    accessToken?: string,
    debug?: boolean,
    ratio?: number,
    tilesize?: number
}

export interface RenderParameters {
    center: number[],
    zoom: number,
    width: number,
    height: number,
    bearing?: number,
    pitch?: number
}

export interface WGS84 {
    lng: number, // °
    lat: number  // °
}

export interface Mercator {
    x: number,   // m
    y: number    // m
}

export interface Vector {
    x: number,
    y: number
}

export interface WGS84BoundingBox {
    leftbottom: WGS84,
    righttop: WGS84
}

export interface MercatorBoundingBox {
    leftbottom: Mercator,
    righttop: Mercator
}

enum UrlType {
    unknown = 0,
    mapbox,
    mapboxTile,
    mapboxFont,
    mapboxSprite,
    file,
    http
}

interface ResolvedUrl {
    url: string,
    type: UrlType
}

/** Render mapbox-gl-styles */
export class MapboxRender {
    protected options: MapboxRenderOptions;
    protected style: string = "";
    protected map: mbgl.Map;
    protected originShift = 2 * Math.PI * 6378137 / 2.0;

    // protected asyncRender: any;

    private handleRequest = async (mapSourceRequest: mbgl.MapSourceRequest, callback: (error: Error | null, sourceResponse?: mbgl.MapSourceResponse) => void) => {

        let resolvedUrl: ResolvedUrl = this.resolveUrl(mapSourceRequest.url);
        this.debug(`${mapSourceRequest.kind} ${mapSourceRequest.url}\n => ${resolvedUrl.type} ${resolvedUrl.url}`);

        if (resolvedUrl.url.length === 0) {
            this.debug(`Unknown URL: ${mapSourceRequest.url}`)
            callback(new Error(`Unknown UrlType ${mapSourceRequest.url}`));
        }
        else {
            if (resolvedUrl.type === UrlType.http) {
                try {
                    this.debug(`READING: ${resolvedUrl.url}`)
                    let responseData = await requestPromise({
                        url: resolvedUrl.url,
                        encoding: null,
                        gzip: true,
                        resolveWithFullResponse: true,
                        timeout: 5000
                    });
                    this.debug(`DONE READING: ${resolvedUrl.url}`)
                    if (responseData.statusCode === 200) {
                        let mapSourceResponse: mbgl.MapSourceResponse = {
                            modified: (responseData.headers.modified) ? new Date(responseData.headers.modified[0]) : undefined,
                            expires: (responseData.headers.expires) ? new Date(responseData.headers.expires) : undefined,
                            etag: (responseData.headers.etag) ? responseData.headers.etag : undefined,
                            data: responseData.body
                        };
                        callback(null, mapSourceResponse);
                    }
                    else {
                        callback(new Error(`${responseData.statusCode} - ${responseData.statusMessage}: ${responseData.request.href}`));
                    }
                } catch (err) {
                    this.debug(`ERROR READING: ${resolvedUrl.url}`)
                    if (err.cause) {
                        callback(new Error(`${err.cause.syscall} - ${err.options.url}: ${err.cause.code}`));
                    }
                    else {
                        callback(new Error(`${err.response.statusCode} - ${err.response.statusMessage}: ${err.response.request.href}`));
                    }
                }
            }
            else if (resolvedUrl.type === UrlType.file) {
                try {
                    let data = await asyncReadFile(resolvedUrl.url);
                    let mapSourceResponse: mbgl.MapSourceResponse = {
                        modified: undefined,
                        expires: undefined,
                        etag: undefined,
                        data: data
                    };
                    callback(null, mapSourceResponse);
                } catch (err) {
                    let mapSourceResponse: mbgl.MapSourceResponse = {
                        modified: undefined,
                        expires: undefined,
                        etag: undefined,
                        data: new Buffer("")
                    };
                    callback(null, mapSourceResponse);
                }
            }
            else callback(new Error(`Unknown type: ${resolvedUrl.type}`));
        }
    }

    protected mapOptions: mbgl.MapOptions = {
        request: this.handleRequest,
        ratio: 1.0
    };

    /**
     * Render mapbox style
     * @constructor
     * @param options General options used to create the instance
     */
    constructor(options: MapboxRenderOptions) {
        this.options = options;
        this.mapOptions = { ...this.mapOptions, ...{ ratio: this.options.ratio || 1.0 } }
        this.map = new mbgl.Map(this.mapOptions);
        // this.asyncRender = util.promisify(this.map.render);

    }

    /**
    * Print a debug message to console if this.options.debug=true
    * @param message Message to print
    */
    private debug(message: string): void {
        /* istanbul ignore next */
        if (this.options.debug) {
            console.log(message);
        }
    }

    /**
    * Panic mode
    * @param error Error that caused the panic
    */
    private error(error: Error): never {
        throw error;
    }


    /** Evaluate type of given url
     *  Mapbox-URLs are of the form `mapbox://<mapid>`
     *  For vector-tiles <mapid> is one of
     *      `mapbox.mapbox-streets-v8`
     *      `mapbox.mapbox-terrain-v2`
     *      `mapbox.mapbox-traffic-v1`
     *      `mapbox.enterprise-boundaries-XX-YY`
     * 
     * deprecated:
     *      `mapbox.mapbox-streets-v7`
     *      `mapbox.mapbox-streets-v6`
     *      `mapbox.mapbox-streets-v5`
     * 
     *  For 
     * 
     *  see `https://docs.mapbox.com/vector-tiles/reference/` for a description.
     * 
     * @param url URL to evaluate
     * @return Protocol that is defined by the URL
    */
    private getUrlType(url: string): UrlType {
        // let typeMap:object = {
        //     "mapbox://tiles": UrlType.mapboxTile,
        //     "mapbox://fonts": UrlType.mapboxFont
        //     "mapbox://": UrlType.mapbox
        // }
        // FIXME: Use a map with regex or something
        if (url.startsWith("mapbox://tiles")) {
            return UrlType.mapboxTile
        }
        else if (url.startsWith("mapbox://fonts")) {
            return UrlType.mapboxFont;
        }
        else if (url.startsWith("mapbox://sprites")) {
            return UrlType.mapboxSprite;
        }
        else if (url.startsWith("mapbox://")) {
            return UrlType.mapbox;
        }
        else if (url.startsWith('http')) {
            return UrlType.http
        }
        else if (url.startsWith('file://')) {
            return UrlType.file
        }
        return UrlType.unknown
    }

    /**
    * mapbox-URLs used in style-files (e.g. `mapbox://mapbox.terrain-rgb`) must be resolved to an actual 
    * URL (like `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png`) before we can request the data.
    * Also, an API-Key (`access_token`) will be added to allow downloading mapbox ressources.
    * If you get 404-errors you need to start looking here...
    * @param url The URL that needs resolving
    * @return ResolvedUrl-Object that can be used in `request`.
    */
    private resolveUrl(url: string): ResolvedUrl {
        // adapt/modify url if needed
        let resolvedUrl: ResolvedUrl = { type: this.getUrlType(url), url: url };

        switch (resolvedUrl.type) {
            case UrlType.mapbox:
            case UrlType.mapboxTile:
            case UrlType.mapboxFont:
            case UrlType.mapboxSprite:
                let urlObject = new URL(url, true);
                // this.debug(urlObject);

                if (resolvedUrl.type === UrlType.mapboxTile) {
                    // combine given query string with access_token and secury-property. Given properties are preserved
                    urlObject.set("query", { ...{ access_token: this.options.accessToken }, ...urlObject.query });
                    urlObject.set("pathname", `/v4${urlObject.pathname}`);
                }
                else if (resolvedUrl.type === UrlType.mapboxFont) {
                    urlObject.set("query", { ...{ access_token: this.options.accessToken }, ...urlObject.query });
                    urlObject.set("pathname", `/fonts/v1${urlObject.pathname}`);
                }
                else if (resolvedUrl.type === UrlType.mapboxSprite) {
                    // console.log(urlObject);
                    urlObject.set("query", { ...{ access_token: this.options.accessToken }, ...urlObject.query });
                    let style = urlObject.pathname.split(".")[0];
                    let ext = urlObject.pathname.split(".")[1];
                    let ratio = "";
                    if (style.indexOf("@") > 0) {
                        // console.log(style);
                        ratio = "@"+style.split("@")[1];
                        style = style.split("@")[0];
                    }
                    urlObject.set("pathname", `/styles/v1${style}/sprite${ratio}.${ext}`);
                }
                else {
                    // combine given query string with access_token and secury-property. Given properties are preserved
                    urlObject.set("query", { ...{ secure: true, access_token: this.options.accessToken }, ...urlObject.query });
                    urlObject.set("pathname", `/v4/${urlObject.origin.split('mapbox://')[1]}.json`);
                }
                urlObject.set("protocol", "https");
                urlObject.set("host", "api.mapbox.com");
                resolvedUrl.url = urlObject.toString();
                // update type after rewriting
                resolvedUrl.type = this.getUrlType(resolvedUrl.url);
            case UrlType.http:
                break;
            case UrlType.file:
                resolvedUrl.url = resolvedUrl.url.split("file://")[1];
                break;
            /* istanbul ignore next */
            default:
                break;
        }
        return resolvedUrl;
    }

    /** Converts XY point from Pseudo-Mercator (https://epsg.io/3857) to WGS84 (https://epsg.io/4326) */
    getWGS84FromMercator(pos: Mercator): WGS84 {
        let lon = (pos.x / this.originShift) * 180.0;
        let lat = (pos.y / this.originShift) * 180.0;
        lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2.0)
        return (<WGS84>{ lng: lon, lat: lat })
    }

    /** Converts pixel coordinates (Origin is top-left) in given zoom level of pyramid to EPSG:900913 */
    getMercatorFromPixels(pos: Vector, zoom: number, tileSize: number = 256): Mercator {
        // zoom = Math.max(0, zoom + 1 - tileSize / 256)
        let res = 2 * Math.PI * 6378137 / tileSize / Math.pow(2, zoom);
        return (<Mercator>{ x: pos.x * res - this.originShift, y: this.originShift - pos.y * res })
    }

    /** Returns bounds of the given tile in Pseudo-Mercator (https://epsg.io/3857) coordinates */
    getMercatorTileBounds(tile: Vector, zoom: number, tileSize: number = 256): MercatorBoundingBox {
        let leftbottom = this.getMercatorFromPixels(<Vector>{ x: tile.x * tileSize, y: (tile.y + 1) * tileSize }, zoom, tileSize);
        let righttop = this.getMercatorFromPixels(<Vector>{ x: (tile.x + 1) * tileSize, y: tile.y * tileSize }, zoom, tileSize);
        return ({ leftbottom: leftbottom, righttop: righttop })
    }

    /** Returns bounds of the given tile in WGS84 (https://epsg.io/4326) coordinates */
    getWGS84TileBounds(tile: Vector, zoom: number, tileSize: number = 256): WGS84BoundingBox {
        let bounds: MercatorBoundingBox = this.getMercatorTileBounds(tile, zoom, tileSize);
        return (<WGS84BoundingBox>{
            leftbottom: this.getWGS84FromMercator(bounds.leftbottom),
            righttop: this.getWGS84FromMercator(bounds.righttop)
        })
    }

    /** Returns center of the given tile in WGS84 (https://epsg.io/4326) coordinates */
    getWGS84TileCenter(tile: Vector, zoom: number, tileSize: number = 256): WGS84 {
        let bounds: WGS84BoundingBox = this.getWGS84TileBounds(tile, zoom, tileSize);
        return (<WGS84>{
            lng: (bounds.righttop.lng + bounds.leftbottom.lng) / 2,
            lat: (bounds.righttop.lat + bounds.leftbottom.lat) / 2,
        })
    }


    /** Set up mapbox-library with a mapbox-style
     * @param styleUrl
     */
    async loadStyle(styleUrl?: string) {
        this.options.styleUrl = styleUrl ? styleUrl : this.options.styleUrl;
        try {
            this.style = await asyncReadFile(this.options.styleUrl, { encoding: "utf-8" });
            this.map.load(this.style);
        } catch (error) {
            this.error(error);
        }
    }


    async render(param: RenderParameters, outputFile: string): Promise<boolean | Error> {
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

        return new Promise<boolean>((resolve, reject) => {
            this.map.render(param, (err, buffer) => {
                if (err) {
                    reject(err);
                }
                this.map.release();
                var image = sharp(buffer, {
                    raw: {
                        width: param.width*this.mapOptions.ratio,
                        height: param.height*this.mapOptions.ratio,
                        channels: 4
                    }
                });
                // Convert raw image buffer to PNG
                image.toFile(outputFile, function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve(true);
                });

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