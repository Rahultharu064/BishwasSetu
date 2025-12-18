import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'outline' | 'secondary' | 'white';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  loading = false,
  onClick,
  className = '',
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-[#1E90FF] text-white hover:bg-[#1873CC] hover:scale-105 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-[#1E90FF] text-[#1E90FF] hover:bg-[#1E90FF] hover:text-white',
    secondary: 'bg-[#FFD700] text-[#212529] hover:bg-[#E6C200] hover:scale-105',
    white: 'bg-white text-[#1E90FF] hover:bg-[#F8F9FA] hover:scale-105',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm h-[36px]',
    md: 'px-6 py-2.5 text-base h-[44px]',
    lg: 'px-8 py-3 text-lg h-[48px]',
  };
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
