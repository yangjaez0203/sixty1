import { create } from "zustand";
import { signInWithGoogle, signOut } from "@/services/auth";
import { getToken, removeToken, saveToken } from "@/utils/storage";

// TODO: 백엔드 연동 시 user 상태 추가 (GET /me 응답)
type AuthState = {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkToken: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isLoading: true,

  login: async () => {
    const idToken = await signInWithGoogle();
    await saveToken(idToken);
    set({ isLoggedIn: true });
  },

  logout: async () => {
    await signOut();
    await removeToken();
    set({ isLoggedIn: false });
  },

  // TODO: 백엔드 연동 시 토큰으로 GET /me 호출 → 성공하면 user 설정, 401이면 토큰 삭제
  checkToken: async () => {
    const token = await getToken();
    set({ isLoggedIn: !!token, isLoading: false });
  },
}));
