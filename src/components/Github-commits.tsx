import React, { useState } from "react";

// Function to generate a range of dates for the grid
const generateDateRange = (days: number) => {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const day = new Date();
    day.setDate(today.getDate() - i);
    return {
      date: day.toISOString().split("T")[0],
      loggedIn: Math.random() > 0.5, // Simulating logged in (true/false)
    };
  }).reverse();
};

const ContributionHeatmap = () => {
  const [timeRange, setTimeRange] = useState("week");
  const timeRangeMapping = {
    week: 7,
    month: 30,
    year: 365,
  };

  // Generate data based on the selected time range
  const contributions = generateDateRange(timeRangeMapping[timeRange]);

  // Convert the contribution data into weeks and days for grid layout
  const getGridLayout = () => {
    if (timeRange === "week") {
      return [contributions]; // Single row for week
    }
    if (timeRange === "month") {
      const rows = [];
      for (let i = 0; i < contributions.length; i += 30) {
        rows.push(contributions.slice(i, i + 30));
      }
      return rows;
    }
    if (timeRange === "year") {
      const rows = [];
      for (let i = 0; i < contributions.length; i += 52) { // Each week has 7 days
        rows.push(contributions.slice(i, i + 52));
      }
      return rows;
    }
    return [];
  };

  const weeks = getGridLayout();

  // Function to get the correct background color based on login status
  const getColorClass = (loggedIn: boolean) => {
    return loggedIn ? "bg-white" : "bg-gray-900"; // White for logged in, gray for not logged in
  };

  // Determine cell size based on the selected time range
  const getCellSize = () => {
    switch (timeRange) {
      case "week":
        return "w-20 h-20 gap-1";
      case "month":
        return "w-8 h-8 gap-1";
      case "year":
        return "w-5 h-5 gap-1";
      default:
        return "w-2 h-2 gap-1"; // Fallback size
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex justify-between w-full p-6">
        <h2 className="text-white text-lg font-semibold">
          User login activity in the last {timeRange}
        </h2>

        {/* Dropdown for selecting time range */}
        <div className="mb-4">
          <label className="text-white mr-2">Select Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex flex-col gap-1 border p-3 m-6 overflow-auto scrollbar-custom">
        {weeks.map((week, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-wrap gap-2 justify-start"
          >
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.loggedIn ? "Logged in" : "No login"}`}
                className={`${getCellSize()} ${getColorClass(day.loggedIn)} `}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="text-gray-400 text-sm flex items-center space-x-2">
        <span>No Logins</span>
        <div className="w-4 h-4 bg-gray-900 rounded" />
        <span>Logged In</span>
        <div className="w-4 h-4 bg-white rounded" />
      </div>
    </div>
  );
};

export default ContributionHeatmap;
