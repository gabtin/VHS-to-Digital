import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

async function fetchUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function logout(): Promise<void> {
  window.location.href = "/api/logout";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return res.json();
    },
    onSuccess: (user: AuthUser) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.firstName || user.email}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/register", data);
      return res.json();
    },
    onSuccess: (user: AuthUser) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<AuthUser>) => {
      const res = await apiRequest("PATCH", "/api/auth/user", data);
      return res.json();
    },
    onSuccess: (updatedUser: AuthUser) => {
      queryClient.setQueryData(["/api/auth/user"], updatedUser);
      toast({
        title: "Profile updated",
        description: "Your information has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/auth/user");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      window.location.href = "/";
      toast({
        title: "Account deleted",
        description: "Your account and personal data have been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", { email });
      return res.json();
    },
    onSuccess: (data: { message: string }) => {
      toast({
        title: "Reset link sent",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/auth/reset-password", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password reset",
        description: "Your password has been updated successfully.",
      });
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await apiRequest("POST", "/api/auth/verify-email", { token });
      return res.json();
    },
    onSuccess: (data: { message: string }) => {
      toast({
        title: "Email verified",
        description: data.message,
      });
      // Optionally refetch user to update local state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/resend-verification");
      return res.json();
    },
    onSuccess: (data: { message: string }) => {
      toast({
        title: "Link sent",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to resend",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginMutation,
    registerMutation,
    updateProfileMutation,
    deleteAccountMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    verifyEmailMutation,
    resendVerificationMutation,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
