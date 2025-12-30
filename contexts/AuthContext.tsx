import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { trpc, setAuthToken } from "@/lib/trpc";

type User = {
  userId: string;
  email: string;
  name: string;
  isPremium: boolean;
  storiesGenerated: number;
  isAdmin: boolean;
  subscriptionEndDate?: string;
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: false,
    retry: false,
  });

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log('Loading user with token:', token ? 'exists' : 'none');
      if (token) {
        setAuthToken(token);
        const userData = await meQuery.refetch();
        console.log('User data fetched:', userData.data ? 'success' : 'failed');
        if (userData.data) {
          setUser(userData.data);
        }
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      const token = data.token || data.userId;
      await AsyncStorage.setItem("authToken", token);
      setAuthToken(token);
      setUser(data);
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async (data) => {
      const token = data.token || data.userId;
      await AsyncStorage.setItem("authToken", token);
      setAuthToken(token);
      setUser(data);
    },
    onError: (error) => {
      console.error('Register error:', error);
    },
  });

  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    setAuthToken("");
    setUser(null);
  };

  const upgradeToPremium = trpc.auth.upgrade.useMutation({
    onSuccess: () => {
      loadUser();
    },
  });

  const cancelSubscription = trpc.auth.cancelSubscription.useMutation({
    onSuccess: () => {
      loadUser();
    },
  });

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      loadUser();
    },
  });

  const changePassword = trpc.auth.changePassword.useMutation();

  const canGenerateStory = () => {
    if (!user) return false;
    return user.isPremium || user.storiesGenerated < 3;
  };

  const remainingFreeStories = () => {
    if (!user || user.isPremium) return null;
    return Math.max(0, 3 - user.storiesGenerated);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    upgradeToPremium: upgradeToPremium.mutateAsync,
    cancelSubscription: cancelSubscription.mutateAsync,
    updateProfile: updateProfile.mutateAsync,
    changePassword: changePassword.mutateAsync,
    canGenerateStory,
    remainingFreeStories,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
  };
});
