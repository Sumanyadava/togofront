import React from "react";

const ShortTaskHead = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-3 bg-white/[0.02] border-b border-white/5 text-[11px] font-semibold text-white/20">
      <div className="flex items-center gap-2 sm:gap-4 min-w-[40px] sm:min-w-[70px]">
        <span className="hidden sm:inline w-4 text-center">#</span>
        <span>Mark</span>
      </div>

      <div className="flex-1">
        <span>Task Description</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-7 shrink-0 text-right pr-2 sm:pr-4">
        <div className="hidden md:block min-w-[70px]">Status</div>
        <div className="hidden lg:block min-w-[60px]">Risk</div>
        <div className="hidden sm:block min-w-[50px]">Logged</div>
        <div className="w-8">Opt</div>
      </div>
    </div>
  );
};

export default ShortTaskHead;
