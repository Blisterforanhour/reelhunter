import React from 'react';
import { clsx } from 'clsx';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'medium'
}) => {
  const baseClasses = 'rounded-lg border border-slate-700/50 shadow-lg';
  const backgroundStyle = {
    background: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
  };
  
  const paddingClasses = {
    none: '',
    small: 'p-3',
    medium: 'p-6',
    large: 'p-8'
  };

  return (
    <div
      className={clsx(baseClasses, paddingClasses[padding], className)}
      style={backgroundStyle}
    >
      {children}
    </div>
  );
};

export default Card;