import { create } from "zustand";
import { login as loginApi, listAccounts, type LoginUser } from "../api/Auth";
import { getToken, setToken, clearToken } from "../api/client";
import type { UserRole } from "../constants/UserRole";
import { UserRoleText } from "../constants/UserRole";

interface AuthState {
  user: LoginUser | null;
  token: string;
  accounts: Array<{ login: string; name: string; role: UserRole }>;
  ready: boolean;
  hydrate: () => Promise<void>;
  loginAs: (loginName: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  roleText: () => string;
}

const USER_KEY = "relic-restore-user";

const persistUser = (user: LoginUser | null) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: getToken(),
  accounts: [],
  ready: false,

  async hydrate() {
    try {
      const accounts = await listAccounts();
      const storedUser = localStorage.getItem(USER_KEY);
      set({
        accounts,
        user: storedUser ? (JSON.parse(storedUser) as LoginUser) : null,
        ready: true
      });
    } catch {
      set({ ready: true });
    }
  },

  async loginAs(loginName) {
    const { token, user } = await loginApi(loginName);
    setToken(token);
    persistUser(user);
    set({ user, token });
  },

  logout() {
    clearToken();
    persistUser(null);
    set({ user: null, token: "" });
  },

  hasRole: (...roles) => {
    const role = get().user?.role;
    return Boolean(role && roles.includes(role));
  },

  roleText: () => (get().user ? UserRoleText[get().user!.role] : "未登录")
}));
