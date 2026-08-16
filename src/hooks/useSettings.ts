"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_SETTINGS, Settings } from "@/lib/types";

export function useSettings(userId: string | null) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else if (data) {
      setSettings(data as Settings);
    } else {
      setSettings({
        ...DEFAULT_SETTINGS,
        user_id: userId,
        updated_at: new Date().toISOString(),
      });
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on user change
    refresh();
  }, [refresh]);

  const saveSettings = useCallback(
    async (next: Settings) => {
      if (!userId) return false;
      const payload = { ...next, user_id: userId, updated_at: new Date().toISOString() };
      const { data, error } = await supabase
        .from("settings")
        .upsert(payload)
        .select()
        .single();
      if (error) {
        setError(error.message);
        return false;
      }
      setSettings(data as Settings);
      return true;
    },
    [userId]
  );

  return { settings, loading, error, refresh, saveSettings };
}
