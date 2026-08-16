"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/LoginScreen";
import { AppShell } from "@/components/AppShell";

function Gate() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted">
        読み込み中…
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AppShell />;
}

export default function Home() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
