import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useAuth0 } from "@auth0/auth0-react";
import AuthService from "../../services/auth.service";
import backgroundImg from "../../assets/background.jpg";



const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oidcLoading, setOidcLoading] = useState(false);
  const navigate = useNavigate();

  // Auth0 hooks
  const { loginWithRedirect, logout: auth0Logout, isAuthenticated, getIdTokenClaims } = useAuth0();

  /**
   * After Auth0 redirects back to the app with a successful OIDC login,
   * exchange the ID token for the app's own JWT.
   */
  useEffect(() => {
    const exchangeToken = async () => {
      if (isAuthenticated && !AuthService.getCurrentUser()) {
        setOidcLoading(true);
        setError("");
        try {
          const claims = await getIdTokenClaims();
          const idToken = claims.__raw; // The actual signed JWT string
          
          const data = await AuthService.oidcSignIn(idToken);
          const roles = Array.isArray(data.roles) ? data.roles : [];

          if (roles.includes("ROLE_ADMIN")) {
            navigate("/admin/dashboard");
          } else if (roles.includes("ROLE_EMPLOYEE")) {
            navigate("/employee/floor-plan");
          } else {
            navigate("/dashboard");
          }
        } catch (err) {
          console.error("Auth0 Token Exchange Error:", err);
          setError("Auth0 login succeeded but account setup failed. Please try again.");
          // Clear the Auth0 session so user can retry
          auth0Logout({ logoutParams: { returnTo: window.location.origin } });
        } finally {
          setOidcLoading(false);
        }
      }
    };
    exchangeToken();
  }, [isAuthenticated, getIdTokenClaims]);

  // Local email + password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await AuthService.login(email, password);
      const roles = Array.isArray(data.roles) ? data.roles : (data.roles || []);
      if (roles.includes("ROLE_ADMIN")) {
        navigate("/admin/dashboard");
      } else if (roles.includes("ROLE_EMPLOYEE")) {
        navigate("/employee/floor-plan");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const resMessage =
        (err.response && err.response.data && err.response.data.message) ||
        "Login failed. Invalid credentials.";
      setError(resMessage);
      setLoading(false);
    }
  };

  // Trigger Google Login via Auth0
  const handleGoogleLogin = () => {
    setError("");
    loginWithRedirect({
      authorizationParams: {
        connection: 'google-oauth2'
      }
    });
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(to right,      #eff6ff  0%, #eff6ff 50%, #0f1d45 50%, #0f1d45 100%)",
      }}
    >
      <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full border-[40px] border-blue-300/40"></div>
      <div className="absolute top-[15%] left-[5%] w-[180px] h-[180px] rounded-full bg-blue-300/30"></div>
      <div className="absolute bottom-[-60px] right-[-60px] w-[250px] h-[250px] rounded-full border-[35px] border-indigo-300/30"></div>
      <div className="absolute bottom-[10%] left-[15%] w-[80px] h-[80px] rounded-full bg-blue-300/20"></div>
      <div className="absolute top-[40%] right-[3%] w-[100px] h-[100px] rounded-full bg-indigo-300/25"></div>

      <div className="relative z-10 flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Left illustration */}
        <div className="relative w-1/2 min-h-[600px] hidden md:block">
          <img
            src={backgroundImg}
            alt="Book Fair Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(29,78,216,0.45) 40%, rgba(30,64,175,0.15) 70%, transparent 100%)",
            }}
          ></div>
          <div className="relative z-10 flex flex-col justify-center h-full p-10 text-white">
            <h2 className="text-4xl font-extrabold leading-tight mb-12 drop-shadow-lg">
              Welcome to the
              <br />
              Book Fair 2026
            </h2>
            <p className="text-base font-bold text-blue-100 max-w-xs leading-relaxed">
              One platform for publishers! <br />Book stalls, manage payments, and secure your presence at CIBF 2026.
            </p>
          </div>
        </div>

        {/* Right: form panel */}
        <div className="flex items-center justify-center w-full md:w-1/2 p-8">
          <div className="w-full max-w-sm space-y-6">

            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight">
                Colombo International
                <br />
                <span className="text-blue-600">Book Fair 2026</span>
              </h1>
              <div className="mt-4 w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
            </div>

            {/* ── Local: email + password form ──────────────────────── */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="input-email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    id="input-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 text-gray-500 hover:text-blue-600 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded border border-red-200">
                  {error}
                </div>
              )}

              <button
                id="btn-local-login"
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center w-full border-t border-gray-200 mt-6 mb-6">
              <span className="absolute px-3 bg-white text-gray-500 text-sm">
                OR
              </span>
            </div>

            {/* ── Social Logins ────────────────────── */}
            <div className="space-y-3">
              <button
                id="btn-google-login"
                type="button"
                onClick={handleGoogleLogin}
                disabled={oidcLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 font-bold hover:bg-gray-50 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FcGoogle size={20} />
                {oidcLoading ? "Setting up..." : "Continue with Google"}
              </button>
            </div>

            {/* Sign-up link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Create a new account
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;