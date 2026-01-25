import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  defaultValue?: number[];
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  className?: string;
}

export function Slider({ defaultValue, max = 100, step = 1, onValueChange, className }: SliderProps) {
  const [val, setVal] = React.useState(defaultValue ? defaultValue[0] : 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVal(value);
    if (onValueChange) {
      onValueChange([value]);
    }
  };

  return (
    <input
      type="range"
      min={0}
      max={max}
      step={step}
      value={val}
      onChange={handleChange}
      className={cn(
        "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary",
        className
      )}
    />
  );
}
