import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  transaction_id?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendNotification: (userId: string, title: string, message: string, type: string) => Promise<void>;
  sendBulkNotifications: (userIds: string[], title: string, message: string, type: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  loadNotifications: async () => {
    try {
      set({ loading: true });
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No authenticated user found for loading notifications');
        set({ notifications: [], unreadCount: 0, loading: false });
        return;
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notifications = data || [];
      const unreadCount = notifications.filter(n => !n.read).length;

      set({ notifications, unreadCount });
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      await get().loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      await get().loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  sendNotification: async (userId: string, title: string, message: string, type: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          read: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },

  sendBulkNotifications: async (userIds: string[], title: string, message: string, type: string) => {
    try {
      if (userIds.length === 0) return;
      
      // Create notifications for each user
      const notifications = userIds.map(userId => ({
        user_id: userId,
        title,
        message,
        type,
        read: false
      }));
      
      // Insert in batches to avoid payload size limits
      const batchSize = 100;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        const { error } = await supabase
          .from('notifications')
          .insert(batch);
          
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }
}));