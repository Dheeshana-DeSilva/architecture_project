/**
 * Auth0 OIDC Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Replace the placeholder values below with the actual credentials from your
 * Auth0 application.
 *
 * How to get these values:
 *  1. Sign up at https://auth0.com/
 *  2. Create a new "Single Page Web Application"
 *  3. Set Allowed Callback URLs: http://localhost:5173
 *  4. Set Allowed Logout URLs:   http://localhost:5173
 *  5. Set Allowed Web Origins:   http://localhost:5173
 *  6. Copy the Domain and Client ID below.
 */
const auth0Config = {
  // Your Auth0 tenant domain (e.g. dev-xxxx.us.auth0.com)
  domain: "YOUR_AUTH0_DOMAIN",

  // Client ID from your Auth0 application settings
  clientId: "YOUR_AUTH0_CLIENT_ID",

  authorizationParams: {
    // Where to redirect after login
    redirect_uri: "http://localhost:5173",
    // We want access to the user's profile and email
    scope: "openid profile email"
  },

  // Keep the user logged in using browser cache (optional)
  cacheLocation: "localstorage"
};

export default auth0Config;
