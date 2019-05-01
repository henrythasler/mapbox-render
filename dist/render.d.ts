import * as mbgl from "@mapbox/mapbox-gl-native";
export interface MapboxRenderOptions {
    styleUrl: string;
    accessToken?: string;
    debug?: boolean;
    ratio?: number;
}
export interface RenderParameters {
    center: number[];
    zoom: number;
    width: number;
    height: number;
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
    /**
    * URLs used in style-files (e.g. `mapbox://mapbox.terrain-rgb`) must be resolved to an actual URL (like `mapbox://mapbox.terrain-rgb`) before we can request the data.
    * Also, an API-Key (`access_token`) will be added to allow downloading mapbox ressources.
    * If you get 404-errors you need to start looking here...
    * @param url The URL that needs resolving
    * @return Resolved URL that can be fed to `request`.
    */
    private resolveUrl;
    private getUrlType;
    private wait;
    private asyncWait;
    loadStyle(styleUrl?: string): Promise<void>;
    render(param: RenderParameters, outputFile: string): Promise<boolean | Error>;
}
