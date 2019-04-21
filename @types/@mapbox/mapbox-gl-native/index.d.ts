declare module '@mapbox/mapbox-gl-native' {

    enum MapSourceRequestKind {
        Unknown = 0,
        Style,
        Source,
        Tile,
        Glyphs,
        SpriteImage,
        SpriteJSON
    }

    export interface MapSourceRequest {
        url: string,
        kind: MapSourceRequestKind
    }

    export interface MapSourceResponse {
        modified: Date | undefined,
        expires: Date | undefined,
        etag: string | string[] | undefined,
        data: Buffer,
    }

    export interface MapOptions {
        request: (request: MapSourceRequest, callback: (error: Error | null, sourceResponse?:MapSourceResponse) => void) => void,
        ratio?: number,
    }

    export interface RenderOptions {
        zoom?: number, // number, defaults to 0
        width?: number, // number (px), defaults to 512
        height?: number, // number (px), defaults to 512
        center?: number[], // array of numbers (coordinates), defaults to [0,0]
        bearing?: number, // number (in degrees, counter-clockwise from north), defaults to 0
        pitch?: number, // number (in degrees, arcing towards the horizon), defaults to 0
        classes?: string[] // array of strings
    }

    export class Map {
        constructor(options: MapOptions);
        load(style: string): void;
        render(options: RenderOptions, callback: (error: Error, buffer: Buffer) => void): void;
        release(): void;
    }
}
