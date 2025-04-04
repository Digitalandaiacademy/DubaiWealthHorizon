import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const fetchWithTimeout = async (url: string, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Supabase Edge Function',
        'Accept': 'application/json'
      }
    });
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

serve(async (req) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const services = [
      "https://api.ipify.org?format=json",
      "https://api.my-ip.io/ip.json",
      "https://api64.ipify.org?format=json"
    ];
    
    let ip = "Unknown";
    let success = false;
    let errors = [];
    
    // Try each service with exponential backoff
    for (let attempt = 0; attempt < 3; attempt++) {
      const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
      
      for (const service of services) {
        try {
          console.log(`Attempting to fetch IP from ${service} (attempt ${attempt + 1})`);
          
          const response = await fetchWithTimeout(service, 10000); // Increased timeout to 10s
          const data = await response.json();
          ip = data.ip || data.ipAddress;
          
          if (!ip) {
            throw new Error('No IP address in response');
          }
          
          success = true;
          console.log(`Successfully retrieved IP ${ip} from ${service}`);
          
          return new Response(
            JSON.stringify({ 
              ip, 
              success: true,
              source: service,
              timestamp: new Date().toISOString()
            }),
            {
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=300", // Cache for 5 minutes
              },
              status: 200,
            }
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Failed to fetch from ${service}:`, errorMessage);
          errors.push(`${service}: ${errorMessage}`);
          
          if (attempt < 2) {
            console.log(`Waiting ${backoffDelay}ms before next attempt...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          }
        }
      }
    }
    
    console.error("All IP services failed:", errors);
    return new Response(
      JSON.stringify({
        ip: "Unknown",
        success: false,
        errors: errors,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        status: 503, // Service Unavailable
      }
    );
  } catch (error) {
    console.error("Critical error in get-ip function:", error);
    return new Response(
      JSON.stringify({
        ip: "Unknown",
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});