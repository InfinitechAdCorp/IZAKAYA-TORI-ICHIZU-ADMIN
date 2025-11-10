import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  name: string
  email: string
  role?: string
  token?: string
  [key: string]: any
}

interface AuthState {
  isLoggedIn: boolean
  user: User | null
  token: string | null
  login: (user: User) => void
  logout: () => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      token: null,

      login: (user: User) => {
        const token = user.token || ""
        
        set({
          isLoggedIn: true,
          user,
          token,
        })

        // Store in localStorage and cookies as backup
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token)
          localStorage.setItem("user_data", JSON.stringify(user))
          
          // ✅ CHANGED: Cookie expires in 365 days (1 year) instead of 1 day
          const oneYearInSeconds = 365 * 24 * 60 * 60 // 31,536,000 seconds
          document.cookie = `auth_token=${token}; path=/; max-age=${oneYearInSeconds}; SameSite=Lax`
        }
      },

      logout: () => {
        set({
          isLoggedIn: false,
          user: null,
          token: null,
        })

        // Clear all storage
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_data")
          document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }
      },

      initializeAuth: () => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("auth_token")
          const userDataStr = localStorage.getItem("user_data")

          if (token && userDataStr) {
            try {
              const user = JSON.parse(userDataStr)
              set({
                isLoggedIn: true,
                user: { ...user, token },
                token,
              })
              console.log("✅ Auth restored from storage")
            } catch (error) {
              console.error("❌ Failed to parse stored user data:", error)
              set({ isLoggedIn: false, user: null, token: null })
            }
          }
        }
      },
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
