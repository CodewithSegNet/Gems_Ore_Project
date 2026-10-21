import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * MobileSwiper — smooth touch-drag carousel for mobile.
 *
 * Props:
 *   items       — array of data items
 *   renderItem  — (item, index) => JSX for each slide
 *   autoPlay    — ms between auto-advances (0 = off, default 5000)
 *   className   — extra classes on the outer wrapper
 */
const MobileSwiper = ({ items, renderItem, autoPlay = 5000, className = "" }) => {
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const containerRef = useRef(null);
  const isHorizontal = useRef(null); // null = undecided, true = horizontal, false = vertical

  // Auto-advance
  useEffect(() => {
    if (!autoPlay || isDragging || items.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, autoPlay);
    return () => clearInterval(id);
  }, [autoPlay, isDragging, items.length, current]);

  const handleTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
    isHorizontal.current = null; // reset direction lock
    setDragOffset(0);
    setIsDragging(false); // don't commit to dragging until direction determined
  }, []);

  const handleTouchMove = useCallback((e) => {
    const diffX = e.touches[0].clientX - startX.current;
    const diffY = e.touches[0].clientY - startY.current;

    // Determine swipe direction on first significant movement
    if (isHorizontal.current === null && (Math.abs(diffX) > 8 || Math.abs(diffY) > 8)) {
      isHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
    }

    // If vertical swipe, do nothing — let page scroll
    if (isHorizontal.current === false || isHorizontal.current === null) return;

    // Horizontal swipe — capture it
    setIsDragging(true);
    setDragOffset(diffX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    // If we never committed to horizontal drag, just reset
    if (!isDragging) {
      setDragOffset(0);
      return;
    }
    setIsDragging(false);
    isHorizontal.current = null;

    const containerWidth = containerRef.current?.offsetWidth || 1;
    const elapsed = Date.now() - startTime.current;
    const velocity = Math.abs(dragOffset) / elapsed; // px/ms

    // Trigger slide if dragged > 25% of width OR fast swipe (velocity > 0.3)
    const threshold = containerWidth * 0.25;
    const shouldChange = Math.abs(dragOffset) > threshold || velocity > 0.3;

    if (shouldChange) {
      if (dragOffset < 0 && current < items.length - 1) {
        setCurrent((prev) => prev + 1);
      } else if (dragOffset > 0 && current > 0) {
        setCurrent((prev) => prev - 1);
      }
    }

    setDragOffset(0);
  }, [isDragging, dragOffset, current, items.length]);

  const translateX = -(current * 100) + (dragOffset / (containerRef.current?.offsetWidth || 1)) * 100;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="overflow-hidden rounded-lg"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(${translateX}%)`,
            transition: isDragging ? "none" : "transform 400ms cubic-bezier(0.25, 0.1, 0.25, 1)",
          }}
        >
          {items.map((item, i) => (
            <div key={i} className="w-full shrink-0">
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                current === i
                  ? "w-6 h-2 bg-[rgba(88,57,49,1)]"
                  : "w-2 h-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileSwiper;
