"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var util = require("util");
var fs = require("fs");
var mbgl = require("@mapbox/mapbox-gl-native");
var sharp = require("sharp");
var requestPromise = require("request-promise-native");
var URL = require("url-parse");
var asyncReadFile = util.promisify(fs.readFile);
var UrlType;
(function (UrlType) {
    UrlType[UrlType["unknown"] = 0] = "unknown";
    UrlType[UrlType["mapbox"] = 1] = "mapbox";
    UrlType[UrlType["mapboxTile"] = 2] = "mapboxTile";
    UrlType[UrlType["mapboxFont"] = 3] = "mapboxFont";
    UrlType[UrlType["file"] = 4] = "file";
    UrlType[UrlType["http"] = 5] = "http";
})(UrlType || (UrlType = {}));
/** Render mapbox-gl-styles */
var MapboxRender = /** @class */ (function () {
    /**
     * Render mapbox style
     * @constructor
     * @param options General options used to create the instance
     */
    function MapboxRender(options) {
        var _this = this;
        this.style = "";
        this.originShift = 2 * Math.PI * 6378137 / 2.0;
        // protected asyncRender: any;
        this.handleRequest = function (mapSourceRequest, callback) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var resolvedUrl, responseData, mapSourceResponse, err_1, data, mapSourceResponse, err_2, mapSourceResponse;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resolvedUrl = this.resolveUrl(mapSourceRequest.url);
                        this.debug(mapSourceRequest.kind + " " + mapSourceRequest.url + "\n => " + resolvedUrl.type + " " + resolvedUrl.url);
                        if (!(resolvedUrl.url.length === 0)) return [3 /*break*/, 1];
                        this.debug("Unknown URL: " + mapSourceRequest.url);
                        callback(new Error("Unknown UrlType " + mapSourceRequest.url));
                        return [3 /*break*/, 12];
                    case 1:
                        if (!(resolvedUrl.type === UrlType.http)) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        this.debug("READING: " + resolvedUrl.url);
                        return [4 /*yield*/, requestPromise({
                                url: resolvedUrl.url,
                                encoding: null,
                                gzip: true,
                                resolveWithFullResponse: true,
                                timeout: 5000
                            })];
                    case 3:
                        responseData = _a.sent();
                        this.debug("DONE READING: " + resolvedUrl.url);
                        if (responseData.statusCode === 200) {
                            mapSourceResponse = {
                                modified: (responseData.headers.modified) ? new Date(responseData.headers.modified[0]) : undefined,
                                expires: (responseData.headers.expires) ? new Date(responseData.headers.expires) : undefined,
                                etag: (responseData.headers.etag) ? responseData.headers.etag : undefined,
                                data: responseData.body
                            };
                            callback(null, mapSourceResponse);
                        }
                        else {
                            callback(new Error(responseData.statusCode + " - " + responseData.statusMessage + ": " + responseData.request.href));
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        this.debug("ERROR READING: " + resolvedUrl.url);
                        if (err_1.cause) {
                            callback(new Error(err_1.cause.syscall + " - " + err_1.options.url + ": " + err_1.cause.code));
                        }
                        else {
                            callback(new Error(err_1.response.statusCode + " - " + err_1.response.statusMessage + ": " + err_1.response.request.href));
                        }
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 12];
                    case 6:
                        if (!(resolvedUrl.type === UrlType.file)) return [3 /*break*/, 11];
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, asyncReadFile(resolvedUrl.url)];
                    case 8:
                        data = _a.sent();
                        mapSourceResponse = {
                            modified: undefined,
                            expires: undefined,
                            etag: undefined,
                            data: data
                        };
                        callback(null, mapSourceResponse);
                        return [3 /*break*/, 10];
                    case 9:
                        err_2 = _a.sent();
                        mapSourceResponse = {
                            modified: undefined,
                            expires: undefined,
                            etag: undefined,
                            data: new Buffer("")
                        };
                        callback(null, mapSourceResponse);
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        callback(new Error("Unknown type: " + resolvedUrl.type));
                        _a.label = 12;
                    case 12: return [2 /*return*/];
                }
            });
        }); };
        this.mapOptions = {
            request: this.handleRequest,
            ratio: 1.0
        };
        this.options = options;
        this.mapOptions = tslib_1.__assign({}, this.mapOptions, { ratio: this.options.ratio || 1.0 });
        this.map = new mbgl.Map(this.mapOptions);
        // this.asyncRender = util.promisify(this.map.render);
    }
    /**
    * Print a debug message to console if this.options.debug=true
    * @param message Message to print
    */
    MapboxRender.prototype.debug = function (message) {
        if (this.options.debug) {
            console.log(message);
        }
    };
    /**
    * Panic mode
    * @param error Error that caused the panic
    */
    MapboxRender.prototype.error = function (error) {
        throw error;
    };
    /** Evaluate type of given url
     * @param url URL to evaluate
     * @return Protocol that is defined by the URL
    */
    MapboxRender.prototype.getUrlType = function (url) {
        // FIXME: Use a map with regex or something
        if (url.startsWith("mapbox://tiles")) {
            return UrlType.mapboxTile;
        }
        else if (url.startsWith("mapbox://fonts")) {
            return UrlType.mapboxFont;
        }
        else if (url.startsWith("mapbox://")) {
            return UrlType.mapbox;
        }
        else if (url.startsWith('http://')) {
            return UrlType.http;
        }
        else if (url.startsWith('https://')) {
            return UrlType.http;
        }
        else if (url.startsWith('file://')) {
            return UrlType.file;
        }
        return UrlType.unknown;
    };
    /**
    * URLs used in style-files (e.g. `mapbox://mapbox.terrain-rgb`) must be resolved to an actual URL (like `mapbox://mapbox.terrain-rgb`) before we can request the data.
    * Also, an API-Key (`access_token`) will be added to allow downloading mapbox ressources.
    * If you get 404-errors you need to start looking here...
    * @param url The URL that needs resolving
    * @return ResolvedUrl-Object that can be used in `request`.
    */
    MapboxRender.prototype.resolveUrl = function (url) {
        // adapt/modify url if needed
        var resolvedUrl = { type: this.getUrlType(url), url: url };
        switch (resolvedUrl.type) {
            case UrlType.mapbox:
            case UrlType.mapboxTile:
            case UrlType.mapboxFont:
                var urlObject = new URL(url, true);
                // this.debug(urlObject);
                if (resolvedUrl.type === UrlType.mapboxTile) {
                    // combine given query string with access_token and secury-property. Given properties are preserved
                    urlObject.set("query", tslib_1.__assign({ access_token: this.options.accessToken }, urlObject.query));
                    urlObject.set("pathname", "/v4" + urlObject.pathname);
                }
                else if (resolvedUrl.type === UrlType.mapboxFont) {
                    urlObject.set("query", tslib_1.__assign({ access_token: this.options.accessToken }, urlObject.query));
                    urlObject.set("pathname", "/fonts/v1" + urlObject.pathname);
                }
                else {
                    // combine given query string with access_token and secury-property. Given properties are preserved
                    urlObject.set("query", tslib_1.__assign({ secure: true, access_token: this.options.accessToken }, urlObject.query));
                    urlObject.set("pathname", "/v4/" + urlObject.origin.split('mapbox://')[1] + ".json");
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
            default:
                break;
        }
        return resolvedUrl;
    };
    /** Converts XY point from Pseudo-Mercator (https://epsg.io/3857) to WGS84 (https://epsg.io/4326) */
    MapboxRender.prototype.getWGS84FromMercator = function (pos) {
        var lon = (pos.x / this.originShift) * 180.0;
        var lat = (pos.y / this.originShift) * 180.0;
        lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2.0);
        return { lng: lon, lat: lat };
    };
    /** Converts pixel coordinates (Origin is top-left) in given zoom level of pyramid to EPSG:900913 */
    MapboxRender.prototype.getMercatorFromPixels = function (pos, zoom, tileSize) {
        if (tileSize === void 0) { tileSize = 256; }
        // zoom = Math.max(0, zoom + 1 - tileSize / 256)
        var res = 2 * Math.PI * 6378137 / tileSize / Math.pow(2, zoom);
        return { x: pos.x * res - this.originShift, y: this.originShift - pos.y * res };
    };
    /** Returns bounds of the given tile in Pseudo-Mercator (https://epsg.io/3857) coordinates */
    MapboxRender.prototype.getMercatorTileBounds = function (tile, zoom, tileSize) {
        if (tileSize === void 0) { tileSize = 256; }
        var leftbottom = this.getMercatorFromPixels({ x: tile.x * tileSize, y: (tile.y + 1) * tileSize }, zoom, tileSize);
        var righttop = this.getMercatorFromPixels({ x: (tile.x + 1) * tileSize, y: tile.y * tileSize }, zoom, tileSize);
        return ({ leftbottom: leftbottom, righttop: righttop });
    };
    /** Returns bounds of the given tile in WGS84 (https://epsg.io/4326) coordinates */
    MapboxRender.prototype.getWGS84TileBounds = function (tile, zoom, tileSize) {
        if (tileSize === void 0) { tileSize = 256; }
        var bounds = this.getMercatorTileBounds(tile, zoom, tileSize);
        return {
            leftbottom: this.getWGS84FromMercator(bounds.leftbottom),
            righttop: this.getWGS84FromMercator(bounds.righttop)
        };
    };
    /** Returns center of the given tile in WGS84 (https://epsg.io/4326) coordinates */
    MapboxRender.prototype.getWGS84TileCenter = function (tile, zoom, tileSize) {
        if (tileSize === void 0) { tileSize = 256; }
        var bounds = this.getWGS84TileBounds(tile, zoom, tileSize);
        return {
            lng: (bounds.righttop.lng + bounds.leftbottom.lng) / 2,
            lat: (bounds.righttop.lat + bounds.leftbottom.lat) / 2
        };
    };
    /** Set up mapbox-library with a mapbox-style
     * @param styleUrl
     */
    MapboxRender.prototype.loadStyle = function (styleUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.options.styleUrl = styleUrl ? styleUrl : this.options.styleUrl;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, asyncReadFile(this.options.styleUrl, { encoding: "utf-8" })];
                    case 2:
                        _a.style = _b.sent();
                        this.map.load(this.style);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        this.error(error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MapboxRender.prototype.render = function (param, outputFile) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
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
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.map.render(param, function (err, buffer) {
                            if (err) {
                                reject(err);
                            }
                            _this.map.release();
                            var image = sharp(buffer, {
                                raw: {
                                    width: param.width,
                                    height: param.height,
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
                    })];
            });
        });
    };
    return MapboxRender;
}());
exports.MapboxRender = MapboxRender;
//# sourceMappingURL=render.js.map