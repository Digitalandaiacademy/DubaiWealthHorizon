import React, { useEffect, useState, useCallback } from 'react';
import { Bell, X, Check, Copy } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  transaction_id?: string; // Ensure this property is defined
}

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationStore();

  useEffect(() => {
    loadNotifications();
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.notification-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyTransactionId = useCallback((transactionId: string | undefined, event: React.MouseEvent) => {
    event.stopPropagation();
    if (transactionId) {
      navigator.clipboard.writeText(transactionId);
      toast.success("ID de transaction copié !");
    }
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (notification.transaction_id) {
      navigate('/dashboard/payment-verification');
    }
  }, [navigate]);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800';
      case 'error':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-blue-50 text-blue-800';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 notification-dropdown">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucune notification
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 ${!notification.read ? 'bg-gray-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${getTypeStyles(notification.type)}`}>
                          {notification.title}
                        </p>
                        <div className="mt-1 text-sm text-gray-600 flex items-center">
                          <p className="whitespace-pre-line">{notification.message}</p>
                          {notification.transaction_id && (
                            <button
                              onClick={(e) => handleCopyTransactionId(notification.transaction_id, e)}
                              className="ml-2 text-blue-600 hover:text-blue-700 inline-flex items-center"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copier
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;