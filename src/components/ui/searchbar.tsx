import React, { useState } from "react";
import { Search } from "lucide-react";

function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    if (e.target.value === "") {
      setIsFocused(false);
    }
  };

  return (
    <div className=" text-black  ">
      <div className="relative">
        <input
          type="text"
          className={`bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none transition-all duration-300 ease-in-out ${
            isFocused ? "w-full" : "w-12"
          }`}
          placeholder="Search..."
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {isFocused ? (
          <button type="submit" className="absolute right-0 top-2  mr-4">
            <Search />
          </button>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default SearchBar;
