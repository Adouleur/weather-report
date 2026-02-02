import { createSlice } from "@reduxjs/toolkit";
import { STORAGE_KEY_CITIES, MAX_CITIES, DEFAULT_CITIES } from "@/lib/constants";

function loadCitiesFromStorage(): { cities: string[]; keyExisted: boolean } {
  if (typeof window === "undefined") return { cities: [], keyExisted: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CITIES);
    if (raw === null) return { cities: [], keyExisted: false };
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return { cities: [], keyExisted: true };
    const cities = parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_CITIES);
    return { cities, keyExisted: true };
  } catch {
    return { cities: [], keyExisted: true };
  }
}

function saveCitiesToStorage(cities: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CITIES, JSON.stringify(cities));
  } catch {
  }
}

const initialState: string[] = [];

const citiesSlice = createSlice({
  name: "cities",
  initialState,
  reducers: {
    addCity: (state, action: { payload: string }) => {
      const normalized = action.payload.trim();
      if (!normalized) return;
      const exists = state.some(
        (c) => c.toLowerCase() === normalized.toLowerCase()
      );
      if (exists) return;
      const next = [...state, normalized].slice(-MAX_CITIES);
      saveCitiesToStorage(next);
      return next;
    },
    removeCity: (state, action: { payload: string }) => {
      const normalized = action.payload.trim();
      const next = state.filter(
        (c) => c.toLowerCase() !== normalized.toLowerCase()
      );
      saveCitiesToStorage(next);
      return next;
    },
    setCities: (_, action: { payload: string[] }) => {
      const next = action.payload.slice(0, MAX_CITIES);
      saveCitiesToStorage(next);
      return next;
    },
    hydrateFromStorage: (state) => {
      const { cities: stored, keyExisted } = loadCitiesFromStorage();
      const next = keyExisted ? stored : DEFAULT_CITIES;
      if (!keyExisted && next.length > 0) {
        saveCitiesToStorage(next);
      }
      if (next.length !== state.length || next.some((s, i) => s !== state[i])) {
        return next;
      }
      return state;
    },
  },
});

export const { addCity, removeCity, setCities, hydrateFromStorage } =
  citiesSlice.actions;
export default citiesSlice.reducer;
