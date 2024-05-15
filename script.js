'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//  get current position takes in two callbacks, one is called when the location
// is successfully retrieved and the second one when there is an error or the user denies to
// provide the location
navigator?.geolocation?.getCurrentPosition(
  position => {
    // get user's position
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    // create map
    const key = 'FakHOIPI0AUyYkhvQldq';
    const map = L.map('map').setView(coords, 16);

    L.maptilerLayer({
      apiKey: key,
      style: 'dataviz', //optional
    }).addTo(map);

    // drop a new pin on click
    map.addEventListener('click', e => {
      if (e.type === 'click') {
        const { lat, lng } = e.latlng;
        const coordinates = [lat, lng];

        L.marker(coordinates)
          .addTo(map)
          .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: 'running-popup',
            })
          )
          .setPopupContent('workout')
          .openPopup();
      }
    });
  },
  () => {
    alert('Could not get your location');
  }
);
