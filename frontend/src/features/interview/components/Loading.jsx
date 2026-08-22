import React, { useEffect, useState } from 'react';
import '../style/loading.scss';

const Loading = () => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="sci-fi-loading-container">
            <div className="sci-fi-core-wrapper">
                {/* Background Radar Sweep */}
                <div className="radar-sweep"></div>
                
                {/* Rotating Rings */}
                <svg className="ring ring-1" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" />
                </svg>
                <svg className="ring ring-2" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" />
                </svg>
                <svg className="ring ring-3" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="25" />
                </svg>
                
                {/* Central Pulsating Core */}
                <div className="pulsating-core"></div>
            </div>
            <div className="loading-text">
                Loading...<span>{dots}</span>
            </div>
        </div>
    );
};

export default Loading;
