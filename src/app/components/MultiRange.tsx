import { SetStateAction } from "jotai";
import React, { Dispatch, useState } from "react";
import Slider from "react-slider"
interface MultiRangeSliderProps {
  min: number;
  max: number;
  value : [number , number] ; 
  setValue : Dispatch<SetStateAction<[number , number] | null>> ; 
  setRange : Dispatch<SetStateAction<[number , number] | null>> 
}

const MultiRangeSlider: React.FC<MultiRangeSliderProps> = ({ min, max, value , setValue , setRange }) => {
  
    
  return (
    <div className="  w-[90%]  gap-3 text-sm relative">
        <Slider className="slider"
                value={value}
                onChange={setValue}
                minDistance={max < 10000 ? 100 : max<100000 ?  1000 : 500}
                max={max}
                min={min}
                pearling
                onAfterChange={setRange}
              
        />
        <div className="mt-3 absolute top-full left-0 dark:text-slate-300">
            ${value[0]}
        </div>
        <div className="mt-3 absolute top-full right-0 dark:text-slate-300">
            ${value[1]}
        </div>
    </div>
  );
};

export default MultiRangeSlider;
