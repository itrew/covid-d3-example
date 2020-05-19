# How-to
1. After cloning the repo, run `npm install` to install the dependencies.
1. Run `npm run createTopojson` to download the data from the endpoint (boundaries), simplify them, and create a smaller topojson file.
1. Run `npm run serve` to view a live demo.

`src/createTopojson` is just the scriopt that pulls the data down from the endpoint as a geojson and uses mapshaper to process it. It spits out a simplified topojson file.

`index.html` is just the page that loads for demo. It needs `d3-select`, `d3-geo`, and `topojson-client`.

`preprojected.js` is the logic to make the map.
