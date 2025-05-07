import React, { useRef, useState } from 'react';
import { Passenger } from '../data/passengers.js';
import { PassengerDossier } from './PassengerDossier.js';

interface CharacterSliderProps {
  passengers: Passenger[];
  selectedPassenger: Passenger | null;
  onSelectPassenger: (passenger: Passenger) => void;
}

export const CharacterSlider: React.FC<CharacterSliderProps> = ({
  passengers,
  selectedPassenger,
  onSelectPassenger,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const scrollToCard = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = 300; // Adjust based on card width
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => scrollToCard('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-[#2a2a2a]/80 text-[#e2e0dc] rounded-r-lg hover:bg-[#2a2a2a]"
      >
        ←
      </button>
      <div
        ref={sliderRef}
        className="flex overflow-x-auto space-x-4 p-4 scrollbar-hide"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {passengers.map((passenger) => (
          <div
            key={passenger.id}
            className="flex-none w-[280px]"
            onClick={() => onSelectPassenger(passenger)}
          >
            <PassengerDossier
              passenger={passenger}
              onInspect={() => onSelectPassenger(passenger)}
              isActive={selectedPassenger?.id === passenger.id}
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => scrollToCard('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-[#2a2a2a]/80 text-[#e2e0dc] rounded-l-lg hover:bg-[#2a2a2a]"
      >
        →
      </button>
    </div>
  );
}; 