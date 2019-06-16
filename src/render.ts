import * as util from "util";
import * as fs from "fs";
import * as mbgl from "@mapbox/mapbox-gl-native";
import * as sharp from "sharp";
import * as requestPromise from "request-promise-native";
import * as URL from "url-parse";

const asyncReadFile = util.promisify(fs.readFile);

export interface Settings {
    styleUrl: string,
    accessToken?: string,
    debug?: boolean,
    ratio?: number,
    tilesize?: number
}

/** pass-thru mbgl-interface */
export interface RenderOptions extends mbgl.RenderOptions {

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
    protected options: Settings;
    protected style: string = "";
    protected map: mbgl.Map;

    // protected asyncRender: any;

    private handleRequest = async (mapSourceRequest: mbgl.MapSourceRequest, callback: (error: Error | null, sourceResponse?: mbgl.MapSourceResponse) => void) => {

        let resolvedUrl: ResolvedUrl = this.resolveUrl(mapSourceRequest.url);
        this.debug(`${mapSourceRequest.kind} ${mapSourceRequest.url}\n => ${resolvedUrl.type} ${resolvedUrl.url}`);

        if (resolvedUrl.url.length === 0) {
            callback(new Error(`Invalid Url ${mapSourceRequest.url}`));
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
                    callback(err);   
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
    constructor(options: Settings) {
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
     * @param url URL to evaluate
     * @return Protocol that is defined by the URL
    */
    private getUrlType(url: string): UrlType {
        var UrlTypes : { [pattern:string]:UrlType; } = {
            "mapbox:\/\/mapbox": UrlType.mapbox,
            "mapbox:\/\/tiles": UrlType.mapboxTile,
            "mapbox:\/\/fonts": UrlType.mapboxFont,
            "mapbox:\/\/sprites": UrlType.mapboxSprite,
            "http": UrlType.http,
            "file:\/\/": UrlType.file,
        }

        for (let item in UrlTypes) {
            if (url.startsWith(item)) {
                return UrlTypes[item];
            }
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

    async renderToFile(param: mbgl.RenderOptions, outputFile: string): Promise<boolean | Error> {
        return new Promise<boolean | Error>((resolve, reject) => {
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
    }

    async renderToImage(param: mbgl.RenderOptions): Promise<sharp.Sharp | Error> {
        return new Promise<sharp.Sharp | Error>((resolve, reject) => {
            this.map.render(param, (err, buffer) => {
                if (err) {
                    reject(err);
                }
                this.map.release();
                resolve(sharp(buffer, {
                    raw: {
                        width: param.width*this.mapOptions.ratio,
                        height: param.height*this.mapOptions.ratio,
                        channels: 4
                    }
                }));
            });
        });
    }
}