import { getAuth, signOut } from 'firebase/auth';

const { createContext, useState } = require('react');

const AuthContext = createContext({
  user: {},
  setMyUser: () => {},
  isLoggedIn: false,
  setLoggedInHandler: () => {},
  logoutHandler: () => {},
});

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const setLoggedInHandler = () => {
    console.log('setLoggedInHandler');
    setIsLoggedIn(true);
  };

  const setMyUser = (user) => {
    setUser(user);
  };

  const logoutHandler = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setIsLoggedIn(false);
        alert('Successfully Logged Out.');
      })
      .catch((error) => {
        console.log('signout err:', error);
      });
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, setLoggedInHandler, setMyUser, logoutHandler }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };
