
'use client';

import { useState, useEffect } from 'react';

interface AnalogClockProps {
  size?: number;
  className?: string;
}

const AnalogClock: React.FC<AnalogClockProps> = ({ size = 300, className }) => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client to avoid hydration mismatch
    setCurrentTime(new Date());

    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 50); // Update every 50ms for smoother second hand
    return () => clearInterval(timerId);
  }, []);

  if (!currentTime) {
    // Render a placeholder or nothing until client-side hydration
    // This ensures the clock visuals are only rendered on the client.
    return <div style={{ width: size, height: size }} className={className} />;
  }

  const centerX = size / 2;
  const centerY = size / 2;
  const clockRadius = size * 0.42; // Radius of the clock face

  // Calculate rotations for hands
  const seconds = currentTime.getSeconds() + currentTime.getMilliseconds() / 1000;
  const minutes = currentTime.getMinutes() + seconds / 60;
  const hours = currentTime.getHours() % 12 + minutes / 60; // 12-hour format

  const secondHandRotation = (seconds / 60) * 360;
  const minuteHandRotation = (minutes / 60) * 360;
  const hourHandRotation = (hours / 12) * 360;

  // Define hand lengths
  const hourHandLength = clockRadius * 0.5;
  const minuteHandLength = clockRadius * 0.75;
  const secondHandLength = clockRadius * 0.9;
  
  // Base style for hands for smooth transition
  const handStyle: React.CSSProperties = {
    transformOrigin: `${centerX}px ${centerY}px`,
    transition: 'transform 0.05s linear', // Smooth transition for hand movement
  };

  // Function to get properties for hour markers
  const getMarkerProps = (index: number) => {
    const angleRad = ((index * 30 - 90) * Math.PI) / 180; // Each hour is 30 degrees, -90 offset to start at 12
    const isMajor = (index + 1) % 3 === 0; // Major markers at 3, 6, 9, 12
    const markerLength = isMajor ? clockRadius * 0.1 : clockRadius * 0.05;
    const x1 = centerX + (clockRadius - markerLength) * Math.cos(angleRad);
    const y1 = centerY + (clockRadius - markerLength) * Math.sin(angleRad);
    const x2 = centerX + clockRadius * Math.cos(angleRad);
    const y2 = centerY + clockRadius * Math.sin(angleRad);
    return {
      markerKey: `marker-${index}`, // Renamed to avoid confusion, will be used as key
      x1, y1, x2, y2,
      strokeWidth: isMajor ? size * 0.012 : size * 0.006,
    };
  };

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Clock Face */}
        <circle cx={centerX} cy={centerY} r={clockRadius} fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth={size * 0.015} />
        
        {/* Hour Markers */}
        {Array.from({ length: 12 }, (_, i) => {
          const { markerKey, ...markerLineProps } = getMarkerProps(i);
          return <line key={markerKey} {...markerLineProps} stroke="hsl(var(--foreground))" strokeLinecap="round" />;
        })}

        {/* Hour Hand */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + hourHandLength} // Hand drawn pointing right initially
          y2={centerY}
          stroke="hsl(var(--foreground))"
          strokeWidth={size * 0.025}
          strokeLinecap="round"
          style={{ ...handStyle, transform: `rotate(${hourHandRotation}deg)` }}
        />

        {/* Minute Hand */}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + minuteHandLength} // Hand drawn pointing right initially
          y2={centerY}
          stroke="hsl(var(--foreground))"
          strokeWidth={size * 0.018}
          strokeLinecap="round"
          style={{ ...handStyle, transform: `rotate(${minuteHandRotation}deg)` }}
        />

        {/* Second Hand */}
        <line
          x1={centerX - secondHandLength * 0.15} // Small tail for the second hand
          y1={centerY}
          x2={centerX + secondHandLength * 0.85} // Main part of the second hand
          y2={centerY}
          stroke="hsl(var(--primary))" // Primary color for second hand
          strokeWidth={size * 0.01}
          strokeLinecap="round"
          style={{ ...handStyle, transform: `rotate(${secondHandRotation}deg)` }}
        />
        
        {/* Center Dot */}
        <circle cx={centerX} cy={centerY} r={size * 0.025} fill="hsl(var(--primary))" stroke="hsl(var(--card))" strokeWidth={size*0.005}/>
      </svg>
    </div>
  );
};

export default AnalogClock;
