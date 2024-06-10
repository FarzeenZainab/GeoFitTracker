# GeoFitTracker [![Netlify Status](https://api.netlify.com/api/v1/badges/c32e9614-9521-4510-bdef-5b2365468e70/deploy-status)](https://app.netlify.com/sites/geo-fit-tracker/deploys)

A simple web application to track your workouts using Leaflet.js for map integration. This application allows users to log running and cycling workouts by placing markers on a map and storing the workout data in local storage.

([geo-fit-tracker.netlify.app/](https://geo-fit-tracker.netlify.app/))

## Features

- Geolocation to detect the user's current position.
- Ability to add running and cycling workouts.
- Display workout details including distance, duration, cadence (for running), and elevation gain (for cycling).
- Store and retrieve workout data from local storage.
- Interactively display and remove workout markers on the map.

## Installation

1. Clone the repository:
   
   ```
   
   git clone https://github.com/yourusername/workout-tracker.git
   
   ```
2. Navigate to the project directory:
   
   ```

   cd GeoFitTracker

   ```
3. Open the **index.html** file in your browser to run the application.

## Usage
- Allow the application to access your location when prompted.
- Click on the map to open the workout form.
- Select the workout type (Running or Cycling).
- Fill in the workout details.
- Submit the form to add the workout.
- Click on a workout in the list to pan to its marker on the map.
- Click on the "Remove" button to delete a workout and its marker.
