import React from 'react';

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray ${className}`}>
      <h2 className="text-xl font-bold text-brand-orange mb-4">{title}</h2>
      {children}
    </div>
  );
};

export default DashboardSection;
