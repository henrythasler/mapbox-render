"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
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
    UrlType[UrlType["mapboxSprite"] = 4] = "mapboxSprite";
    UrlType[UrlType["file"] = 5] = "file";
    UrlType[UrlType["http"] = 6] = "http";
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
        // protected asyncRender: any;
        this.handleRequest = function (mapSourceRequest, callback) { return __awaiter(_this, void 0, void 0, function () {
            var resolvedUrl, responseData, mapSourceResponse, err_1, data, mapSourceResponse, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resolvedUrl = this.resolveUrl(mapSourceRequest.url);
                        this.debug(mapSourceRequest.kind + " " + mapSourceRequest.url + "\n => " + resolvedUrl.type + " " + resolvedUrl.url);
                        if (!(resolvedUrl.url.length === 0)) return [3 /*break*/, 1];
                        callback(new Error("Invalid Url " + mapSourceRequest.url));
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
                        callback(err_2);
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
        this.mapOptions = __assign({}, this.mapOptions, { ratio: this.options.ratio || 1.0 });
        this.map = new mbgl.Map(this.mapOptions);
        // this.asyncRender = util.promisify(this.map.render);
    }
    /**
    * Print a debug message to console if this.options.debug=true
    * @param message Message to print
    */
    MapboxRender.prototype.debug = function (message) {
        /* istanbul ignore next */
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
        var UrlTypes = {
            "mapbox:\/\/mapbox": UrlType.mapbox,
            "mapbox:\/\/tiles": UrlType.mapboxTile,
            "mapbox:\/\/fonts": UrlType.mapboxFont,
            "mapbox:\/\/sprites": UrlType.mapboxSprite,
            "http": UrlType.http,
            "file:\/\/": UrlType.file
        };
        for (var item in UrlTypes) {
            if (url.startsWith(item)) {
                return UrlTypes[item];
            }
        }
        return UrlType.unknown;
    };
    /**
    * mapbox-URLs used in style-files (e.g. `mapbox://mapbox.terrain-rgb`) must be resolved to an actual
    * URL (like `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png`) before we can request the data.
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
            case UrlType.mapboxSprite:
                var urlObject = new URL(url, true);
                // this.debug(urlObject);
                if (resolvedUrl.type === UrlType.mapboxTile) {
                    // combine given query string with access_token and secury-property. Given properties are preserved
                    urlObject.set("query", __assign({ access_token: this.options.accessToken }, urlObject.query));
                    urlObject.set("pathname", "/v4" + urlObject.pathname);
                }
                else if (resolvedUrl.type === UrlType.mapboxFont) {
                    urlObject.set("query", __assign({ access_token: this.options.accessToken }, urlObject.query));
                    urlObject.set("pathname", "/fonts/v1" + urlObject.pathname);
                }
                else if (resolvedUrl.type === UrlType.mapboxSprite) {
                    // console.log(urlObject);
                    urlObject.set("query", __assign({ access_token: this.options.accessToken }, urlObject.query));
                    var style = urlObject.pathname.split(".")[0];
                    var ext = urlObject.pathname.split(".")[1];
                    var ratio = "";
                    if (style.indexOf("@") > 0) {
                        // console.log(style);
                        ratio = "@" + style.split("@")[1];
                        style = style.split("@")[0];
                    }
                    urlObject.set("pathname", "/styles/v1" + style + "/sprite" + ratio + "." + ext);
                }
                else {
                    // combine given query string with access_token and secury-property. Given properties are preserved
                    urlObject.set("query", __assign({ secure: true, access_token: this.options.accessToken }, urlObject.query));
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
            /* istanbul ignore next */
            default:
                break;
        }
        return resolvedUrl;
    };
    /** Set up mapbox-library with a mapbox-style
     * @param styleUrl
     */
    MapboxRender.prototype.loadStyle = function (styleUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
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
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
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
                                    width: param.width * _this.mapOptions.ratio,
                                    height: param.height * _this.mapOptions.ratio,
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