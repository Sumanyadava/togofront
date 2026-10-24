import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Flame } from "lucide-react";

const ChallengeTimer = () => {
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState(() => format(new Date(), "HH:mm:ss"));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(format(new Date(), "HH:mm:ss"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      onClick={() => navigate("/challenge-page")}
      className="h-min w-full md:w-1/2 flex lg:text-8xl md:text-6xl text-5xl items-baseline font-mono font-bold flex-wrap justify-center cursor-pointer transition-all duration-300 hover:scale-[1.02] text-foreground select-none p-4 group"
      title="Open Challenges"
    >
      <span className="tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent group-hover:from-orange-400 group-hover:to-amber-500 transition-all duration-300">
        {timeStr}
      </span>
      <div className="flex items-center gap-1.5 font-sans font-medium text-sm md:text-base ml-4 text-muted-foreground group-hover:text-orange-400 transition-colors">
        <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
        <span>Change Future</span>
      </div>
    </div>
  );
};

export default ChallengeTimer;
