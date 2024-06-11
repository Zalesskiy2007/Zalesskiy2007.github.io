import React, {useState, useEffect} from 'react';

export function DisplayWeather(props: {lng: number, lat: number, weatherCoun: string, weatherName: string, weatherDesc: string, weatherTemp: number, weatherFeels: number, weatherWind: number}){ 
    

    return (
        <table className='table'>
            <tbody className='tbody'>
                <tr className='tr'>
                    <td className='td td1'><span className='txtTbl'>Country</span></td>
                    <td className='td td1'><span className='txtTbl'>Name</span></td>
                    <td className='td td1'><span className='txtTbl'>Description</span></td>
                    <td className='td td1'><span className='txtTbl'>Temperature</span></td>
                    <td className='td td1'><span className='txtTbl'>Feels like</span></td>
                    <td className='td td1'><span className='txtTbl'>Wind speed</span></td>
                </tr>
                <tr className='tr'>
                    <td className='td td2'><span className='txtTbl'>{props.weatherCoun}</span></td>
                    <td className='td td2'><span className='txtTbl'>{props.weatherName}</span></td>
                    <td className='td td2'><span className='txtTbl'>{props.weatherDesc}</span></td>
                    <td className='td td2'><span className='txtTbl'>{props.weatherTemp}</span></td>
                    <td className='td td2'><span className='txtTbl'>{props.weatherFeels}</span></td>
                    <td className='td td2'><span className='txtTbl'>{props.weatherWind}</span></td>
                </tr>
            </tbody>
        </table>
    );
}