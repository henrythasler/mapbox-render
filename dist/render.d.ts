import * as mbgl from "@mapbox/mapbox-gl-native";
import * as sharp from "sharp";
export interface MapboxRenderOptions {
    styleUrl: string;
    accessToken?: string;
    debug?: boolean;
    ratio?: number;
    tilesize?: number;
}
export interface RenderParameters {
    center: number[];
    zoom: number;
    width: number;
    height: number;
    bearing?: number;
    pitch?: number;
}
/** Render mapbox-gl-styles */
export declare class MapboxRender {
    protected options: MapboxRenderOptions;
    protected style: string;
    protected map: mbgl.Map;
    private handleRequest;
    protected mapOptions: mbgl.MapOptions;
    /**
     * Render mapbox style
     * @constructor
     * @param options General options used to create the instance
     */
    constructor(options: MapboxRenderOptions);
    /**
    * Print a debug message to console if this.options.debug=true
    * @param message Message to print
    */
    private debug;
    /**
    * Panic mode
    * @param error Error that caused the panic
    */
    private error;
    /** Evaluate type of given url
     * @param url URL to evaluate
     * @return Protocol that is defined by the URL
    */
    private getUrlType;
    /**
    * mapbox-URLs used in style-files (e.g. `mapbox://mapbox.terrain-rgb`) must be resolved to an actual
    * URL (like `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png`) before we can request the data.
    * Also, an API-Key (`access_token`) will be added to allow downloading mapbox ressources.
    * If you get 404-errors you need to start looking here...
    * @param url The URL that needs resolving
    * @return ResolvedUrl-Object that can be used in `request`.
    */
    private resolveUrl;
    /** Set up mapbox-library with a mapbox-style
     * @param styleUrl
     */
    loadStyle(styleUrl?: string): Promise<void>;
    renderToFile(param: RenderParameters, outputFile: string): Promise<boolean | Error>;
    renderToImage(param: RenderParameters): Promise<sharp.Sharp | Error>;
}
