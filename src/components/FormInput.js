import React from 'react';

const FormInput = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder = '', 
  required = false,
  error = null,
  disabled = false,
  className = '',
  min,
  max,
  step,
  icon = null,
  iconPosition = 'left',
  helpText = null,
  rounded = 'md',
  variant = 'default',
  size = 'md'
}) => {
  // Rounded corner variants
  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  // Input size variants
  const sizeStyles = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-3 text-base',
    lg: 'py-3 px-4 text-lg'
  };

  // Input variants
  const variantStyles = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500'
  };

  // Apply error variant if error is present
  const currentVariant = error ? 'error' : variant;
  
  // Base input styles
  const inputBaseStyles = `shadow-sm appearance-none border ${roundedStyles[rounded]} w-full ${sizeStyles[size]} text-gray-700 leading-tight ${variantStyles[currentVariant]} focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200`;
  
  // Disabled styles
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'bg-white';
  
  // Icon padding
  const iconPaddingLeft = icon && iconPosition === 'left' ? 'pl-10' : '';
  const iconPaddingRight = icon && iconPosition === 'right' ? 'pr-10' : '';
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-gray-700 text-sm font-medium mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`${inputBaseStyles} ${disabledStyles} ${iconPaddingLeft} ${iconPaddingRight}`}
            rows="4"
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={`${inputBaseStyles} ${disabledStyles} ${iconPaddingLeft} ${iconPaddingRight}`}
          />
        )}
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-gray-500 text-xs mt-1">{helpText}</p>
      )}
    </div>
  );
};

export default FormInput; 