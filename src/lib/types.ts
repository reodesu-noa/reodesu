export interface Shift {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  break_min: number;
  created_at: string;
}

export type NewShift = Pick<Shift, "date" | "start_time" | "end_time" | "break_min">;

export type TaxType = "kou" | "otsu" | "flat";

export interface Settings {
  user_id: string;
  wage: number;
  night_rate: number; // % e.g. 25 = 25%
  enrolled_shakai_hoken: boolean;
  health_ins_rate: number; // % e.g. 9.98
  pension_rate: number; // % e.g. 18.3
  over40: boolean;
  enrolled_koyou: boolean;
  koyou_rate: number; // % e.g. 0.6
  tax_type: TaxType;
  dependents: number;
  tax_override: number | null;
  updated_at: string;
}

export const DEFAULT_SETTINGS: Omit<Settings, "user_id" | "updated_at"> = {
  wage: 1100,
  night_rate: 25,
  enrolled_shakai_hoken: false,
  health_ins_rate: 9.98,
  pension_rate: 18.3,
  over40: false,
  enrolled_koyou: true,
  koyou_rate: 0.6,
  tax_type: "kou",
  dependents: 0,
  tax_override: null,
};
