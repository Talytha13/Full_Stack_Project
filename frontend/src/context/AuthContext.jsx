import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  // user = { email, role, name }

  const login = (email, password) => {
    const role = email === "admin@auction.com" ? "admin" : "bidder";
    const fakeUser = { email, role, name: email.split("@")[0] };
    setUser(fakeUser);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
