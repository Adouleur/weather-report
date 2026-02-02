"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  useGetCurrentWeatherQuery,
  useGetForecastQuery,
  useLazyGetCurrentWeatherQuery,
  useLazyGetForecastQuery,
} from "@/lib/api/weatherApi";
import { WeatherErrorState } from "@/components/WeatherErrorState";
import type { ForecastListItem } from "@/types/weather";
import styles from "./page.module.scss";

function parseCityParam(name: string | string[]): string {
  const raw = Array.isArray(name) ? name[0] : name;
  return raw ? decodeURIComponent(raw) : "";
}

function formatCityQuery(cityKey: string): { city: string; country?: string } {
  const parts = cityKey.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    return { city: parts[0], country: parts.slice(1).join(",") };
  }
  return { city: cityKey };
}

function getNext24hForecastItems(list: ForecastListItem[]): ForecastListItem[] {
  return [...list]
    .slice(0, 8)
    .sort((a, b) => a.dt - b.dt);
}

function formatTimeInCity(dt: number, timezoneSeconds: number): string {
  const utcMs = dt * 1000;
  const localMs = utcMs + timezoneSeconds * 1000;
  const d = new Date(localMs);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function TemperatureChart({
  items,
  timezoneSeconds = 0,
}: {
  items: ForecastListItem[];
  timezoneSeconds?: number;
}) {
  const { min, max, normalized } = useMemo(() => {
    if (items.length === 0) {
      return { min: 0, max: 0, normalized: [] as { temp: number; label: string; pct: number }[] };
    }
    const temps = items.map((i) => i.main.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const range = max - min || 1;
    const normalized = items.map((item) => ({
      temp: item.main.temp,
      label: formatTimeInCity(item.dt, timezoneSeconds),
      pct: ((item.main.temp - min) / range) * 100,
    }));
    return { min, max, normalized };
  }, [items, timezoneSeconds]);

  if (items.length === 0) return null;

  return (
    <Paper className={styles.chartPaper} elevation={1}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Temperature — next 24 hours (°C)
      </Typography>
      <div className={styles.chartContainer}>
        <div className={styles.chartBars}>
          {normalized.map((item, i) => (
            <div key={i} className={styles.chartBarWrap}>
              <span className={styles.chartTemp}>{Math.round(item.temp)}°</span>
              <div className={styles.chartBarArea}>
                <div
                  className={styles.chartBar}
                  style={{ height: `${item.pct}%` }}
                  title={`${item.label}: ${item.temp.toFixed(1)}°C`}
                />
              </div>
              <span className={styles.chartLabel}>{item.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.chartLegend}>
          <span>Min: {min.toFixed(0)}°C</span>
          <span>Max: {max.toFixed(0)}°C</span>
        </div>
      </div>
    </Paper>
  );
}

export default function CityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cityKey = parseCityParam(params.name ?? "");
  const { city, country } = formatCityQuery(cityKey);

  const {
    data: weather,
    isLoading: weatherLoading,
    isError: weatherError,
  } = useGetCurrentWeatherQuery(
    { city, country },
    { skip: !city }
  );

  const {
    data: forecast,
    isLoading: forecastLoading,
  } = useGetForecastQuery(
    { city, country },
    { skip: !city }
  );

  const [triggerWeather, { isFetching: weatherFetching }] =
    useLazyGetCurrentWeatherQuery();
  const [triggerForecast, { isFetching: forecastFetching }] =
    useLazyGetForecastQuery();

  const chartItems = useMemo(
    () => (forecast?.list ? getNext24hForecastItems(forecast.list) : []),
    [forecast]
  );
  const cityTimezone = forecast?.city?.timezone ?? 0;

  const handleBack = () => router.push("/");
  const handleRefresh = () => {
    triggerWeather({ city, country });
    triggerForecast({ city, country });
  };

  const refreshing = weatherFetching || forecastFetching;

  if (!city) {
    return (
      <Box className={styles.root}>
        <Typography color="error">Invalid city</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back
        </Button>
      </Box>
    );
  }

  if (weatherLoading && !weather) {
    return (
      <Box className={styles.root} sx={{ justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress size={48} />
          <Typography color="text.secondary">Loading weather…</Typography>
        </Box>
      </Box>
    );
  }

  if (weatherError || !weather) {
    return (
      <Box className={styles.root}>
        <WeatherErrorState
          message="Failed to load weather"
          subtitle="Check your connection or try again later."
          onBack={handleBack}
          onRetry={handleRefresh}
          retrying={refreshing}
          data-testid="city-detail-weather-error"
        />
      </Box>
    );
  }

  const icon = weather.weather[0]?.icon;

  return (
    <Box className={styles.root}>
      <header className={styles.header}>
        <IconButton onClick={handleBack} aria-label="Back to list">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          {weather.name}, {weather.sys.country}
        </Typography>
        <IconButton
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refresh weather"
        >
          <RefreshIcon />
        </IconButton>
      </header>

      <Paper className={styles.mainCard} elevation={1}>
        <div className={styles.currentRow}>
          <div>
            <Typography variant="h3" component="p">
              {Math.round(weather.main.temp)}°C
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {weather.weather[0]?.description
                ? weather.weather[0].description.charAt(0).toUpperCase() +
                  weather.weather[0].description.slice(1)
                : ""}
            </Typography>
          </div>
          {icon && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
              alt=""
              width={80}
              height={80}
            />
          )}
        </div>
        <dl className={styles.details}>
          <div>
            <dt>Feels like</dt>
            <dd>{Math.round(weather.main.feels_like)}°C</dd>
          </div>
          <div>
            <dt>Humidity</dt>
            <dd>{weather.main.humidity}%</dd>
          </div>
          <div>
            <dt>Pressure</dt>
            <dd>{weather.main.pressure} hPa</dd>
          </div>
          <div>
            <dt>Wind</dt>
            <dd>{weather.wind.speed} m/s</dd>
          </div>
        </dl>
      </Paper>

      {forecastLoading && !forecast ? (
        <CircularProgress className={styles.chartLoader} />
      ) : (
        <TemperatureChart items={chartItems} timezoneSeconds={cityTimezone} />
      )}

      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={handleRefresh}
        disabled={refreshing}
        className={styles.refreshBtn}
      >
        {refreshing ? "Updating…" : "Update weather now"}
      </Button>
    </Box>
  );
}
