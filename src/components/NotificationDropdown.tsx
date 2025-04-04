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
  transaction_id?: string | undefined;
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
    
    // Set up interval to check for new notifications
    const interval = setInterval(() => {
      loadNotifications();
    }, 60000); // Check every minute
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.notification-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
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
    
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }
  }, [navigate, markAsRead]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 notification-dropdown transform -translate-x-1/2 left-1/2 md:transform-none md:left-auto">
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
                    className={`p-4 ${!notification.read ? 'bg-gray-50' : ''} hover:bg-gray-100 cursor-pointer`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent text overflow */}
                        <p className={`text-sm font-medium ${getTypeStyles(notification.type)} px-2 py-1 rounded-full inline-block mb-1`}>
                          {notification.title}
                        </p>
                        <div className="mt-1 text-sm text-gray-600">
                          <p className="whitespace-pre-line break-words">{notification.message}</p>
                          {notification.transaction_id && (
                            <button
                              onClick={(e) => handleCopyTransactionId(notification.transaction_id, e)}
                              className="mt-2 text-blue-600 hover:text-blue-700 inline-flex items-center"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copier l'ID
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                            aria-label="Marquer comme lu"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-gray-500"
                          aria-label="Supprimer"
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