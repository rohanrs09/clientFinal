import React from 'react';

const Card = ({ children, title, className = '', footer = null }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="border-b px-6 py-4">
          <h3 className="font-bold text-xl">{title}</h3>
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