import { NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/client";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("responsable")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { message: "Database error. Please check your configuration." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, data.password);
    if (!valid) {
      console.warn(`Login failed for ${email}: Incorrect password`);
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log(`Login successful for ${email} (ID: ${data.id})`);
    createSessionCookie({
      sub: String(data.id),
      email: data.email,
      name: data.name
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Login route error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unexpected error logging in";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}


