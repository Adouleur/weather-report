# Weather Report

SPA that displays the weather in selected cities, built with Next.js, RTK Query, and Material UI.

## Features

- **City cards** – Brief weather info per city; click a card to open the detail page
- **Update weather** – “Update now” button on each card to refresh that city’s data
- **Add/remove cities** – Search and add cities; remove via the delete icon on each card
- **LocalStorage** – City list is saved; on reload, the list is restored and weather is refreshed
- **Detail page** – Full weather and hourly temperature chart for the current day (5-day/3-hour forecast)

## Tech Stack

- **Next.js** (App Router)
- **RTK Query** for weather API and state
- **Redux Toolkit** (cities slice + LocalStorage)
- **Material UI** + **SCSS** (mobile-friendly layout)
- **Jest** + **Testing Library** for tests
- **ESLint** + **Prettier**

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **API key**

   Get a free key at [OpenWeatherMap](https://openweathermap.org/api).

   Copy `.env.example` to `.env.local` and set:

   ```env
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
   ```

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` – Development server
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run lint` – ESLint
- `npm run test` – Jest
- `npm run format` – Prettier

## Tests

Core logic and components are covered by Jest + Testing Library:

- **citiesSlice** – add/remove/hydrate and LocalStorage
- **CityList** – header, empty state, city cards
- **CityCard** – weather display, update button, navigation, refresh

Run tests:

```bash
npm run test
```


