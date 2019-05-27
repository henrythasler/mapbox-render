# Mapbox-Render

This is a Typescript implementation based on mapbox-gl-native to create raster images from any mapbox-gl-style. 
The main purpose is to render raster tiles for offline/mobile use from my Mapbox-based vectortiles-stack. The secondary purpose is to learn Typescript ;-)

## Prerequisites

- Install node, npm: https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/
- Install typescript: `sudo npm install -g typescript`

## Typescript interface for mapbox-gl-native

There is none... So I created my own, based on the information available via Mapbox's github repo. It's far from complete and doesn't expose the EventEmitter interface yet.

## Build & Run application

Enable autobuild:
`tsc -p . --watch`

Run sample application:
`npm start`

## Resolving Map Sources

style-url | mapbox-url | API-Endpoint
---|---|---
`mapbox://mapbox.mapbox-streets-v8` | 
`mapbox://mapbox.mapbox-terrain-v2` | 
`mapbox://mapbox.mapbox-traffic-v1` |
`mapbox://mapbox.enterprise-boundaries-XX-YY` |
`mapbox://mapbox.terrain-rgb` | `mapbox://tiles/mapbox.terrain-rgb/{z}/{x}/{y}@2x.png` |`https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}@2x.png`
`mapbox://mapbox.mapbox-terrain-v2` | `mapbox://tiles/mapbox.mapbox-terrain-v2/{z}/{x}/{y}.vector.pbf` | `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/{z}/{x}/{y}.vector.pbf`
`mapbox://fonts/mapbox/{fontstack}/{range}.pbf` | `mapbox://fonts/mapbox/Open%20Sans%20Regular%2cArial%20Unicode%20MS%20Regular/0-255.pbf` | `https://api.mapbox.com/fonts/v1/mapbox/Open%20Sans%20Regular%2cArial%20Unicode%20MS%20Regular/0-255.pbf`
`mapbox://sprites/mapbox/streets-v8` | `mapbox://sprites/mapbox/bright-v8.png` | ``

## Testing

The tests use remote resources (e.g. from mapbox-api) so you can't run these tests without an active internet connection.

### Jest

`npm install --save-dev jest ts-jest @types/jest`

### Mocha

The tests can also be run with mocha.

`npm install --save-dev mocha ts-node @types/mocha`

## References

The following links have helped a great deal to understand several technical concepts.

## Mapbox References

- https://github.com/mapbox/mapbox-gl-native/tree/master/platform/node
- https://github.com/consbio/mbgl-renderer
- https://github.com/klokantech/tileserver-gl
- https://github.com/mapbox/tilebelt
- https://docs.mapbox.com/vector-tiles/reference/


## NodeJs/JavaScript References

- https://github.com/airbnb/javascript
- https://www.stevefenton.co.uk/2015/04/TypeScript-Scope-Responsibility/
- http://usejsdoc.org/index.html
- https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
- https://stackify.com/node-js-error-handling/

## Typescript References

- https://github.com/Microsoft/TypeScript/wiki
- https://github.com/Microsoft/TypeScript-Node-Starter
- https://www.tutorialsteacher.com/typescript
- https://blog.bitsrc.io/keep-your-promises-in-typescript-using-async-await-7bdc57041308
- https://tutorialedge.net/typescript/async-await-in-typescript-tutorial/
- https://code.visualstudio.com/docs/typescript/typescript-debugging
- https://blog.atomist.com/typescript-imports/

## Testing References

- https://journal.artfuldev.com/unit-testing-node-applications-with-typescript-using-mocha-and-chai-384ef05f32b2
- https://mochajs.org/#getting-started

## Documentation References

- https://typedoc.org/

## Geospatial References

- https://github.com/sacridini/Awesome-Geospatial
- https://www.maptiler.com/google-maps-coordinates-tile-bounds-projection/
