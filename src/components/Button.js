import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  onClick, 
  className = '', 
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false
}) => {
  
  const baseStyles = 'font-bold rounded focus:outline-none focus:shadow-outline transition-colors duration-200';
  
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-700 text-white',
    success: 'bg-green-500 hover:bg-green-700 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    info: 'bg-teal-500 hover:bg-teal-700 text-white',
    light: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    dark: 'bg-gray-800 hover:bg-gray-900 text-white',
    link: 'text-blue-500 hover:text-blue-700 underline bg-transparent',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
  };
  
  const sizeStyles = {
    xs: 'py-1 px-2 text-xs',
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
    xl: 'py-4 px-8 text-xl'
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button; 