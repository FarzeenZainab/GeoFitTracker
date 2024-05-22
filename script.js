'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
const containerWorkouts = document.querySelector('.workouts');

let map, coords;

let counter = parseInt(localStorage.getItem('counter')) || 1;

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

// render workouts
const renderWorkout = (containerEle, workout) => {
  const isRunningWorkout = workout.type === 'running';

  let html = `
      <li class="workout ${
        isRunningWorkout ? 'workout--running' : 'workout--cycling'
      }" data-id="${workout.id}">
          <h2 class="workout__title">${
            isRunningWorkout ? 'Running' : 'Cycling'
          } on April 14</h2>
          <div class="workout__details">
            <span class="workout__icon">${isRunningWorkout ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;

  if (isRunningWorkout) {
    html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${
          workout.duration / workout.distance
        }</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>
  `;
  }

  if (!isRunningWorkout) {
    html += `
      <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${(
            workout.distance /
            (workout.duration / 60)
          ).toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevation}</span>
          <span class="workout__unit">m</span>
        </div>
    </li>
  `;
  }

  return containerEle.insertAdjacentHTML('beforeend', html);
};

// show location pin on the map
const showLocationPin = ({ latitude, longitude, type, date }) => {
  L.marker([latitude, longitude])
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
      `<span style="text-transform: capitalize;">${type}</span> on ${date}`
    )
    .openPopup();
};

// render saved workouts on page load
window.addEventListener('load', () => {
  const savedWorkout = JSON.parse(localStorage.getItem('workouts')) || [];

  savedWorkout.forEach(workout => {
    // render list of saved workouts
    renderWorkout(containerWorkouts, workout);

    // render location pin on map
    showLocationPin(workout);
  });
});

// on type change
inputType.addEventListener('change', e => {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
});

// update counter which is used to generate workout id
const updateCounter = () => {
  counter++;
  localStorage.setItem('counter', counter);
};

// add new workout in the array and in the local storage
const addWorkout = workout => {
  workouts.push(workout);
  localStorage.setItem('workouts', JSON.stringify(workouts));
};

// on form submit
form.addEventListener('submit', e => {
  e.preventDefault();

  // today's date
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  // get all form values
  const formData = new FormData(form);
  const workoutData = {
    id: counter,
    type: formData.get('type'),
    distance: formData.get('distance'),
    duration: formData.get('duration'),
    latitude: coords.lat,
    longitude: coords.lng,
    date: today,
  };

  if (workoutData.type === 'running') {
    workoutData.cadence = formData.get('cadence');
  }

  if (workoutData.type === 'cycling') {
    workoutData.elevation = formData.get('elevation');
  }

  updateCounter();
  addWorkout(workoutData);
  renderWorkout(containerWorkouts, workoutData);
  showLocationPin(workoutData);

  inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputElevation.value =
      '';

  form.classList.add('hidden');
});

// pan to marker when clicked on a workout
containerWorkouts.addEventListener('click', e => {
  const workoutEle = e.target.closest('.workout');

  if (!workoutEle) return;

  const id = workoutEle.dataset.id;
  const selectedWorkout = workouts.find(
    workout => parseInt(workout.id) === parseInt(id)
  );

  map.setView([selectedWorkout.latitude, selectedWorkout.longitude], 17.5);
});
