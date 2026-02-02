"use client";

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/lib/theme";
import { WeatherErrorState } from "@/components/WeatherErrorState";

function renderWeatherErrorState(props: Parameters<typeof WeatherErrorState>[0]) {
  return render(
    <ThemeProvider theme={theme}>
      <WeatherErrorState {...props} />
    </ThemeProvider>
  );
}

describe("WeatherErrorState", () => {
  it("renders the error message", () => {
    renderWeatherErrorState({ message: "Failed to load weather" });
    expect(screen.getByText("Failed to load weather")).toBeInTheDocument();
  });

  it("renders optional subtitle", () => {
    renderWeatherErrorState({
      message: "Something went wrong",
      subtitle: "Please try again later.",
    });
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Please try again later.")).toBeInTheDocument();
  });

  it("shows Back button when onBack is provided", async () => {
    const onBack = jest.fn();
    renderWeatherErrorState({
      message: "Error",
      onBack,
    });
    const backBtn = screen.getByTestId("weather-error-back");
    expect(backBtn).toBeInTheDocument();
    await userEvent.setup().click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows Retry button when onRetry is provided", async () => {
    const onRetry = jest.fn();
    renderWeatherErrorState({
      message: "Error",
      onRetry,
    });
    const retryBtn = screen.getByTestId("weather-error-retry");
    expect(retryBtn).toBeInTheDocument();
    await userEvent.setup().click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("disables Retry button when retrying is true", () => {
    renderWeatherErrorState({
      message: "Error",
      onRetry: jest.fn(),
      retrying: true,
    });
    expect(screen.getByTestId("weather-error-retry")).toBeDisabled();
    expect(screen.getByText("Retrying…")).toBeInTheDocument();
  });

  it("does not show Back or Retry when callbacks are not provided", () => {
    renderWeatherErrorState({ message: "Error" });
    expect(screen.queryByTestId("weather-error-back")).not.toBeInTheDocument();
    expect(screen.queryByTestId("weather-error-retry")).not.toBeInTheDocument();
  });

  it("uses default data-testid when not provided", () => {
    renderWeatherErrorState({ message: "Error" });
    expect(screen.getByTestId("weather-error-state")).toBeInTheDocument();
  });

  it("uses custom data-testid when provided", () => {
    renderWeatherErrorState({
      message: "Error",
      "data-testid": "city-detail-weather-error",
    });
    expect(screen.getByTestId("city-detail-weather-error")).toBeInTheDocument();
  });
});
