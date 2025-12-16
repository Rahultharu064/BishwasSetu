import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white shadow-2xl rounded-2xl p-8 transform transition-all duration-500 ease-in-out hover:shadow-3xl hover:scale-105 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
