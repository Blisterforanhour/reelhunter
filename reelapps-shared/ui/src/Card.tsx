import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;