import { NextResponse } from "next/server";

/**
 * Google OAuth Route - Placeholder
 * 
 * This route will be implemented when setting up Passport.js authentication.
 * 
 * For now, it redirects to a placeholder page.
 * Later, this will:
 * 1. Initialize Passport Google OAuth strategy
 * 2. Redirect to Google OAuth consent screen
 * 3. Handle callback at /api/auth/google/callback
 * 
 * Environment variables needed (already set in .env.local):
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - SESSION_SECRET
 */

export async function GET() {
  // TODO: Implement Google OAuth with Passport.js
  // For now, redirect to dashboard as placeholder
  // When implemented, this will redirect to Google OAuth consent screen
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    return NextResponse.json(
      { error: "Google OAuth not configured. Please set GOOGLE_CLIENT_ID in .env.local" },
      { status: 500 }
    );
  }

  // Placeholder: Redirect to dashboard for now
  // When Passport is set up, this will be:
  // return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  return NextResponse.redirect(new URL("/auth/google", backendUrl));
}

