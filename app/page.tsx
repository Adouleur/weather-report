"use client";

import { CityList } from "@/components/CityList";
import { useAppSelector } from "@/lib/hooks/useAppSelector";
import { weatherApi } from "@/lib/api/weatherApi";
import { useEffect } from "react";

export default function Home() {
  const cities = useAppSelector((s) => s.cities);
  const [triggerCurrent] = weatherApi.useLazyGetCurrentWeatherQuery();

  useEffect(() => {
    cities.forEach((cityKey) => {
      const parts = cityKey.split(",").map((s) => s.trim());
      const city = parts[0];
      const country = parts.length >= 2 ? parts.slice(1).join(",") : undefined;
      triggerCurrent({ city, country });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <CityList />;
}
