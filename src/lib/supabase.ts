import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Network status tracking
let isOnline = navigator.onLine;
let lastNetworkCheck = Date.now();
const NETWORK_CHECK_INTERVAL = 30000; // 30 seconds

// Check network connectivity
const checkNetwork = async () => {
  try {
    const response = await fetch(supabaseUrl, {
      method: 'HEAD',
      cache: 'no-store'
    });
    isOnline = response.ok;
    lastNetworkCheck = Date.now();
    return isOnline;
  } catch {
    isOnline = false;
    lastNetworkCheck = Date.now();
    return false;
  }
};

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Test the connection with retries and better error handling
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const INITIAL_DELAY = 1000; // 1 second initial delay

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const testConnection = async (retryCount = 0) => {
  if (!navigator.onLine) {
    console.log('Browser is offline, waiting for connection...');
    return;
  }

  try {
    // Add initial delay to allow environment to fully initialize
    if (retryCount === 0) {
      await wait(INITIAL_DELAY);
    }

    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    console.log('Successfully connected to Supabase');
    localStorage.setItem('supabase_connection_status', 'connected');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to connect to Supabase (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, errorMessage);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection in ${RETRY_DELAY/1000} seconds...`);
      await wait(RETRY_DELAY);
      return testConnection(retryCount + 1);
    } else {
      console.error('Failed to establish connection after maximum retries. Please check your Supabase configuration and network connection.');
      localStorage.setItem('supabase_connection_status', 'disconnected');
    }
  }
};

// Initialize connection test but don't block application startup
testConnection().catch(console.error);

// Add a wrapper function for Supabase queries with retry logic
export const executeQuery = async (queryFn: () => Promise<any>, retries = 3): Promise<any> => {
  if (!navigator.onLine) {
    throw new Error('Network is offline');
  }

  try {
    return await queryFn();
  } catch (error) {
    if (retries > 0 && navigator.onLine) {
      console.log(`Query failed, retrying... (${retries} attempts remaining)`);
      await wait(RETRY_DELAY);
      return executeQuery(queryFn, retries - 1);
    }
    throw error;
  }
};

// Cache for IP address to prevent excessive function calls
const IP_CACHE_KEY = 'cached_ip_address';
const IP_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add network status monitoring with reconnection attempts
window.addEventListener('online', async () => {
  isOnline = true;
  console.log('Network connection restored, testing Supabase connection...');
  await testConnection();
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log('Network connection lost');
  localStorage.setItem('supabase_connection_status', 'disconnected');
});

// Export connection status check
export const getConnectionStatus = () => ({
  isOnline,
  isConnected: localStorage.getItem('supabase_connection_status') === 'connected',
  functionsAvailable: false, // Edge functions are not available in this environment
  lastCheck: lastNetworkCheck
});

// Export function to force connection check
export const checkConnection = async () => {
  const networkStatus = await checkNetwork();
  if (networkStatus) {
    await testConnection();
  }
  return getConnectionStatus();
};