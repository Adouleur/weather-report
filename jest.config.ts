import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/__tests__/utils/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@mui/icons-material/(.*)$": "<rootDir>/__mocks__/@mui/icons-material/$1.js",
  },
};

export default createJestConfig(config);
