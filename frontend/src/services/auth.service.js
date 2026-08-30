
import api from "./api";

const register = (name, email, password, role, contactNumber, businessName) => {
  return api.post("/auth/signup", {
    name,
    email,
    password,
    role,
    contactNumber,
    businessName,
  });
};

const login = (email, password) => {
  return api
    .post("/auth/signin", {
      email,
      password,
    })
    .then((response) => {
      if (response.data.token) {
        // Save user data + token in browser storage
        localStorage.setItem("user", JSON.stringify(response.data));
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    });
};

/**
 * Exchange an Auth0 OIDC access token for the app's own JWT.
 * The backend validates the Auth0 token via JWKS, auto-provisions
 * the user if needed, then returns a JwtResponse identical to local login.
 */
const oidcSignIn = (accessToken) => {
  return api
    .post("/auth/oidc-signin", { accessToken })
    .then((response) => {
      if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
        localStorage.setItem("token", response.data.token);
        // Notify header/components of user update
        window.dispatchEvent(new Event("user-updated"));
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const AuthService = {
  register,
  login,
  oidcSignIn,
  logout,
  getCurrentUser,
};

export default AuthService;