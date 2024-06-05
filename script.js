'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
let markers = {}; // Store markers in an object with workout IDs as keys
const containerWorkouts = document.querySelector('.workouts');

let map, coords;

let counter = parseInt(localStorage.getItem('counter')) || 1;

// Get current position
navigator?.geolocation?.getCurrentPosition(
  position => {
    const { latitude, longitude } = position.coords;
    const currentLocation = [latitude, longitude];

    const key = 'FakHOIPI0AUyYkhvQldq';
    map = L.map('map').setView(currentLocation, 16);

    L.maptilerLayer({
      apiKey: key,
    }).addTo(map);

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

/**
 * =============
 *  FUNCTIONS
 * =============
 */

// Show toast on error, success and warning
const showToast = (status, message) => {
  const getVariant = () => {
    const variant = {
      success: '#00c46a',
      error: '#ffb545',
      warning: '#aaaaaa',
    };
    return variant[status];
  };
  Toastify({
    text: message,
    offset: {
      x: 50,
      y: 10,
    },
    style: {
      background: getVariant(status),
      fontSize: '14px',
    },
    stopOnFocus: true,
  }).showToast();
};

// Render workouts
const renderWorkout = (containerEle, workout) => {
  const isRunningWorkout = workout.type === 'running';

  let html = `
      <li class="workout ${
        isRunningWorkout ? 'workout--running' : 'workout--cycling'
      }" data-id="${workout?.id}">
        
        <div class="title-container">
          <h2 class="workout__title">${
            isRunningWorkout ? 'Running' : 'Cycling'
          } on ${workout?.date}</h2>

          <div class="remove--workout" data-id="${workout?.id}">Remove</div>
        </div>

          <div class="workout__details">
            <span class="workout__icon">${isRunningWorkout ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout?.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout?.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;

  if (isRunningWorkout) {
    html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${(
          workout.duration / workout.distance
        ).toFixed(1)}</span>
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

// Show location pin on the map
const showLocationPin = ({ latitude, longitude, type, date }) => {
  const marker = L.marker([latitude, longitude])
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

  return marker;
};

// Update counter which is used to generate workout ID
const updateCounter = () => {
  counter++;
  localStorage.setItem('counter', counter);
};

// Add new workout in the array and in the local storage
const addWorkout = workout => {
  workouts.push(workout);
  localStorage.setItem('workouts', JSON.stringify(workouts));
};

// Validate fields
const fieldsAreValid = workoutData => {
  if (
    !workoutData.distance ||
    !workoutData.duration ||
    (workoutData.type === 'running' && !workoutData.cadence) ||
    (workoutData.type === 'cycling' && !workoutData.elevation)
  ) {
    showToast('error', 'Please provide values in all fields');
    return false;
  }

  return true;
};

// Delete workouts
const deleteWorkout = workoutData => {
  // Update the data in local storage
  const newWorkouts = workouts.filter(
    workout => workout?.id !== workoutData?.id
  );
  workouts = newWorkouts;
  localStorage.setItem('workouts', JSON.stringify(workouts));

  // Remove the workout element from the DOM
  const workoutEle = containerWorkouts.querySelector(
    `[data-id="${workoutData.id}"]`
  );
  if (workoutEle) workoutEle.remove();

  // Remove the marker from the map
  if (markers[workoutData.id]) {
    map.removeLayer(markers[workoutData.id]);
    delete markers[workoutData.id];
  }
};

/**
 * ===========
 *    EVENTS
 * ===========
 */

// Add new workout
form.addEventListener('submit', e => {
  e.preventDefault();

  // Today's date
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  // Get all form values
  const formData = new FormData(form);
  const workoutData = {
    id: counter,
    type: formData.get('type').trim(),
    distance: formData.get('distance').trim(),
    duration: formData.get('duration').trim(),
    latitude: coords.lat,
    longitude: coords.lng,
    date: today,
  };

  if (workoutData.type === 'running') {
    workoutData.cadence = formData.get('cadence').trim();
  }

  if (workoutData.type === 'cycling') {
    workoutData.elevation = formData.get('elevation').trim();
  }

  if (fieldsAreValid(workoutData)) {
    updateCounter();
    const marker = showLocationPin(workoutData);
    markers[workoutData.id] = marker;
    addWorkout(workoutData);
    renderWorkout(containerWorkouts, workoutData);

    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.classList.add('hidden');
    showToast('success', 'New workout has been added successfully');
  }
});

// Render saved workouts on page load
window.addEventListener('load', () => {
  const savedWorkouts = JSON.parse(localStorage.getItem('workouts')) || [];

  savedWorkouts.forEach(workout => {
    renderWorkout(containerWorkouts, workout);
    const marker = showLocationPin(workout);
    markers[workout.id] = marker;
  });
});

// Toggle elevation and cadence field on workout type change
inputType.addEventListener('change', e => {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
});

// Pan to marker when clicked on a workout
containerWorkouts.addEventListener('click', e => {
  const workoutEle = e.target.closest('.workout');

  if (!workoutEle) return;

  const id = workoutEle.dataset.id;
  const selectedWorkout = workouts.find(
    workout => parseInt(workout.id) === parseInt(id)
  );

  if (selectedWorkout) {
    map.setView([selectedWorkout.latitude, selectedWorkout.longitude], 17.5);
  }
});

// Delete workout
containerWorkouts.addEventListener('click', e => {
  if (e.target.classList.contains('remove--workout')) {
    const workoutEle = e.target.closest('.workout');

    if (!workoutEle) return;

    const id = workoutEle.dataset.id;
    const selectedWorkout = workouts.find(
      workout => parseInt(workout.id) === parseInt(id)
    );

    if (selectedWorkout) {
      deleteWorkout(selectedWorkout);
      showToast('success', 'Workout has been removed successfully');
    }
  }
});
