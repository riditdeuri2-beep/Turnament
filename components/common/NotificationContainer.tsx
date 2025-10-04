import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="text-green-400" />,
  error: <AlertTriangle className="text-red-400" />,
  info: <Info className="text-blue-400" />,
};

const colors = {
    success: 'border-green-500/50',
    error: 'border-red-500/50',
    info: 'border-blue-500/50',
}

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-3">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`bg-brand-gray text-brand-text p-4 rounded-lg shadow-2xl flex items-start gap-3 border-l-4 ${colors[notification.type]} animate-fade-in-up`}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[notification.type]}</div>
          <div className="flex-grow text-sm">{notification.message}</div>
          <button onClick={() => removeNotification(notification.id)} className="flex-shrink-0 text-brand-text-secondary hover:text-brand-text">
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
