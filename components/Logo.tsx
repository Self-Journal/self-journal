import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'text-base gap-1 px-2 py-1',
    md: 'text-lg gap-1.5 px-2.5 py-1.5',
    lg: 'text-xl gap-2 px-3 py-2'
  };

  return (
    <div className={`inline-flex items-center ${sizes[size]} rounded-md bg-foreground text-background ${className}`}>
      <span className="font-bold leading-none">•</span>
      <span className="font-bold leading-none">X</span>
      <span className="font-bold leading-none">→</span>
    </div>
  );
};

export default Logo;
