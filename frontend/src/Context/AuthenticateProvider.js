import { createContext, useContext, useEffect, useState } from "react";
import {
  deleteAllCookies,
  getCookie,
  reloadWindowToPath,
  setCookie,
} from "../Helpers/Utils";
import { useDispatch } from "react-redux";
import { loadingFalse, loadingTrue } from "../Reducer/loaderSlice";
import { toast } from "react-toastify";

const AuthContext = createContext();

function AuthenticateProvider({ children }) {
  const dispatch = useDispatch();

  const [isAuthenticated, setIsAuthenticated] = useState(!!getCookie("token"));
  const [role, setRole] = useState(getCookie("person") || null);

  const [userDetails, setUserDetails] = useState({});

  const logIn = (token, person) => {
    if (token) {
      localStorage.removeItem("filter");

      setCookie("token", token);
      setCookie("person", person);

      setIsAuthenticated(true);
      setRole(person); // ✅ IMPORTANT
    }
  };

  const logOut = async () => {
    dispatch(loadingTrue());

    setTimeout(() => {
      deleteAllCookies();

      setIsAuthenticated(false);
      setRole(null);

      reloadWindowToPath("/login");
      toast.success("Logout successful");

      dispatch(loadingFalse());
    }, 1000);
  };

  // ✅ This runs once when app loads
  useEffect(() => {
    const token = getCookie("token");
    const person = getCookie("person");

    setIsAuthenticated(!!token);
    setRole(person || null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        logIn,
        logOut,
        isAuthenticated,
        role,
        userDetails,
        setIsAuthenticated,
        setUserDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthenticateProvider;
export const useAuth = () => useContext(AuthContext);
