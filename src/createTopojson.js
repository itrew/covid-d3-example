const fetch = require('isomorphic-fetch');
const mapshaper = require('mapshaper');
const fs = require('fs');

async function createTopojson(config) {
  const res = await fetch(`${
      config.featureService.url
    }/query?outFields=${
      config.featureService.outFields.join(',')
    }&where=${
      config.featureService.where
    }&outSR=${
      config.featureService.outSR
    }&f=geojson`);
  const features = await res.json();
  const inputMap = {};
  inputMap[`input.${config.name}`] = features;
  const commandString = `${config.mapshaperCommand} -proj +init=EPSG:32149 target=* -o target=${config.name} prettify format=topojson width=534 output.topojson`;
  return new Promise((resolve, reject) => {
    mapshaper.applyCommands(
      commandString,
      inputMap,
      (err, output) => {
        if (err) {
          reject(err);
        }
        resolve(output);
      },
    );
  });
}

const serviceConfig = {
  name: 'Counties',
  featureService: {
    url: 'https://services7.arcgis.com/vUVXhXafpruJFs3l/arcgis/rest/services/WA_RecoveryInfo_Public/FeatureServer/0',
    outFields: [
      'OBJECTID',
      'JURISDICT_LABEL_NM',
      'JURISDICT_NM',
      'GlobalID',
    ],
    where: '1=1',
    outSR: 4326,
  },
  mapshaperCommand: '-i input.Counties name=Counties -clean -simplify target=Counties 3%',
};

createTopojson(serviceConfig).then((output) => {
  fs.writeFileSync('src/counties.topojson', output['output.topojson']);
});
