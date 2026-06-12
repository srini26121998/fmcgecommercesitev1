"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "vendor" | "guest";
  token: string;
  expiresAt: string; // ISO date string
}

export type SocialProvider = "google" | "apple" | "facebook";

export interface SocialProfile {
  provider: SocialProvider;
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  phoneNumber: string | null;
  user: UserProfile | null;
  /** Linked social accounts */
  linkedSocials: SocialProfile[];
  /** Guest session flag */
  isGuest: boolean;

  login: (user: UserProfile, phone?: string) => void;
  logout: () => void;
  hydrate: () => void;
  setUser: (user: UserProfile) => void;

  /** Guest login — create a temporary guest session */
  guestLogin: () => void;

  /** Social login — authenticate via a social provider */
  socialLogin: (provider: SocialProvider, data?: { name: string; email: string; avatar?: string }) => void;

  /** Link a social account to existing user */
  linkSocial: (profile: SocialProfile) => void;

  /** Unlink a social account */
  unlinkSocial: (provider: SocialProvider) => void;

  /** Convert guest session to a full user account */
  convertGuestToUser: (phone: string, name: string) => void;
}

function isTokenExpired(expiresAt: string): boolean {
  try {
    return new Date(expiresAt).getTime() < Date.now();
  } catch {
    return true;
  }
}

function generateUserId(): string {
  return "user_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
}

function generateToken(): string {
  return "mock_jwt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
}

function createExpiry(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

/** Mock social payloads (simulates OAuth response) */
const MOCK_SOCIAL_USERS: Record<SocialProvider, { name: string; email: string }> = {
  google: { name: "Alex G.", email: "alex.gmail@example.com" },
  apple: { name: "Alex A.", email: "alex.icloud@example.com" },
  facebook: { name: "Alex F.", email: "alex.fb@example.com" },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      phoneNumber: null,
      user: null,
      linkedSocials: [],
      isGuest: false,

      login: (user, phone) => {
        set({
          isLoggedIn: true,
          phoneNumber: phone ?? null,
          user,
          isGuest: false,
        });
      },

      logout: () =>
        set({
          isLoggedIn: false,
          phoneNumber: null,
          user: null,
          linkedSocials: [],
          isGuest: false,
        }),

      /** Rehydrate and validate token expiry on app startup */
      hydrate: () => {
        const { user } = get();
        if (user && isTokenExpired(user.expiresAt)) {
          set({
            isLoggedIn: false,
            phoneNumber: null,
            user: null,
            linkedSocials: [],
            isGuest: false,
          });
        }
      },

      setUser: (user) => set({ user, isLoggedIn: true, isGuest: false }),

      /** Guest login — creates a temporary session that expires in 24h */
      guestLogin: () => {
        const user: UserProfile = {
          id: "guest_" + Date.now(),
          name: "Guest",
          email: "guest@fmcgcommerce.com",
          role: "guest",
          token: generateToken(),
          expiresAt: createExpiry(1), // 24 hours
        };
        set({
          isLoggedIn: true,
          phoneNumber: null,
          user,
          isGuest: true,
          linkedSocials: [],
        });
      },

      /** Social login — OAuth flow for Google / Apple / Facebook */
      socialLogin: (provider, data) => {
        const mock = MOCK_SOCIAL_USERS[provider];
        const profileName = data?.name || mock.name;
        const profileEmail = data?.email || mock.email;

        const profile: SocialProfile = {
          provider,
          id: `${provider}_${Date.now()}`,
          name: profileName,
          email: profileEmail,
          avatar: data?.avatar,
        };

        const user: UserProfile = {
          id: generateUserId(),
          name: profileName,
          email: profileEmail,
          role: "user",
          token: generateToken(),
          expiresAt: createExpiry(30), // 30 days
        };

        set({
          isLoggedIn: true,
          phoneNumber: null,
          user,
          isGuest: false,
          linkedSocials: [profile],
        });
      },

      /** Link a social account */
      linkSocial: (profile) =>
        set((state) => ({
          linkedSocials: [
            ...state.linkedSocials.filter((s) => s.provider !== profile.provider),
            profile,
          ],
        })),

      /** Unlink a social account */
      unlinkSocial: (provider) =>
        set((state) => ({
          linkedSocials: state.linkedSocials.filter((s) => s.provider !== provider),
        })),

      /** Convert guest to full user */
      convertGuestToUser: (phone, name) => {
        const { user: currentUser } = get();
        if (!currentUser || currentUser.role !== "guest") return;

        const user: UserProfile = {
          ...currentUser,
          name,
          role: "user",
          expiresAt: createExpiry(30),
        };
        set({
          user,
          isGuest: false,
          phoneNumber: phone,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

/** Auto-hydrate the store (validate token expiry) on initial module load */
if (typeof window !== "undefined") {
  useAuthStore.getState().hydrate();
}