"use client";

import { Box, Paper, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styles from "./WeatherErrorState.module.scss";

export interface WeatherErrorStateProps {
  /** Main error message shown to the user */
  message: string;
  /** Optional secondary text (e.g. hint to retry) */
  subtitle?: string;
  /** Called when the user clicks Back. If provided, a Back button is shown */
  onBack?: () => void;
  /** Called when the user clicks Retry. If provided, a Retry button is shown */
  onRetry?: () => void;
  /** Whether a retry is in progress (disables Retry button) */
  retrying?: boolean;
  /** Optional test id for the container */
  "data-testid"?: string;
}

export function WeatherErrorState({
  message,
  subtitle,
  onBack,
  onRetry,
  retrying = false,
  "data-testid": testId = "weather-error-state",
}: WeatherErrorStateProps) {
  return (
    <Box
      className={styles.root}
      data-testid={testId}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        gap: 2,
      }}
    >
      <Paper className={styles.paper} elevation={1}>
        <ErrorOutlineIcon className={styles.icon} color="error" />
        <Typography variant="h6" component="p" color="error" gutterBottom>
          {message}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        <Box className={styles.actions}>
          {onBack && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              variant="contained"
              data-testid="weather-error-back"
            >
              Back
            </Button>
          )}
          {onRetry && (
            <Button
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              variant="outlined"
              disabled={retrying}
              data-testid="weather-error-retry"
            >
              {retrying ? "Retrying…" : "Retry"}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
