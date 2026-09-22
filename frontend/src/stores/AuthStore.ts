import { create } from "zustand";
import { login as loginApi } from "../api/Auth";
import { tokenStorage } from "../api/http";
import type { AuthUser, RoleName } from "../types/Auth";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  is: (...roles: RoleName[]) => boolean;
  hydrate: () => void;
}

/** 从 JWT 负载恢复展示身份（不落库用户信息，重启后仍需重新登录换取新令牌） */
const readTokenUser = (token: string): AuthUser | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.sub,
      username: payload.username,
      display_name: payload.display_name ?? payload.username,
      role: payload.role
    };
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  ready: false,

  async login(username, password) {
    const { token, user } = await loginApi(username, password);
    tokenStorage.set(token);
    set({ token, user });
  },

  logout() {
    tokenStorage.clear();
    set({ user: null, token: null });
  },

  is(...roles) {
    const user = get().user;
    return !!user && roles.includes(user.role);
  },

  hydrate() {
    const token = tokenStorage.get();
    if (token) {
      const user = readTokenUser(token);
      if (user) {
        set({ token, user, ready: true });
        return;
      }
      tokenStorage.clear();
    }
    set({ token: null, user: null, ready: true });
  }
}));
