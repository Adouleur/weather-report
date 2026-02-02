import citiesReducer, {
  addCity,
  removeCity,
  setCities,
  hydrateFromStorage,
} from "@/lib/slices/citiesSlice";

const STORAGE_KEY = "weather-report-cities";

function mockStorage(initial: string[] = []) {
  let store: string[] = [...initial];
  return {
    getItem: (key: string) =>
      key === STORAGE_KEY ? JSON.stringify(store) : null,
    setItem: (key: string, value: string) => {
      if (key === STORAGE_KEY) store = JSON.parse(value);
    },
    clear: () => {
      store = [];
    },
    get store() {
      return store;
    },
  };
}

describe("citiesSlice", () => {
  beforeEach(() => {
    Object.defineProperty(global, "localStorage", {
      value: mockStorage(),
      writable: true,
    });
  });

  it("has initial state as empty when storage is empty", () => {
    const state = citiesReducer(undefined, { type: "unknown" });
    expect(state).toEqual([]);
  });

  it("addCity adds a city and persists to storage", () => {
    const state = citiesReducer([], addCity("London"));
    expect(state).toEqual(["London"]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(["London"]));
  });

  it("addCity normalizes and deduplicates", () => {
    let state = citiesReducer([], addCity("  Paris  "));
    expect(state).toEqual(["Paris"]);
    state = citiesReducer(state, addCity("Paris"));
    expect(state).toEqual(["Paris"]);
    state = citiesReducer(state, addCity("paris"));
    expect(state).toEqual(["Paris"]);
  });

  it("removeCity removes and persists", () => {
    const state = citiesReducer(["London", "Paris"], removeCity("London"));
    expect(state).toEqual(["Paris"]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(["Paris"]));
  });

  it("setCities replaces list and persists", () => {
    const state = citiesReducer(
      ["A"],
      setCities(["Berlin", "Madrid"])
    );
    expect(state).toEqual(["Berlin", "Madrid"]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(
      JSON.stringify(["Berlin", "Madrid"])
    );
  });

  it("hydrateFromStorage loads from storage", () => {
    (localStorage as unknown as ReturnType<typeof mockStorage>).setItem(
      STORAGE_KEY,
      JSON.stringify(["Tokyo", "Osaka"])
    );
    const state = citiesReducer(["London"], hydrateFromStorage());
    expect(state).toEqual(["Tokyo", "Osaka"]);
  });
});
