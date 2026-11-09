import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangeSliderProps {
  startDate?: Date;
  endDate?: Date | null;  // null = "until further notice"
  onChange: (range: { startDate: Date; endDate: Date | null }) => void;
  readOnly?: boolean;
  label?: string;
  minDate?: Date;  // Optional: restrict earliest date
}

/**
 * Interactive timeline date range selector
 * 
 * Features:
 * - Horizontal slider with draggable dots for start/end dates
 * - "until further notice" label when no end date set
 * - Click dots to edit directly
 * - Professional, intuitive UX (similar to Airbnb date picker)
 */
export const DateRangeSlider: React.FC<DateRangeSliderProps> = ({
  startDate = new Date(),
  endDate = new Date(new Date().setDate(new Date().getDate() + 30)),
  onChange,
  readOnly = false,
  label = 'Date Range',
  minDate = new Date(2020, 0, 1),
}) => {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate pixel position from date
  const dateToPixel = (date: Date | null): number => {
    if (!date || !containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth - 40; // padding
    const daysDiff = Math.floor((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const range = 365; // Show 1 year by default
    return Math.min(Math.max((daysDiff / range) * containerWidth, 0), containerWidth);
  };

  // Calculate date from pixel position
  const pixelToDate = (pixel: number): Date => {
    if (!containerRef.current) return localStart;
    const containerWidth = containerRef.current.offsetWidth - 40;
    const daysOffset = Math.round((pixel / containerWidth) * 365);
    const newDate = new Date(minDate);
    newDate.setDate(newDate.getDate() + daysOffset);
    return newDate;
  };

  const handleMouseDown = (type: 'start' | 'end') => {
    if (readOnly) return;
    if (type === 'start') setIsDraggingStart(true);
    else setIsDraggingEnd(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pixel = e.clientX - rect.left - 20; // 20px padding

      if (isDraggingStart) {
        const newDate = pixelToDate(pixel);
        if (!localEnd || newDate <= localEnd) {
          setLocalStart(newDate);
        }
      }
      if (isDraggingEnd) {
        const newDate = pixelToDate(pixel);
        if (newDate >= localStart) {
          setLocalEnd(newDate);
        }
      }
    };

    const handleMouseUp = () => {
      if (isDraggingStart || isDraggingEnd) {
        onChange({ startDate: localStart, endDate: localEnd });
        setIsDraggingStart(false);
        setIsDraggingEnd(false);
      }
    };

    if (isDraggingStart || isDraggingEnd) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingStart, isDraggingEnd, localStart, localEnd, onChange]);

  const startPixel = dateToPixel(localStart);
  const endPixel = dateToPixel(localEnd);

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      
      <div
        ref={containerRef}
        className="relative h-12 bg-gray-100 rounded-lg p-5 cursor-pointer hover:bg-gray-200 transition"
        onClick={(e) => {
          if (readOnly) return;
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const pixel = e.clientX - rect.left - 20;
          // Clicked closer to start or end?
          if (Math.abs(pixel - startPixel) < Math.abs(pixel - endPixel)) {
            setLocalStart(pixelToDate(pixel));
          } else if (localEnd) {
            setLocalEnd(pixelToDate(pixel));
          }
          onChange({ startDate: localStart, endDate: localEnd });
        }}
      >
        {/* Timeline background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-5 right-5 h-1 bg-gray-300 rounded-full" />

        {/* Active range highlight */}
        {localEnd && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full"
            style={{
              left: `${startPixel + 20}px`,
              width: `${endPixel - startPixel}px`,
            }}
          />
        )}

        {/* Start dot */}
        {!readOnly && (
          <div
            onMouseDown={() => handleMouseDown('start')}
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-md cursor-move transition ${
              isDraggingStart ? 'scale-125 ring-2 ring-blue-300' : 'hover:scale-110'
            }`}
            style={{ left: `${startPixel + 20 - 8}px` }}
            title={localStart.toLocaleDateString()}
          />
        )}

        {/* End dot (or "until further notice" label) */}
        {localEnd ? (
          !readOnly && (
            <div
              onMouseDown={() => handleMouseDown('end')}
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-md cursor-move transition ${
                isDraggingEnd ? 'scale-125 ring-2 ring-blue-300' : 'hover:scale-110'
              }`}
              style={{ left: `${endPixel + 20 - 8}px` }}
              title={localEnd.toLocaleDateString()}
            />
          )
        ) : (
          <div className="absolute -top-6 right-0 text-xs font-semibold text-blue-600 whitespace-nowrap">
            until further notice
          </div>
        )}
      </div>

      {/* Display dates below */}
      <div className="flex justify-between text-xs text-gray-600">
        <span className="font-medium">{localStart.toLocaleDateString()}</span>
        {localEnd ? (
          <span className="font-medium">{localEnd.toLocaleDateString()}</span>
        ) : (
          <span className="text-blue-600 font-semibold">No end date</span>
        )}
      </div>

      {/* Toggle end date button */}
      {!readOnly && (
        <button
          onClick={() => {
            if (localEnd) {
              setLocalEnd(null);
            } else {
              const newEnd = new Date(localStart);
              newEnd.setDate(newEnd.getDate() + 30);
              setLocalEnd(newEnd);
            }
            onChange({ startDate: localStart, endDate: localEnd ? null : new Date(localStart) });
          }}
          className="text-xs text-blue-600 hover:text-blue-700 underline"
        >
          {localEnd ? 'Remove end date' : 'Add end date'}
        </button>
      )}
    </div>
  );
};

export default DateRangeSlider;
