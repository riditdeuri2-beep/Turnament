import React from 'react';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; className?: string; style?: React.CSSProperties }> = ({ title, value, icon: Icon, className = '', style }) => {
  return (
    <div className={`bg-brand-gray p-6 rounded-lg shadow-lg flex items-center gap-6 border border-brand-light-gray hover:border-brand-orange/50 transition-colors duration-300 ${className}`} style={style}>
      <div className="bg-brand-dark p-4 rounded-full">
        <Icon className="text-brand-orange" size={28} />
      </div>
      <div>
        <p className="text-brand-text-secondary">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;