import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

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
  // Add retries for better reliability
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to connect to Supabase (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, errorMessage);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection in ${RETRY_DELAY/1000} seconds...`);
      await wait(RETRY_DELAY);
      return testConnection(retryCount + 1);
    } else {
      console.error('Failed to establish connection after maximum retries. Please check your Supabase configuration and network connection.');
      // Don't throw error here - allow the application to continue even if initial connection test fails
    }
  }
};

// Initialize connection test but don't block application startup
testConnection().catch(console.error);

// Add a wrapper function for Supabase queries with retry logic
export const executeQuery = async (queryFn: () => Promise<any>, retries = 3): Promise<any> => {
  try {
    return await queryFn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Query failed, retrying... (${retries} attempts remaining)`);
      await wait(RETRY_DELAY);
      return executeQuery(queryFn, retries - 1);
    }
    throw error;
  }
};