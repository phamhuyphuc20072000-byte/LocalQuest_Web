import React from 'react';
import { Star } from 'lucide-react';

interface StarsProps {
  rating: number;
  reviews?: number;
  size?: number;
  showNumber?: boolean;
}

export function Stars({ rating, reviews, size = 14, showNumber = true }: StarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4;

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-xs">
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((i) => {
          if (i <= fullStars) {
            return <Star key={i} size={size} className="fill-amber-500 text-amber-500" />;
          }
          if (i === fullStars + 1 && hasHalf) {
            return (
              <div key={i} className="relative">
                <Star size={size} className="text-amber-300" />
                <div className="absolute inset-0 overflow-hidden w-[50%]">
                  <Star size={size} className="fill-amber-500 text-amber-500" />
                </div>
              </div>
            );
          }
          return <Star key={i} size={size} className="text-stone-300 fill-stone-100" />;
        })}
      </div>
      {showNumber && (
        <span className="font-bold text-stone-900 font-mono">
          {rating.toFixed(1)}
        </span>
      )}
      {reviews !== undefined && (
        <span className="text-stone-500 font-mono text-[11px]">
          ({reviews})
        </span>
      )}
    </div>
  );
}
