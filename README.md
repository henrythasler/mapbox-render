# Mapbox-Render

This is a Typescript implementation based on mapbox-gl-native to create raster images from any mapbox-gl-style. 
The main purpose is to render raster tiles for offline/mobile use from my Mapbox-based vectortiles-stack. The secondary purpose is to learn Typescript ;-)

## Prerequisites

- Install node, npm: https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/
- Install typescript: `sudo npm install -g typescript`

## Typescript interface for mapbox-gl-native

There is none... So I created one on my own, based on the information available via Mapbox's github repo.

## Build & Run application

Enable autobuild:
`tsc -p . --watch`

Run application:
`nodejs build/render.js`

## Type generation

`nodejs node_modules/dts-gen/bin/lib/run.js`

## Mapbox References

- https://github.com/mapbox/mapbox-gl-native/tree/master/platform/node
- https://github.com/consbio/mbgl-renderer
- https://github.com/klokantech/tileserver-gl
- https://github.com/mapbox/tilebelt

## NodeJs/JavaScript References

- https://github.com/airbnb/javascript
- https://www.stevefenton.co.uk/2015/04/TypeScript-Scope-Responsibility/
- http://usejsdoc.org/index.html
- https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
- https://stackify.com/node-js-error-handling/

## Typescript References

- https://github.com/Microsoft/TypeScript-Node-Starter
- https://www.tutorialsteacher.com/typescript
- https://blog.bitsrc.io/keep-your-promises-in-typescript-using-async-await-7bdc57041308
- https://tutorialedge.net/typescript/async-await-in-typescript-tutorial/
- https://code.visualstudio.com/docs/typescript/typescript-debugging

## Testing References

- https://journal.artfuldev.com/unit-testing-node-applications-with-typescript-using-mocha-and-chai-384ef05f32b2
- https://mochajs.org/#getting-started

## Geospatial References

- https://github.com/sacridini/Awesome-Geospatial
- https://www.maptiler.com/google-maps-coordinates-tile-bounds-projection/
