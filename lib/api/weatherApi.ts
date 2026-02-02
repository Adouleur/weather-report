import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import type {
  CurrentWeatherResponse,
  ForecastResponse,
  GeocodingResult,
} from "@/types/weather";

const OPENWEATHER_BASE = "https://api.openweathermap.org";

export const weatherApi = createApi({
  reducerPath: "weatherApi",
  baseQuery: fetchBaseQuery({
    baseUrl: OPENWEATHER_BASE,
  }),
  tagTypes: ["Weather", "Forecast"],
  endpoints: (builder) => ({
    getCurrentWeather: builder.query<
      CurrentWeatherResponse,
      { city: string; country?: string }
    >({
      query: ({ city, country }) => {
        const q = country ? `${city},${country}` : city;
        return {
          url: "/data/2.5/weather",
          params: {
            q,
            appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
            units: "metric",
          },
        };
      },
      providesTags: (_result, _error, { city, country }) => [
        { type: "Weather", id: `${city}-${country ?? ""}` },
      ],
    }),
    getForecast: builder.query<
      ForecastResponse,
      { city: string; country?: string }
    >({
      query: ({ city, country }) => {
        const q = country ? `${city},${country}` : city;
        return {
          url: "/data/2.5/forecast",
          params: {
            q,
            appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
            units: "metric",
          },
        };
      },
      providesTags: (_result, _error, { city, country }) => [
        { type: "Forecast", id: `${city}-${country ?? ""}` },
      ],
    }),
    searchCity: builder.query<GeocodingResult[], string>({
      query: (query) => ({
        url: "/geo/1.0/direct",
        params: {
          q: query,
          limit: 5,
          appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
        },
      }),
    }),
  }),
});

export const {
  useGetCurrentWeatherQuery,
  useLazyGetCurrentWeatherQuery,
  useGetForecastQuery,
  useLazyGetForecastQuery,
  useLazySearchCityQuery,
} = weatherApi;
