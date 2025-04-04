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
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const services = [
      { url: "https://ipapi.co/json/", handler: (data: any) => ({
        country: data.country_name,
        city: data.city,
        region: data.region,
        ip: data.ip,
      })},
      { url: "https://ipwho.is/", handler: (data: any) => ({
        country: data.country,
        city: data.city,
        region: data.region,
        ip: data.ip,
      })},
    ];
    
    let errors = [];
    
    for (let attempt = 0; attempt < 3; attempt++) {
      for (const service of services) {
        try {
          const response = await fetchWithTimeout(service.url);
          if (response.ok) {
            const data = await response.json();
            const locationData = service.handler(data);
            
            console.log(`Successfully retrieved location from ${service.url}`);
            return new Response(
              JSON.stringify({
                country: locationData.country || "Unknown",
                city: locationData.city || "Unknown",
                region: locationData.region || "Unknown",
                ip: locationData.ip || "Unknown",
                success: true,
              }),
              {
                headers: {
                  ...corsHeaders,
                  "Content-Type": "application/json",
                  "Cache-Control": "public, max-age=3600",
                },
                status: 200,
              }
            );
          }
        } catch (serviceError) {
          errors.push(`${service.url}: ${serviceError.message}`);
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }
    }
    
    console.error("All location services failed:", errors);
    return new Response(
      JSON.stringify({
        country: "Unknown",
        city: "Unknown",
        region: "Unknown",
        ip: "Unknown",
        success: false,
        errors: errors,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Critical error in get-location function:", error);
    return new Response(
      JSON.stringify({
        country: "Unknown",
        city: "Unknown",
        region: "Unknown",
        ip: "Unknown",
        success: false,
        error: "Internal server error",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  }
});