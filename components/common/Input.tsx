import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>}
      <input
        id={id}
        className="w-full bg-brand-light-gray border border-gray-600 text-brand-text rounded-md px-3 py-2 focus:border-brand-orange focus:outline-none focus:shadow-[0_0_10px_rgba(255,102,0,0.5)] transition-all duration-300"
        {...props}
      />
    </div>
  );
};

export default Input;