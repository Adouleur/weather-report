"use client";

import type { MouseEvent } from "react";
import { Card, CardContent, Typography, IconButton, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useRouter } from "next/navigation";
import { useGetCurrentWeatherQuery, useLazyGetCurrentWeatherQuery } from "@/lib/api/weatherApi";
import { useAppDispatch } from "@/lib/hooks/useAppDispatch";
import { removeCity } from "@/lib/slices/citiesSlice";
import type { CurrentWeatherResponse } from "@/types/weather";
import styles from "./CityCard.module.scss";

function formatCityQuery(cityKey: string): { city: string; country?: string } {
  const parts = cityKey.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    return { city: parts[0], country: parts.slice(1).join(",") };
  }
  return { city: cityKey };
}

interface CityCardProps {
  cityKey: string;
}

export function CityCard({ cityKey }: CityCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { city, country } = formatCityQuery(cityKey);
  const { data, isLoading, isError } = useGetCurrentWeatherQuery(
    { city, country },
    { skip: !city }
  );
  const [triggerRefresh, { isFetching }] = useLazyGetCurrentWeatherQuery();

  const handleCardClick = () => {
    const encoded = encodeURIComponent(cityKey);
    router.push(`/cities/${encoded}`);
  };

  const handleRefresh = (e: MouseEvent) => {
    e.stopPropagation();
    triggerRefresh({ city, country });
  };

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation();
    dispatch(removeCity(cityKey));
  };

  const refreshing = isFetching;

  return (
    <Card
      className={styles.card}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      data-testid="city-card"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <CardContent className={styles.content}>
        <div className={styles.header}>
          <Typography variant="h6" component="h2" className={styles.title}>
            {cityKey}
          </Typography>
          <IconButton
            size="small"
            onClick={handleRemove}
            aria-label={`Remove ${cityKey}`}
            className={styles.removeBtn}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </div>
        {isLoading && (
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        )}
        {isError && (
          <Typography variant="body2" color="error">
            Failed to load weather
          </Typography>
        )}
        {data && <WeatherBrief data={data} />}
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
          className={styles.updateNow}
          data-testid="city-card-refresh"
        >
          {refreshing ? "Updating…" : "Update now"}
        </Button>
      </CardContent>
    </Card>
  );
}

function WeatherBrief({ data }: { data: CurrentWeatherResponse }) {
  const temp = Math.round(data.main.temp);
  const rawDesc = data.weather[0]?.description ?? "";
  const desc = rawDesc ? rawDesc.charAt(0).toUpperCase() + rawDesc.slice(1) : "";
  const icon = data.weather[0]?.icon;

  return (
    <div className={styles.weatherBrief}>
      <div className={styles.tempRow}>
        <Typography variant="h4" component="p">
          {temp}°C
        </Typography>
        {icon && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt=""
            width={56}
            height={56}
            className={styles.icon}
          />
        )}
      </div>
      <Typography variant="body2" color="text.secondary">
        {desc}
      </Typography>
    </div>
  );
}
