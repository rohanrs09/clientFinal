import React from 'react';

const Card = ({ 
  children, 
  title, 
  className = '', 
  footer = null,
  hover = false,
  titleColor = 'text-gray-900',
  headerBg = 'bg-white',
  bordered = false,
  elevation = 'md'
}) => {
  // Shadow elevation styles
  const shadowStyles = {
    'sm': 'shadow-sm',
    'md': 'shadow-md',
    'lg': 'shadow-lg',
    'xl': 'shadow-xl',
    '2xl': 'shadow-2xl',
    'none': ''
  };

  // Hover effect
  const hoverEffect = hover ? 'transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1' : '';
  
  // Border style
  const borderStyle = bordered ? 'border border-gray-200' : '';

  return (
    <div className={`bg-white ${shadowStyles[elevation]} rounded-lg overflow-hidden ${hoverEffect} ${borderStyle} ${className}`}>
      {title && (
        <div className={`${headerBg} border-b px-6 py-4`}>
          <h3 className={`font-bold text-xl ${titleColor}`}>{title}</h3>
        </div>
      )}
      
      <div className="px-6 py-4">
        {children}
      </div>
      
      {footer && (
        <div className="bg-gray-50 px-6 py-3 border-t">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 