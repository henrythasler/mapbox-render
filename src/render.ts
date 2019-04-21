import * as mbgl from "@mapbox/mapbox-gl-native";
import * as sharp from "sharp";
// import * as fs from "fs";
// import * as path from "path";
import * as request from "request";

let options:mbgl.MapOptions = {
  request: function (mapSourceRequest, callback) {
    request({
      url: mapSourceRequest.url,
      encoding: null,
      gzip: true
    }, function (err, res, body) {
      if (err) {
        callback(err);
      } else if (res.statusCode == 200) {
        let response:mbgl.MapSourceResponse = {
          modified: (res.headers.modified)?new Date(res.headers.modified[0]):undefined, 
          expires: (res.headers.expires)?new Date(res.headers.expires):undefined, 
          etag: (res.headers.etag)?res.headers.etag:undefined, 
          data: body
        }

        callback(null, response);
      } else {
        callback(new Error(JSON.parse(body).message));
      }
    });
  },
  ratio: 1.0
};

var map = new mbgl.Map(options);

import * as style from './cyclemap.json';
map.load(<any>style);

map.render({ zoom: 11, width: 512, height: 512, center: [10.5, 47.7] }, function (err, buffer) {
  if (err) throw err;

  map.release();

  var image = sharp(buffer, {
    raw: {
      width: 512,
      height: 512,
      channels: 4
    }
  });

  // Convert raw image buffer to PNG
  image.toFile('image.png', function (err) {
      if (err) throw err;
    });
});