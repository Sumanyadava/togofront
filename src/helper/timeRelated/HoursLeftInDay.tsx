import { timeLeftInTodayAtom } from '@/stateHelper';
import { atom, useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';

interface HoursLeftInDayProps {
  timeZone?: string;
}


const HoursLeftInDay: React.FC<HoursLeftInDayProps> = ({ timeZone= "Asia/Kolkata" }) => {

  
  
  const [hoursLeft, setHoursLeft] = useAtom(timeLeftInTodayAtom);

  

  useEffect(() => {
    const calculateHoursLeft = () => {
      // Get the current time in the specified timezone
      const now = new Date();
      const localTime = new Date(now.toLocaleString('en-US', { timeZone }));

      // Calculate the end of the day in the specified timezone
      const endOfDay = new Date(localTime);
      endOfDay.setHours(23, 59, 59, 999);

      // Calculate the difference in milliseconds and convert to hours
      const hoursLeft = (endOfDay.getTime() - localTime.getTime()) / (1000 * 60 * 60);

      // Update state
      setHoursLeft(Math.floor(hoursLeft));

    };

    calculateHoursLeft();

    // Optionally, update every minute to keep it accurate
    const intervalId = setInterval(calculateHoursLeft, 60 * 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [timeZone]);

  return (
    <span>
      {/* <p>{timeZone}: {hoursLeft} hours left</p> */}
      <span>{hoursLeft}</span>
    </span>
  );
};

export default HoursLeftInDay;
