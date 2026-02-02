"use client";

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import { makeStore } from "@/lib/store";
import { theme } from "@/lib/theme";
import { setCities } from "@/lib/slices/citiesSlice";
import { CityCard } from "@/components/CityCard";
import type { CurrentWeatherResponse } from "@/types/weather";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockTrigger = jest.fn();
const defaultWeatherData = {
  name: "London",
  sys: { country: "GB" },
  main: { temp: 12, feels_like: 10 },
  weather: [{ description: "cloudy", icon: "02d" }],
  wind: { speed: 5 },
} as CurrentWeatherResponse;
const mockWeatherReturn: {
  data: CurrentWeatherResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: jest.Mock;
} = {
  data: defaultWeatherData,
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
};
jest.mock("@/lib/api/weatherApi", () => {
  const actual = jest.requireActual("@/lib/api/weatherApi") as object;
  return {
    ...actual,
    useGetCurrentWeatherQuery: () => mockWeatherReturn,
    useLazyGetCurrentWeatherQuery: () => [
      mockTrigger,
      { isFetching: false },
    ],
  };
});

function renderCityCard(cityKey: string) {
  const store = makeStore();
  store.dispatch(setCities([cityKey]));
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CityCard cityKey={cityKey} />
      </ThemeProvider>
    </Provider>
  );
}

describe("CityCard", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockTrigger.mockClear();
    mockWeatherReturn.data = defaultWeatherData;
    mockWeatherReturn.isLoading = false;
    mockWeatherReturn.isError = false;
  });

  it("renders city name and weather info", () => {
    renderCityCard("London,GB");
    expect(screen.getByRole("heading", { name: /london,gb/i })).toBeInTheDocument();
    expect(screen.getByText(/12°C/)).toBeInTheDocument();
    expect(screen.getByText(/cloudy/i)).toBeInTheDocument();
  });

  it("has update button", () => {
    renderCityCard("London,GB");
    expect(screen.getByTestId("city-card-refresh")).toBeInTheDocument();
  });

  it("navigates to detail on card click", async () => {
    const user = userEvent.setup();
    renderCityCard("London,GB");
    const card = screen.getByTestId("city-card");
    await user.click(card);
    expect(mockPush).toHaveBeenCalledWith("/cities/London%2CGB");
  });

  it("triggers refresh when update button clicked", async () => {
    const user = userEvent.setup();
    renderCityCard("London,GB");
    const updateBtn = screen.getByTestId("city-card-refresh");
    await user.click(updateBtn);
    expect(mockTrigger).toHaveBeenCalledWith({ city: "London", country: "GB" });
  });

  describe("when weather fails to load (error state)", () => {
    beforeEach(() => {
      mockWeatherReturn.data = undefined;
      mockWeatherReturn.isError = true;
    });

    it("shows Failed to load weather message", () => {
      renderCityCard("London,GB");
      expect(screen.getByText("Failed to load weather")).toBeInTheDocument();
    });

    it("still shows city name and update button", () => {
      renderCityCard("London,GB");
      expect(screen.getByRole("heading", { name: /london,gb/i })).toBeInTheDocument();
      expect(screen.getByTestId("city-card-refresh")).toBeInTheDocument();
    });

    it("navigates to detail on card click", async () => {
      const user = userEvent.setup();
      renderCityCard("London,GB");
      await user.click(screen.getByTestId("city-card"));
      expect(mockPush).toHaveBeenCalledWith("/cities/London%2CGB");
    });

    it("triggers refresh when update button clicked", async () => {
      const user = userEvent.setup();
      renderCityCard("London,GB");
      await user.click(screen.getByTestId("city-card-refresh"));
      expect(mockTrigger).toHaveBeenCalledWith({ city: "London", country: "GB" });
    });
  });
});
