import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  Bell, 
  Send, 
  Users, 
  Filter, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  MessageSquare,
  Globe,
  RefreshCw
} from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  ip_address?: string;
  location?: {
    country: string;
    city: string;
  };
  last_active?: string;
}

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  recipient_count: number;
  sender?: {
    full_name: string;
    email: string;
  };
}

const AdminNotifications = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [countries, setCountries] = useState<string[]>([]);
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info'
  });
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    loadNotificationHistory();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('last_active', { ascending: false });

      if (error) throw error;

      // Extract unique countries from user data
      const uniqueCountries = Array.from(
        new Set(
          data
            ?.filter(user => user.ip_address && user.location?.country)
            .map(user => user.location?.country)
            .filter(Boolean)
        )
      ).sort();

      setCountries(['all', ...uniqueCountries]);
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Erreur lors du chargement des utilisateurs');
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationHistory = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('admin_notifications')
        .select(`
          *,
          sender:sender_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotificationHistory(data || []);
    } catch (error) {
      console.error('Error loading notification history:', error);
      setError('Erreur lors du chargement de l\'historique des notifications');
      toast.error('Erreur lors du chargement de l\'historique des notifications');
    }
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    if (newSelectAll) {
      // Select all filtered users
      const filteredUserIds = filteredUsers.map(user => user.id);
      setSelectedUsers(filteredUserIds);
    } else {
      // Deselect all
      setSelectedUsers([]);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const validateMessage = (message: string): boolean => {
    return message.length >= 5 && message.length <= 1000;
  };

  const validateTitle = (title: string): boolean => {
    return title.length >= 3 && title.length <= 100;
  };

  const handleSendNotification = async () => {
    if (!validateTitle(notification.title)) {
      toast.error('Le titre doit contenir entre 3 et 100 caractères');
      return;
    }

    if (!validateMessage(notification.message)) {
      toast.error('Le message doit contenir entre 5 et 1000 caractères');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    try {
      setSendingNotification(true);
      setError(null);
      
      // Get current user (admin)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Create notifications for each selected user
      const notificationsToInsert = selectedUsers.map(userId => ({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: false
      }));

      // Insert notifications in batches of 100 to avoid payload size limits
      const batchSize = 100;
      for (let i = 0; i < notificationsToInsert.length; i += batchSize) {
        const batch = notificationsToInsert.slice(i, i + batchSize);
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(batch);

        if (notificationError) throw notificationError;
      }

      // Record this admin notification in history
      const { error: historyError } = await supabase
        .from('admin_notifications')
        .insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          sender_id: user.id,
          recipient_count: selectedUsers.length
        });

      if (historyError) throw historyError;

      toast.success(`Notification envoyée à ${selectedUsers.length} utilisateur(s)`);
      
      // Reset form
      setNotification({
        title: '',
        message: '',
        type: 'info'
      });
      setSelectedUsers([]);
      setSelectAll(false);
      
      // Reload notification history
      loadNotificationHistory();
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Erreur lors de l\'envoi de la notification');
      toast.error('Erreur lors de l\'envoi de la notification');
    } finally {
      setSendingNotification(false);
    }
  };

  // Filter users based on search term and country filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCountry = 
      countryFilter === 'all' || 
      user.location?.country === countryFilter;
    
    return matchesSearch && matchesCountry;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications Administrateur</h1>
        <button
          onClick={() => {
            loadUsers();
            loadNotificationHistory();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nouvelle notification */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-blue-600" />
          Envoyer une notification
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre <span className="text-xs text-gray-500">(3-100 caractères)</span>
            </label>
            <input
              type="text"
              value={notification.title}
              onChange={(e) => setNotification({ ...notification, title: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                notification.title && !validateTitle(notification.title) ? 'border-red-500' : ''
              }`}
              placeholder="Titre de la notification"
            />
            {notification.title && !validateTitle(notification.title) && (
              <p className="mt-1 text-sm text-red-600">Le titre doit contenir entre 3 et 100 caractères</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-xs text-gray-500">(5-1000 caractères)</span>
            </label>
            <textarea
              value={notification.message}
              onChange={(e) => setNotification({ ...notification, message: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                notification.message && !validateMessage(notification.message) ? 'border-red-500' : ''
              }`}
              rows={4}
              placeholder="Contenu de la notification"
            />
            {notification.message && !validateMessage(notification.message) && (
              <p className="mt-1 text-sm text-red-600">Le message doit contenir entre 5 et 1000 caractères</p>
            )}
            <div className="mt-1 text-xs text-gray-500 flex justify-end">
              {notification.message.length}/1000 caractères
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={notification.type}
              onChange={(e) => setNotification({ ...notification, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="info">Information</option>
              <option value="success">Succès</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sélection des destinataires */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          Sélectionner les destinataires
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les pays</option>
              {countries.filter(c => c !== 'all').map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="select-all"
              checked={selectAll}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
              Sélectionner tous les utilisateurs ({filteredUsers.length})
            </label>
          </div>
          
          <div className="text-sm text-gray-600">
            {selectedUsers.length} utilisateur(s) sélectionné(s)
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun utilisateur trouvé
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sélectionner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pays
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière activité
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {user.location?.country || 'Inconnu'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_active ? formatDate(user.last_active) : 'Jamais'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleSendNotification}
            disabled={
              sendingNotification || 
              selectedUsers.length === 0 || 
              !notification.title || 
              !notification.message ||
              !validateTitle(notification.title) ||
              !validateMessage(notification.message)
            }
            className={`
              flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${
                sendingNotification || 
                selectedUsers.length === 0 || 
                !notification.title || 
                !notification.message ||
                !validateTitle(notification.title) ||
                !validateMessage(notification.message)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }
            `}
          >
            {sendingNotification ? (
              <>
                <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="-ml-1 mr-2 h-4 w-4" />
                Envoyer la notification
              </>
            )}
          </button>
        </div>
      </div>

      {/* Historique des notifications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
          Historique des notifications
        </h2>
        
        <div className="space-y-4">
          {notificationHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune notification envoyée
            </div>
          ) : (
            notificationHistory.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    {getNotificationTypeIcon(item.type)}
                    <h3 className="text-lg font-medium ml-2">{item.title}</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{item.message}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    Envoyée par: {item.sender?.full_name || 'Administrateur'}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {item.recipient_count} destinataire(s)
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;