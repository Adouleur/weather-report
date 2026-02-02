"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import { useLazySearchCityQuery } from "@/lib/api/weatherApi";
import { useLazyGetCurrentWeatherQuery } from "@/lib/api/weatherApi";
import { useAppDispatch } from "@/lib/hooks/useAppDispatch";
import { useAppSelector } from "@/lib/hooks/useAppSelector";
import { addCity } from "@/lib/slices/citiesSlice";
import { MAX_CITIES } from "@/lib/constants";
import type { GeocodingResult } from "@/types/weather";
import styles from "./AddCityDialog.module.scss";

interface AddCityDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddCityDialog({ open, onClose }: AddCityDialogProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[] | null>(null);
  const [searchTrigger, { isFetching: searching }] = useLazySearchCityQuery();
  const [fetchWeather] = useLazyGetCurrentWeatherQuery();
  const dispatch = useAppDispatch();
  const cities = useAppSelector((s) => s.cities);

  const handleSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    searchTrigger(q).then((result) => {
      setSuggestions(result.data ?? null);
    });
  }, [query, searchTrigger]);

  const handleSelectCity = useCallback(
    async (name: string, country: string) => {
      if (cities.length >= MAX_CITIES) {
        return;
      }
      try {
        const result = await fetchWeather({ city: name, country }).unwrap();
        const displayKey = `${result.name},${result.sys.country}`;
        dispatch(addCity(displayKey));
        setSuggestions(null);
        setQuery("");
        onClose();
      } catch {
        const cityKey = `${name},${country}`;
        dispatch(addCity(cityKey));
        setSuggestions(null);
        setQuery("");
        onClose();
      }
    },
    [cities.length, fetchWeather, dispatch, onClose]
  );

  const handleClose = useCallback(() => {
    setQuery("");
    setSuggestions(null);
    onClose();
  }, [onClose]);

  const alreadyAdded = (name: string, country: string) =>
    cities.some(
      (c) => c.toLowerCase() === `${name},${country}`.toLowerCase()
    );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableScrollLock
    >
      <DialogTitle>Add city</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        {cities.length >= MAX_CITIES && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You have reached the maximum of {MAX_CITIES} cities. Please remove
            some cities to add new ones.
          </Alert>
        )}
        <div className={styles.searchRow}>
          <TextField
            label="City name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            fullWidth
            size="small"
            placeholder="e.g. London, Paris"
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!query.trim() || searching}
          >
            {searching ? <CircularProgress size={24} /> : "Search"}
          </Button>
        </div>
        {suggestions && suggestions.length === 0 && query.trim() && (
          <Typography variant="body2" color="text.secondary">
            No cities found. Try another name.
          </Typography>
        )}
        {suggestions && suggestions.length > 0 && (
          <List dense className={styles.list}>
            {suggestions.map((loc, index) => {
              const added = alreadyAdded(loc.name, loc.country);
              const atLimit = cities.length >= MAX_CITIES;
              return (
                <ListItemButton
                  key={`${loc.name}-${loc.country}-${loc.lat}-${loc.lon}-${index}`}
                  onClick={() =>
                    !added && !atLimit && handleSelectCity(loc.name, loc.country)
                  }
                  disabled={added || atLimit}
                >
                  <ListItemText
                    primary={`${loc.name}, ${loc.country}${loc.state ? ` (${loc.state})` : ""}`}
                    secondary={
                      added
                        ? "Already added"
                        : atLimit
                          ? "Remove a city to add more"
                          : undefined
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
