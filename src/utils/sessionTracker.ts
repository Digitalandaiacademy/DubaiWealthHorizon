import { supabase } from './supabaseClient';
import UAParser from 'ua-parser-js';

interface SessionData {
  user_id: string;
  device_info: {
    browser: string;
    os: string;
    device: string;
  };
  location: {
    country: string;
    city: string;
  };
  is_online: boolean;
  session_start: string;
  last_active: string;
}

class SessionTracker {
  private static instance: SessionTracker;
  private sessionId: string | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private parser: UAParser;

  private constructor() {
    this.parser = new UAParser();
  }

  public static getInstance(): SessionTracker {
    if (!SessionTracker.instance) {
      SessionTracker.instance = new SessionTracker();
    }
    return SessionTracker.instance;
  }

  public async startTracking(userId: string) {
    if (this.sessionId) return;

    const deviceInfo = this.getDeviceInfo();
    const location = await this.getLocation();
    
    const sessionData: SessionData = {
      user_id: userId,
      device_info: deviceInfo,
      location: location,
      is_online: true,
      session_start: new Date().toISOString(),
      last_active: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_sessions')
      .insert([sessionData])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la session:', error);
      return;
    }

    this.sessionId = data.id;
    this.startHeartbeat();

    // Gérer la fermeture de la page
    window.addEventListener('beforeunload', this.handleUnload);
  }

  private getDeviceInfo() {
    const result = this.parser.getResult();
    return {
      browser: `${result.browser.name} ${result.browser.version}`,
      os: `${result.os.name} ${result.os.version}`,
      device: result.device.type || 'desktop'
    };
  }

  private async getLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la localisation:', error);
      return {
        country: 'Inconnu',
        city: 'Inconnu'
      };
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(async () => {
      if (!this.sessionId) return;

      await supabase
        .from('user_sessions')
        .update({
          last_active: new Date().toISOString(),
          is_online: true
        })
        .eq('id', this.sessionId);
    }, 30000); // Toutes les 30 secondes
  }

  private handleUnload = async () => {
    if (!this.sessionId) return;

    // Marquer la session comme hors ligne
    await supabase
      .from('user_sessions')
      .update({
        is_online: false,
        last_active: new Date().toISOString()
      })
      .eq('id', this.sessionId);
  }

  public async stopTracking() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.sessionId) {
      await this.handleUnload();
      this.sessionId = null;
    }

    window.removeEventListener('beforeunload', this.handleUnload);
  }
}

export const sessionTracker = SessionTracker.getInstance();
