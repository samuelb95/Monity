import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          💰 Monity
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-100">
                Tableau de bord
              </Link>
              <Link to="/accounts" className="hover:text-blue-100">
                Comptes
              </Link>
              <div className="border-l border-blue-400 pl-6">
                <span className="text-sm">Bienvenue, {user?.username}</span>
                <button
                  onClick={handleLogout}
                  className="block mt-1 text-sm hover:text-blue-100"
                >
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-100">
                Connexion
              </Link>
              <Link 
                to="/register" 
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 font-bold"
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};