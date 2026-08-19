"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { NewShift, Shift } from "@/lib/types";
import { YearMonth, monthRange } from "@/lib/date";

export function useShifts(userId: string | null, month: YearMonth) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { start, end } = monthRange(month);
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .gte("date", start)
      .lt("date", end)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setShifts(data ?? []);
    }
    setLoading(false);
  }, [userId, month]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial/month-change data fetch
    refresh();
  }, [refresh]);

  const addShift = useCallback(
    async (shift: NewShift) => {
      if (!userId) return;
      const { error } = await supabase.from("shifts").insert({ ...shift, user_id: userId });
      if (error) {
        setError(error.message);
        return false;
      }
      await refresh();
      return true;
    },
    [userId, refresh]
  );

  const addShifts = useCallback(
    async (newShifts: NewShift[]) => {
      if (!userId || newShifts.length === 0) return false;
      const { error } = await supabase
        .from("shifts")
        .insert(newShifts.map((s) => ({ ...s, user_id: userId })));
      if (error) {
        setError(error.message);
        return false;
      }
      await refresh();
      return true;
    },
    [userId, refresh]
  );

  const deleteShift = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("shifts").delete().eq("id", id);
      if (error) {
        setError(error.message);
        return false;
      }
      setShifts((prev) => prev.filter((s) => s.id !== id));
      return true;
    },
    []
  );

  return { shifts, loading, error, refresh, addShift, addShifts, deleteShift };
}
