import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  onClick, 
  className = '', 
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  rounded = 'md',
  icon = null,
  iconPosition = 'left',
  loading = false,
  loadingText = 'Loading...',
  animation = true
}) => {
  
  const baseStyles = 'font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200';
  
  // Enhanced color variants with hover and focus states
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500 text-white',
    info: 'bg-teal-500 hover:bg-teal-600 focus:ring-teal-500 text-white',
    light: 'bg-gray-100 hover:bg-gray-200 focus:ring-gray-300 text-gray-800',
    dark: 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-700 text-white',
    link: 'text-blue-600 hover:text-blue-700 underline bg-transparent',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 bg-transparent',
    'outline-secondary': 'border border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500 bg-transparent',
    'outline-success': 'border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500 bg-transparent',
    'outline-danger': 'border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500 bg-transparent',
    'gradient-blue': 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 text-white',
    'gradient-purple': 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500 text-white',
    'gradient-green': 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 focus:ring-green-500 text-white',
  };
  
  // Enhanced size variants
  const sizeStyles = {
    xs: 'py-1 px-2 text-xs',
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-2.5 px-5 text-lg',
    xl: 'py-3 px-6 text-xl'
  };

  // Rounded corner variants
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const animationStyles = animation && !disabled ? 'transform active:scale-95' : '';
  
  // Loading state
  const isLoading = loading || disabled;
  const content = isLoading ? (
    <span className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {loadingText}
    </span>
  ) : (
    <>
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </>
  );
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${roundedStyles[rounded]} ${widthStyles} ${disabledStyles} ${animationStyles} ${className}`}
    >
      {content}
    </button>
  );
};

export default Button; 