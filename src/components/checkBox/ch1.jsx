import React, { useState } from 'react';

const AnimatedCheckbox = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div className="inline-flex items-center bg-gray-200 p-5">
      <input
        type="checkbox"
        id="animated-checkbox"
        className="hidden"
        checked={isChecked}
        onChange={handleCheckboxChange}
      />
      <label
        htmlFor="animated-checkbox"
        className="flex items-center cursor-pointer text-gray-700"
      >
        <span className={`
          inline-block w-10 h-10 mr-2 border-2 border-gray-700 rounded-full
          transition-all duration-300 ease-in-out
          ${isChecked ? 'bg-gray-700 scale-125' : 'bg-transparent'}
          relative
        `}>
          <span className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            w-0 h-0.5 bg-white rounded-sm origin-left
            transition-all duration-150 ease-in-out delay-150
            ${isChecked ? 'w-1.5 rotate-45' : ''}
          `}></span>
          <span className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            w-0 h-0.5 bg-white rounded-sm origin-left
            transition-all duration-150 ease-in-out delay-300
            ${isChecked ? 'w-2.5 -rotate-45' : ''}
          `}></span>
        </span>
        Checkbox
      </label>
    </div>
  );
};

export default AnimatedCheckbox;