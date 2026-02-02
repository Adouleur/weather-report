"use client";

import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import { CityList } from "@/components/CityList";
import { makeStore } from "@/lib/store";
import { theme } from "@/lib/theme";
import { setCities } from "@/lib/slices/citiesSlice";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/lib/api/weatherApi", () => {
  const actual = jest.requireActual("@/lib/api/weatherApi") as object;
  const mockWeatherData = {
    data: {
      name: "London",
      sys: { country: "GB" },
      main: { temp: 12, feels_like: 10 },
      weather: [{ description: "cloudy", icon: "02d" }],
      wind: { speed: 5 },
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  };
  return {
    ...actual,
    useGetCurrentWeatherQuery: () => mockWeatherData,
    useLazyGetCurrentWeatherQuery: () => [jest.fn(), { isFetching: false }],
    useLazySearchCityQuery: () => [jest.fn(), { data: undefined, isFetching: false }],
  };
});

function renderWithStore(ui: ReactElement, store = makeStore()) {
  return {
    ...render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>{ui}</ThemeProvider>
      </Provider>
    ),
    store,
  };
}

describe("CityList", () => {
  it("renders header and add city button", () => {
    renderWithStore(<CityList />);
    expect(screen.getByRole("heading", { name: /weather/i })).toBeInTheDocument();
    const addButtons = screen.getAllByRole("button", { name: /add city/i });
    expect(addButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows default cities when storage was empty", async () => {
    renderWithStore(<CityList />);
    expect(await screen.findByText("London,GB")).toBeInTheDocument();
  });

  it("renders city cards when cities are in store", () => {
    const store = makeStore();
    store.dispatch(setCities(["London,GB"]));
    renderWithStore(<CityList />, store);
    expect(screen.getByText("London,GB")).toBeInTheDocument();
  });
});
