import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import bg from "./assets/bg.jpg";

const API_KEY = "2748459c13821cbceaaaf849ef5f9966";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [coords, setCoords] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchWeather("Odessa");
  }, []);

  const fetchWeather = async (cityName) => {
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
    );

    const forecastRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
    );

    setWeather(res.data);
    setCoords([res.data.coord.lat, res.data.coord.lon]);
    setForecast(forecastRes.data.list.slice(0, 8));
  };

  const getWeather = () => {
    if (!city) return;
    fetchWeather(city);
    setCity("");
  };

  const move = (x, y) => {
    setOffset({
      x: (x / window.innerWidth - 0.5) * 30,
      y: (y / window.innerHeight - 0.5) * 30,
    });
  };

  return (
    <div
      onMouseMove={(e) => move(e.clientX, e.clientY)}
      onTouchMove={(e) => move(e.touches[0].clientX, e.touches[0].clientY)}
      className="h-screen overflow-y-auto text-white relative"
    >
      {/* BACKGROUND */}
      <motion.div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        animate={{ x: offset.x, y: offset.y }}
        transition={{ type: "spring", stiffness: 40 }}
      />

      <div className="fixed inset-0 bg-black/30 -z-10" />

      {/* SEARCH */}
      <div className="flex justify-center pt-6 gap-3 px-4">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && getWeather()}
          placeholder="Search city..."
          className="w-full max-w-[250px] px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md outline-none"
        />
        <button
          onClick={getWeather}
          className="bg-white/30 px-4 py-2 rounded-xl"
        >
          Search
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col items-center mt-10 px-4 text-center pb-[205px] md:pb-[265px]">

        {weather && (
          <>
            <h1 className="text-3xl md:text-5xl font-semibold">
              {weather.name}
            </h1>

            <p className="opacity-70 capitalize mt-1">
              {weather.weather[0].description}
            </p>

            <p className="text-6xl md:text-8xl mt-4 font-light">
              {Math.round(weather.main.temp)}°
            </p>

            {/* CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 w-full max-w-[500px]">
              <Glass title="Humidity" value={`${weather.main.humidity}%`} />
              <Glass title="Wind" value={`${weather.wind.speed} m/s`} />
              <Glass title="Clouds" value={`${weather.clouds.all}%`} />
              <Glass title="Pressure" value={`${weather.main.pressure}`} />
            </div>

            {/* GRAPH */}
            <div className="w-full flex justify-center mt-6">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md overflow-x-auto">
                <div className="flex gap-3 w-max">
                  {forecast.map((item, i) => (
                    <div key={i} className="w-[45px] text-center flex-shrink-0">
                      <p className="text-xs opacity-70">
                        {new Date(item.dt_txt).getHours()}:00
                      </p>

                      <div
                        className="w-2 bg-white mx-auto rounded"
                        style={{ height: item.main.temp * 3 }}
                      />

                      <p className="text-xs mt-1">
                        {Math.round(item.main.temp)}°
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* КАРТА */}
      {coords && (
        <div className="fixed left-0 w-full z-20 px-2 h-[200px] md:h-60 bottom-0">
          <div className="w-full h-full rounded-2xl overflow-hidden">
            <MapContainer center={coords} zoom={10} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={coords}>
                <Popup>{weather?.name} 📍</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function Glass({ title, value }) {
  return (
    <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-center">
      <p className="text-xs opacity-70">{title}</p>
      <p className="text-lg">{value}</p>
    </div>
  );
}
