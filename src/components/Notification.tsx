import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  message: string;
  type?: NotificationType;
  duration?: number;
  onClose?: () => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
};

const colorMap = {
  success: 'bg-green-500/80 border-green-600',
  error: 'bg-red-500/80 border-red-600',
  warning: 'bg-yellow-500/80 border-yellow-600',
  info: 'bg-blue-500/80 border-blue-600'
};

export function Notification({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = iconMap[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-[100] flex items-center space-x-3 p-4 rounded-lg shadow-lg 
        text-white ${colorMap[type]} border animate-slide-in`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationProps | null>(null);

  const showNotification = (options: NotificationProps) => {
    setNotification(options);
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const NotificationComponent = notification ? (
    <Notification 
      {...notification} 
      onClose={clearNotification} 
    />
  ) : null;

  return { 
    showNotification, 
    NotificationComponent 
  };
}
