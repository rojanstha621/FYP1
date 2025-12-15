import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-lg font-semibold text-sky-600">
          BabyEase
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-slate-700 hover:text-sky-600 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-sky-500 text-white px-3 py-1 text-xs font-medium hover:bg-sky-600 transition"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-700 hover:text-sky-600 transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-sky-500 text-white px-3 py-1 text-xs font-medium hover:bg-sky-600 transition"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
