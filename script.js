'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

const workouts = [];
const containerWorkouts = document.querySelector('.workouts');

let map, coords;

//  get current position takes in two callbacks, one is called when the location
// is successfully retrieved and the second one when there is an error or the user denies to
// provide the location
navigator?.geolocation?.getCurrentPosition(
  position => {
    // get user's position
    const { latitude, longitude } = position.coords;
    const currentLocation = [latitude, longitude];

    // create map
    const key = 'FakHOIPI0AUyYkhvQldq';
    map = L.map('map').setView(currentLocation, 16);

    L.maptilerLayer({
      apiKey: key,
      // style: 'dataviz', //optional
    }).addTo(map);

    // handling click on map
    map.addEventListener('click', mapEvent => {
      form.classList.remove('hidden');
      inputDistance.focus();

      coords = mapEvent.latlng;
    });
  },
  () => {
    alert('Could not get your location');
  }
);

form.addEventListener('submit', e => {
  e.preventDefault();

  // today's date
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  // get all form values
  const formData = new FormData(form);
  const formValues = {
    type: formData.get('type'),
    distance: formData.get('distance'),
    duration: formData.get('duration'),
  };

  if (formValues.type === 'running') {
    formValues.cadence = formData.get('cadence');

    containerWorkouts.insertAdjacentHTML(
      'beforeend',
      `  <li class="workout workout--running"">
          <h2 class="workout__title">Running on April 14</h2>
          <div class="workout__details">
            <span class="workout__icon">🏃‍♂️</span>
            <span class="workout__value">${formValues.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${formValues.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${Math.ceil(
              formValues.cadence / formValues.duration
            )}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${formValues.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
`
    );
  }

  if (formValues.type === 'cycling') {
    formValues.elevation = formData.get('elevation');
  }

  workouts.push({
    formValues,
  });

  // display the marker
  const coordinates = [coords.lat, coords.lng];
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
    .setPopupContent(
      `<span style="text-transform: capitalize;">${formValues.type}</span> on ${today}`
    )
    .openPopup();

  // clear the input values
  inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputElevation.value =
      '';

  // hide form
  form.classList.add('hidden');
});

// on type change
inputType.addEventListener('change', e => {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
});
