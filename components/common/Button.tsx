import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', isLoading = false, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-bold transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-brand-orange hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20',
    secondary: 'bg-brand-light-gray hover:bg-gray-600 text-brand-text',
    danger: 'bg-brand-red hover:bg-red-600 text-white',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
