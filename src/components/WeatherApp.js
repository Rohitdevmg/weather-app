import React, { useState } from "react";
import axios from "axios";
import './WeatherApp.css';

const WeatherApp = () => {
    const [city, setCity] = useState("");
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null); // New state for forecast data
    const [error, setError] = useState(null);
    const [units, setUnits] = useState('metric');
    const [loading, setLoading] = useState(false);
    
    const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

    const fetchWeather = async (location) => {
        setLoading(true);
        try {
            const response = await axios.get('https://api.weatherapi.com/v1/forecast.json', {
                params: {
                    key: API_KEY,
                    q: location,
                    days: 5, // Fetch 5-day forecast
                    aqi: 'no'
                },
            });
            console.log(response.data); // Log the response data
            setWeatherData(response.data); // Store the entire response
            setForecastData(response.data.forecast.forecastday); // Set forecast data
            setError(null);
        } catch (err) {
            console.error(err); // Log the error
            setError('Error getting weather data');
            setWeatherData(null);
            setForecastData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (city.trim() !== '') {
            fetchWeather(city);
        }
    };

    const handleLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeather(`${latitude},${longitude}`);
            },
            () => setError("Location access denied")
        );
    };

    const toggleUnits = () => {
        setUnits((prevUnits) => (prevUnits === 'metric' ? 'imperial' : 'metric'));
    };

    return (
        <div className="weather-app">
            <h1>Weather App</h1>
            <div className="controls">
                <input
                    type='text'
                    placeholder="Enter City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>Search</button>
                <button onClick={handleLocation}>Use my Location</button>
                <button onClick={toggleUnits}>
                    {units === 'metric' ? 'Switch to Fahrenheit' : 'Switch to Celsius'}
                </button>
            </div>

            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}
            
            {weatherData && (
                <div className="weather-info">
                    <h2>{weatherData.location?.name ? `${weatherData.location.name}, ${weatherData.location.country}` : ''}</h2>
                    <div className="temperature">
                        {units === 'metric' ? 
                            `${weatherData.current.temp_c}°C` : 
                            `${weatherData.current.temp_f}°F`}
                    </div>
                    <div className="condition">
                        <img src={weatherData.current.condition?.icon} alt={weatherData.current.condition?.text} />
                        <p>{weatherData.current.condition?.text}</p>
                    </div>
                    <div className="details">
                        <p>Humidity: {weatherData.current.humidity}%</p>
                        <p>Wind: {weatherData.current.wind_kph} km/h</p>
                    </div>
                </div>
            )}

            {forecastData && (
                <div className="forecast">
                    <h2>5-Day Forecast</h2>
                    <div className="forecast-days">
                        {forecastData.map((day) => (
                            <div key={day.date} className="forecast-day">
                                <h3>{day.date}</h3>
                                <img src={day.day.condition.icon} alt={day.day.condition.text} />
                                <p>{day.day.condition.text}</p>
                                <p>Max: {units === 'metric' ? `${day.day.maxtemp_c}°C` : `${day.day.maxtemp_f}°F`}</p>
                                <p>Min: {units === 'metric' ? `${day.day.mintemp_c}°C` : `${day.day.mintemp_f}°F`}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherApp;