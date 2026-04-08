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

  // 🔥 по умолчанию Odessa
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

  // 🖱 мышка
  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    setOffset({ x, y });
  };

  // 📱 телефон
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const x = (touch.clientX / window.innerWidth - 0.5) * 30;
    const y = (touch.clientY / window.innerHeight - 0.5) * 30;
    setOffset({ x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="h-[100dvh] overflow-hidden text-white relative"
    >
      {/* BACKGROUND */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        animate={{ x: offset.x, y: offset.y }}
        transition={{ type: "spring", stiffness: 40 }}
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* SEARCH */}
      <div className="relative z-10 flex justify-center pt-8 md:pt-10 gap-3 px-4">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && getWeather()}
          placeholder="Search city..."
          className="w-full max-w-[250px] px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md outline-none"
        />
        <button
          onClick={getWeather}
          className="bg-white/30 px-4 py-2 rounded-xl backdrop-blur-md"
        >
          Search
        </button>
      </div>

      {/* MAIN */}
      <div className="relative z-10 flex flex-col items-center mt-10 md:mt-12 px-4 text-center pb-52 md:pb-0">

        {weather && (
          <>
            {/* ГОРОД */}
            <h1 className="text-3xl md:text-5xl font-semibold tracking-wide">
              Odessa
            </h1>

            {/* описание */}
            <p className="opacity-70 capitalize text-sm mt-1">
              {weather.weather[0].description}
            </p>

            {/* температура */}
            <p className="text-6xl md:text-8xl font-light mt-4 tracking-tight">
              {Math.round(weather.main.temp)}°
            </p>

            {/* карточки */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 w-full max-w-[500px]">
              <Glass title="Humidity" value={`${weather.main.humidity}%`} />
              <Glass title="Wind" value={`${weather.wind.speed} m/s`} />
              <Glass title="Clouds" value={`${weather.clouds.all}%`} />
              <Glass title="Pressure" value={`${weather.main.pressure}`} />
            </div>

            {/* ✅ ГРАФИК (исправленный) */}
            <div className="w-full flex justify-center mt-6">
              <div className="flex gap-2 bg-white/10 p-3 rounded-2xl backdrop-blur-md overflow-x-auto max-w-[700px] w-full md:w-auto">

                {forecast.map((item, i) => (
                  <div key={i} className="text-center min-w-[45px]">
                    <p className="text-xs opacity-70">
                      {new Date(item.dt_txt).getHours()}:00
                    </p>

                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: item.main.temp * 3 }}
                      className="w-2 bg-white mx-auto rounded"
                    />

                    <p className="text-xs mt-1">
                      {Math.round(item.main.temp)}°
                    </p>
                  </div>
                ))}

              </div>
            </div>
          </>
        )}
      </div>

      {/* КАРТА */}
      {coords && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[95%] h-[180px] md:h-60 rounded-2xl overflow-hidden z-10">
          <MapContainer center={coords} zoom={10} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={coords}>
              <Popup>Odessa 📍</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
}

function Glass({ title, value }) {
  return (
    <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-center shadow-xl">
      <p className="text-xs opacity-70">{title}</p>
      <p className="text-lg">{value}</p>
    </div>
  );
}
