import React from 'react';

interface StatProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  iconColor?: string;
}

const Stat: React.FC<StatProps> = ({ icon: Icon, label, value, iconColor = 'text-brand-orange' }) => {
  return (
    <div className="flex items-center gap-3 bg-brand-dark p-3 rounded-lg">
      <div className={`p-2 bg-brand-light-gray rounded-full ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-brand-text-secondary">{label}</p>
        <p className="font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default Stat;