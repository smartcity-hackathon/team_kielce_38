function geolocation() {
if(localStorage['lat']) {
  pos = {
    lat: parseFloat(localStorage['lat']),
    lng: parseFloat(localStorage['lng'])
  };
}
// Try HTML5 geolocation.
else if (!(localStorage['lat']) && navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    localStorage['lat'] = pos.lat;
    localStorage['lng'] = pos.lng;

  }, function() {
    handleLocationError();
  });
} else {
  // Browser doesn't support Geolocation
  handleLocationError();
  }
const socket = io.connect();
socket.emit('send:coords', pos);
console.log(pos)
}
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  console.log('lol');
}
geolocation();
