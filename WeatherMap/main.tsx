import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Map from './node_modules/react-map-gl/dist/es5/exports-maplibre';
import { DisplayWeather } from './map';

function App() {
    let [lg, setLng] = useState(30);
    let [lt, setLat] = useState(59);

    let [weatherDesc, setWeatherDesc] = useState("-");
    let [weatherTemp, setWeatherTemp] = useState(0);
    let [weatherFeels, setWeatherFeels] = useState(0);
    let [weatherCoun, setWeatherCoun] = useState("-");
    let [weatherName, setWeatherName] = useState("-");
    let [weatherWind, setWeatherWind] = useState(0);

    let onMouseP = (e: any) => {
        setLat(e.lngLat.lat);
        setLng(e.lngLat.lng); 

        let key = "7248ea2eb20bb4bac566e6aac05c1ec6";

        let inp = document.getElementById("keyInput") as HTMLInputElement;
        if (inp !== null){
            key = inp.value;            
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${e.lngLat.lat}&lon=${e.lngLat.lng}&units=metric&appid=${key}`;

        fetch(url).then((data) => {
            data.text().then((txt) => {
                let obj = JSON.parse(txt);
    
                setWeatherDesc(obj.weather[0].description);
                setWeatherTemp(obj.main.temp);
                setWeatherFeels(obj.main.feels_like);
    
                setWeatherCoun(obj.sys.country);
                setWeatherName(obj.name);
                setWeatherWind(obj.wind.speed);                                  
            });
        });

    }  

    return (
        <div className="div-wrapper">
            <div className='map-wrapper'>        
                <Map 
                    onClick={onMouseP}            
                    initialViewState={{
                    longitude: 30,
                    latitude: 59,
                    zoom: 3
                    }}  
                    style={{width: '80%', height: '80%'}}      
                    mapStyle="https://api.maptiler.com/maps/openstreetmap/style.json?key=wF0uF9Z2aWYMkBfbi5rd"
                /> 
            </div>
            <div className='display-wrapper'>
                <div className='weather-data'>
                    <DisplayWeather lat={lt} lng={lg} weatherCoun={weatherCoun} weatherName={weatherName} weatherDesc={weatherDesc} weatherTemp={weatherTemp} weatherFeels={weatherFeels} weatherWind={weatherWind}></DisplayWeather>
                </div>           
            </div>
      </div>
    );
  }

async function onLoad() {
    const rootElement = document.getElementById('root');     

    if (rootElement) {
        const root = createRoot(rootElement);
        root.render(<App></App>);
    }
}

window.onload = onLoad;