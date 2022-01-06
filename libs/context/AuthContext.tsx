/* eslint-disable react-hooks/exhaustive-deps */
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import dayjs from "dayjs";
import { User } from "type";
import jwtDecode from "jwt-decode";
import { useRouter } from "next/router";
import * as userApi from "../apis/user";
import * as authApi from "../apis/auth";
import axiosFetcher from "libs/utils/axiosFetcher";

interface AuthContextType {
  user?: User;
  loading: boolean;
  error?: any;
  fetcher: typeof axiosFetcher;
  logout: () => void;
  login: (
    username: string,
    password: string,
    rememberMe: boolean
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  const { pathname, push } = useRouter();

  useEffect(() => {
    const refresh = window ? localStorage.getItem("refreshToken") || "" : "";
    const exp = window ? localStorage.getItem("refreshExpiration") || 0 : 0;
    if (!isTokenExpire(exp))
      refreshToken(refresh).then(() => setLoadingInitial(false));
    else setLoadingInitial(false);
  }, []);

  useEffect(() => {
    const refresh = localStorage.getItem("refreshToken");
    if (error) setError(null);
    if (loading) setLoading(false);
    if (pathname === "/login" && refresh) push("/");
    if (pathname !== "/login" && !refresh)
      push("/login?redirect=" + pathname);
  }, [pathname]);

  async function refreshToken(refresh: string) {
    return authApi
      .refresh(refresh, token)
      .then(({ accessToken }) => {
        setToken(accessToken);
        userApi
          .getCurrentUser(accessToken)
          .then((user) => setUser(user))
          .catch((err) => setError(err));
      })
      .catch((_error) => {
        window.localStorage.clear();
        push("/login?loggedOut=true");
      });
  }

  async function fetcher<T = unknown>(
    url: string,
    options = {}
  ): Promise<T> {
    if (!loadingInitial) {
      const refresh = localStorage.getItem("refreshToken") || "";
      const refreshExp = localStorage.getItem("refreshExpiration") || 0;
      const tokenExp = jwtDecode<any>(token) || 0;
      if (!isTokenExpire(refreshExp)) {
        if (isTokenExpire(tokenExp))
          return refreshToken(refresh).then(() =>
            axiosFetcher(url, { ...options, token })
          );
        else return axiosFetcher(url, { ...options, token });
      } else {
        setUser(undefined);
        push("/login?loggedOut=true");
        return Promise.reject("Refresh Token Expired")
      }
    }
    return Promise.reject({});
  }

  async function login(username: string, password: string, rememberMe = false) {
    setLoading(true);
    return await authApi
      .login({ username, password, rememberMe })
      .then(async ({ accessToken, refreshToken }) => {
        setToken(accessToken);
        const expires = jwtDecode<any>(refreshToken).exp;
        rememberMe &&
          window &&
          localStorage.setItem("refreshToken", refreshToken),
          localStorage.setItem("refreshExpiration", expires);
        await userApi.getCurrentUser(accessToken).then(setUser);
        return { success: true };
      })
      .catch((error) => {
        setError(error);
        return { success: false, error };
      })
      .finally(() => setLoading(false));
  }

  async function logout() {
    await authApi
      .logout(token)
      .then(() => {
        setUser(undefined);
        window && window.localStorage.clear();
        push("/login");
      })
      .catch((error) => setError(error));
  }

  function isTokenExpire(exp: string | number) {
    return +exp - dayjs().unix() < 30;
  }

  const memoedValue = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      fetcher,
      logout,
    }),
    [user, loading, error]
  );

  return (
    <AuthContext.Provider value={memoedValue}>
      {!loadingInitial && children}
    </AuthContext.Provider>
  );
}
