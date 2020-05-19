const select = d3.select;
const geoPath = d3.geoPath;
const COUNTY_FILL_CLASS = 'county-fill';
const COUNTY_PATH_CLASS = 'county-outline';

const path = geoPath().projection(null);

async function main(selector) {
  // Fetch the toplogy.
  const countyTopology = await fetch('/counties.topojson').then(d => d.json());

  // Fetch the current status.
  const statusData = await fetch('https://services7.arcgis.com/vUVXhXafpruJFs3l/arcgis/rest/services/WA_RecoveryInfo_Public/FeatureServer/0/query?outFields=GlobalID,Phase,PhaseApp&where=1=1&returnGeometry=false&f=json').then(d => d.json())

  // Wait for both requests to finish.
  await Promise.all([countyTopology, statusData]);

  // Parse the topology.
  const counties = topojson.feature(countyTopology, 'Counties');
  const mesh = topojson.mesh(countyTopology, countyTopology.objects.Counties, (a, b) => a !== b);

  // Parse the status data.
  const statuses = statusData.features.map(f => ({
    guid: f.attributes.GlobalID,
    phase: (f.attributes.Phase || '').replace(/ /g, '-').toLowerCase(),
    phaseApp: (f.attributes.PhaseApp || '').replace(/ /g, '-').toLowerCase(),
  }));

  // Create SVG
  const parentElementSelection = select(selector)
  const svgSelection = parentElementSelection.append('svg');
  svgSelection
    .attr('width', '600px')
    .attr('height', '550px');

  // Create group for county polygons
  const countyGroup = svgSelection
    .append('g');

  // Create each county polygon
  countyGroup
    .selectAll('path')
    .data(counties.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', (d) => `${COUNTY_FILL_CLASS} phase-${
      statuses.find(s => d.properties.GlobalID === s.guid).phase
    } phase-app-${
      statuses.find(s => d.properties.GlobalID === s.guid).phaseApp
    }`);


  // Create a mesh for the county boundaries
  svgSelection
    .datum(mesh)
    .append('path')
    .attr('d', path)
    .attr('class', COUNTY_PATH_CLASS)
}
