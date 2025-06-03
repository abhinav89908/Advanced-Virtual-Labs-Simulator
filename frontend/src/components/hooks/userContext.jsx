import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing user data
    const storedUser = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (storedUser && isLoggedIn) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
      }
    }
    
    setIsLoading(false);
  }, []);

  const logout = () => {
    // Clear user data from state
    setUser(null);

    console.log('Logging out user:', user);
    
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token'); // In case you're using a token
    
    // Log the logout action for debugging
    console.log('User logged out successfully');
  };

  // Helper functions to check user status
  const isAdmin = user && user.role === 'admin';
  const isLoggedIn = !!user; // Convert user to boolean - true if user exists, false otherwise

  return (
    <UserContext.Provider value={{ user, setUser, logout, isAdmin, isLoading, isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};