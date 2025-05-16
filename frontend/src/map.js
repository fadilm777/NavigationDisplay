
export const map = new maplibregl.Map({
  container: 'map',
  style: 'mapstyle.json',
  center: [-73.742157, 45.464088], // starting position [lng, lat]
  bearing: 0,
  zoom: 11.5 // starting zoom
});
