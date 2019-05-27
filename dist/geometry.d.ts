export interface Wgs84 {
    lng: number;
    lat: number;
}
export interface Mercator {
    x: number;
    y: number;
}
export interface Vector {
    x: number;
    y: number;
}
export interface WGS84BoundingBox {
    leftbottom: Wgs84;
    righttop: Wgs84;
}
export interface MercatorBoundingBox {
    leftbottom: Mercator;
    righttop: Mercator;
}
export declare class Geometry {
    protected originShift: number;
    /** Converts XY point from Pseudo-Mercator (https://epsg.io/3857) to WGS84 (https://epsg.io/4326) */
    getWGS84FromMercator(pos: Mercator): Wgs84;
    /** Converts pixel coordinates (Origin is top-left) in given zoom level of pyramid to EPSG:900913 */
    getMercatorFromPixels(pos: Vector, zoom: number, tileSize?: number): Mercator;
    /** Returns bounds of the given tile in Pseudo-Mercator (https://epsg.io/3857) coordinates */
    getMercatorTileBounds(tile: Vector, zoom: number, tileSize?: number): MercatorBoundingBox;
    /** Returns bounds of the given tile in WGS84 (https://epsg.io/4326) coordinates */
    getWGS84TileBounds(tile: Vector, zoom: number, tileSize?: number): WGS84BoundingBox;
    /** Returns center of the given tile in WGS84 (https://epsg.io/4326) coordinates */
    getWGS84TileCenter(tile: Vector, zoom: number, tileSize?: number): Wgs84;
}
