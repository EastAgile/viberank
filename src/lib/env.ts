// Client-side environment variables
export const clientEnv = {
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL!,
} as const;

// Server-side environment variables (only available in server components/API routes)
// No authentication needed - removed all auth-related variables
export const serverEnv = {
  // Add any server-side environment variables here if needed
} as const;

// Environment variable validation for server-side
export function validateServerEnv() {
  // Auth is optional, so we don't validate those variables
  const requiredEnvVars: string[] = [
    // Only add truly required variables here
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file.'
    );
  }
}