console.log('hello from the client side');

const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoidG9tYXpvdnNlbmphayIsImEiOiJja2lxYTRhd28wZGoxMnhwamF3MTI1YjA5In0.cCRWR0uclCv1ecYzmJ0Y_w';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
});
