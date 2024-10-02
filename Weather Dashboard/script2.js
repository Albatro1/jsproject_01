const apiKey = 'f482a0e92bd574b4c52593a77e4687e4'; // Your API key

// DOM Elements
const weatherForm = document.getElementById('weatherForm');
const getLocationWeather = document.getElementById('getLocationWeather');
const weatherResult = document.getElementById('weatherResult');

// Function to fetch current weather data based on city name
function getWeather(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      displayWeather(data);
      getWeatherForecast(city); // Fetch 5-day forecast after getting current weather
    })
    .catch(error => {
      weatherResult.innerHTML = `<p>Could not fetch weather data. Please try again.</p>`;
      console.error('Error:', error);
    });
}

// Function to display current weather data
function displayWeather(data) {
  if (data.cod === '404') {
    weatherResult.innerHTML = `<p>City not found. Please try again.</p>`;
    return;
  }

  // Get the weather icon code
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const weatherInfo = `
    <div class="weather-info">
      <h2>${data.name}, ${data.sys.country}</h2>
      <img src="${iconUrl}" alt="Weather icon">
      <p>Temperature: ${data.main.temp} °C</p>
      <p>Humidity: ${data.main.humidity}%</p>
      <p>Weather: ${data.weather[0].description}</p>
    </div>
  `;

  weatherResult.innerHTML = weatherInfo;
}

// Function to fetch 5-day weather forecast based on city name
function getWeatherForecast(city) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  fetch(forecastUrl)
    .then(response => response.json())
    .then(data => displayWeatherForecast(data))
    .catch(error => {
      weatherResult.innerHTML += `<p>Could not fetch forecast data. Please try again.</p>`;
      console.error('Error:', error);
    });
}

// Function to display the 5-day forecast
function displayWeatherForecast(data) {
  let forecastHTML = `<div class="forecast-container">`;
  
  // Filter the forecast to show only 12:00 PM weather for each day
  const filteredData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
  
  filteredData.forEach(forecast => {
    const date = new Date(forecast.dt_txt).toLocaleDateString();
    const temp = forecast.main.temp;
    const description = forecast.weather[0].description;
    const iconCode = forecast.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    forecastHTML += `
      <div class="forecast-day">
        <p>${date}</p>
        <img src="${iconUrl}" alt="Weather icon">
        <p>${temp} °C</p>
        <p>${description}</p>
      </div>
    `;
  });

  forecastHTML += `</div>`;
  weatherResult.innerHTML += forecastHTML;
}

// Event listener for city-based weather search
weatherForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = document.getElementById('city').value;
  getWeather(city);
});

// Function to fetch weather based on user's geolocation
function getWeatherByCoords(position) {
  const { latitude, longitude } = position.coords;
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      displayWeather(data);
      getWeatherForecast(`${data.name}`); // Fetch 5-day forecast after geolocation weather
    })
    .catch(error => {
      weatherResult.innerHTML = `<p>Could not fetch weather data. Please try again.</p>`;
      console.error('Error:', error);
    });
}

// Handle geolocation errors
function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      weatherResult.innerHTML = `<p>User denied the request for Geolocation.</p>`;
      break;
    case error.POSITION_UNAVAILABLE:
      weatherResult.innerHTML = `<p>Location information is unavailable.</p>`;
      break;
    case error.TIMEOUT:
      weatherResult.innerHTML = `<p>The request to get user location timed out.</p>`;
      break;
    case error.UNKNOWN_ERROR:
      weatherResult.innerHTML = `<p>An unknown error occurred.</p>`;
      break;
  }
}

// Event listener for getting current location's weather
getLocationWeather.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getWeatherByCoords, showError);
  } else {
    weatherResult.innerHTML = `<p>Geolocation is not supported by this browser.</p>`;
  }
});
