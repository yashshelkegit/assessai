import { createContext, useContext, useState, useEffect } from 'react';

const ADMIN_CREDENTIALS = {
  "YCCE": { username: "admin_ycce", password: "ycce123" },
  "VNIT": { username: "admin_vnit", password: "vnit123" },
  "RCOEM": { username: "admin_rcoem", password: "rcoem123" },
  "GHRCE": { username: "admin_ghrce", password: "ghrce123" }
};

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAdminAuth = () => {
      const adminData = localStorage.getItem('adminData');
      if (adminData) {
        setAdmin(JSON.parse(adminData));
      }
      setLoading(false);
    };

    initializeAdminAuth();
  }, []);

  const loginAdmin = (credentials) => {
    const { username, password, college } = credentials;
    const adminCred = ADMIN_CREDENTIALS[college];

    if (!adminCred || adminCred.username !== username || adminCred.password !== password) {
      throw new Error('Invalid admin credentials');
    }

    const adminData = {
      username,
      college,
      role: 'admin'
    };

    localStorage.setItem('adminData', JSON.stringify(adminData));
    setAdmin(adminData);
    return adminData;
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminData');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ 
      admin, 
      loading,
      loginAdmin,
      logoutAdmin
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);