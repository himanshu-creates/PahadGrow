import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export function Rating({ rating, size = 'md', showNumber = false }: RatingProps) {
  const sizeMap = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={sizeMap[size]}
          className={star <= rating ? 'fill-accent text-accent' : 'text-muted'}
        />
      ))}
      {showNumber && (
        <span className="ml-1 text-sm text-muted-foreground">({rating.toFixed(1)})</span>
      )}
    </div>
  );
}
