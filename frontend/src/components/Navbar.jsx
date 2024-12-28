import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-white text-lg font-semibold">
              NSUT File Sharing
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-gray-300">
              <span className="font-medium">{user?.email}</span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-gray-400">{user?.course} - {user?.branch}</span>
            </div>
            
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
