"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAppSelector } from "@/lib/hooks/useAppSelector";
import { useAppDispatch } from "@/lib/hooks/useAppDispatch";
import { hydrateFromStorage } from "@/lib/slices/citiesSlice";
import { CityCard } from "@/components/CityCard";
import { AddCityDialog } from "@/components/AddCityDialog";
import styles from "./CityList.module.scss";

export function CityList() {
  const cities = useAppSelector((s) => s.cities);
  const dispatch = useAppDispatch();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    dispatch(hydrateFromStorage());
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setHasHydrated(true);
  }, [dispatch]);

  return (
    <Box className={styles.root}>
      <header className={styles.header}>
        <Typography variant="h5" component="h1">
          Weather
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add city
        </Button>
      </header>
      {!hasHydrated ? (
        <Box className={styles.loaderWrap}>
          <CircularProgress size={48} />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Loading your cities…
          </Typography>
        </Box>
      ) : cities.length === 0 ? (
        <Box className={styles.empty}>
          <Typography variant="body1" color="text.secondary">
            No cities yet. Add one to see the weather.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add city
          </Button>
        </Box>
      ) : (
        <ul className={styles.list}>
          {cities.map((cityKey) => (
            <li key={cityKey} className={styles.listItem}>
              <CityCard cityKey={cityKey} />
            </li>
          ))}
        </ul>
      )}
      <AddCityDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
    </Box>
  );
}
