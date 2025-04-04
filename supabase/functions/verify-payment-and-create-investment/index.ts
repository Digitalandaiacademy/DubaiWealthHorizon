import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info",
  "Access-Control-Max-Age": "86400",
};

interface PaymentVerificationRequest {
  payment_id: string;
  transaction_id: string;
  user_id: string;
  plan_id: string;
  amount: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // Use 204 for OPTIONS requests
      headers: corsHeaders,
    });
  }

  try {
    // Validate request method
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { payment_id, transaction_id, user_id, plan_id, amount }: PaymentVerificationRequest = await req.json();

    // Validate required fields
    if (!payment_id || !transaction_id || !user_id || !plan_id || !amount) {
      throw new Error("Missing required fields");
    }

    // Call the SQL function using RPC
    const { data, error } = await supabase.rpc(
      'verify_payment_and_create_investment',
      {
        p_payment_id: payment_id,
        p_transaction_id: transaction_id,
        p_user_id: user_id,
        p_plan_id: plan_id,
        p_amount: amount
      }
    );

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Function error:", error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: error.message === "Method not allowed" ? 405 : 400,
      }
    );
  }
});