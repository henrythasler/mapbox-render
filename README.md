# Mapbox-Render

This is a Typescript implementation based on mapbox-gl-native to create raster images from any mapbox-gl-style. 
The main purpose is to render raster tiles for offline/mobile use from my Mapbox-based vectortiles-stack. The secondary purpose is to learn Typescript ;-)

## Prerequisites

- Install node, npm: https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/
- Install typescript: `sudo npm install -g typescript`

## Typescript interface for mapbox-gl-native

There is none... So I created one on my own based on the information available via Mapbox's github repo.

## Build & Run application

Enable autobuild:
`tsc -p . --watch`

Run application:
`nodejs build/render.js`

## References

- https://github.com/mapbox/mapbox-gl-native/tree/master/platform/node
- https://github.com/consbio/mbgl-renderer
- https://github.com/klokantech/tileserver-gl

## Typescript References

- https://www.tutorialsteacher.com/typescript
