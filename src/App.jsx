import { useEffect, useState } from 'react';
import { api, getUser, tokens } from './api';
import Login from './Login';
import Products from './Products';
import './App.css';

export default function App() {
  const [user, setUser] = useState(() => (tokens.access ? getUser() : null));

  async function handleLogout() {
    await api.logout();
    setUser(null);
  }

  useEffect(() => {
    const expire = () => setUser(null);
    window.addEventListener('session-expired', expire);
    return () => window.removeEventListener('session-expired', expire);
  }, []);

  return (
    <>
      <nav className="navbar">
        <span className="brand">Activity 6</span>

        {user && (
          <>
            <div className="nav-links">
              <span className="active">Products</span>
            </div>
            <div className="nav-user">
              <span>Logged in as <strong>{user.username}</strong></span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </>
        )}
      </nav>

      <main className="container">
        {user ? (
          <>
            <div className="hero">
              <h1>Welcome, {user.username}!</h1>
              <p>Add, edit, and remove products from your inventory.</p>
            </div>
            <Products />
          </>
        ) : (
          <Login onLogin={setUser} />
        )}
      </main>
    </>
  );
}