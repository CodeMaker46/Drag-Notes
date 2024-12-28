import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Folder from './components/Folder';
import Profile from './components/Profile';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <nav className="bg-gray-800 text-gray-300 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Drag-Notes</Link>
          {user && (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="hover:text-white">Profile</Link>
              <button onClick={logout} className="hover:text-white">Logout</button>
            </div>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Folder /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
