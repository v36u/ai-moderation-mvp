import { ApiResponse, ApiSuccessfulResponse } from "./api";
import { Result as AutocannonResult } from "autocannon";

// BEFOREPROD: Install an i18n framework and use actual translations
export const moderateLabelMappings = {
  S: "Sexual",
  H: "Hate",
  V: "Violence",
  HR: "Harassment",
  SH: "Self-Harm",
  S3: "Sexual/Minors",
  H2: "Hate/Threatening",
  V2: "Violence/Graphic",
  OK: "Not Offensive",
} as const; // `as const` freezes the object

export type ModerateLabel = keyof typeof moderateLabelMappings;

export type ModerateResponseSuccessfulDataItem = {
  label: ModerateLabel;
  score: number;
};

export type ModerateData = [ModerateResponseSuccessfulDataItem[]];

export type ModerateRequest = {
  userQuery: string;
};

export type ModerateSuccessfulResponse = ApiSuccessfulResponse<ModerateData>;

export type ModerateResponse = ApiResponse<ModerateData>;

export type ModerateLoadTestRequest = {
  totalRequests: number;
  concurrentRequests: number;
  queryPool: string[];
};

export type ModerateLoadTestSuccessfulResponse =
  ApiSuccessfulResponse<AutocannonResult>;

export type ModerateLoadTestResponse = ApiResponse<AutocannonResult>;

export const defaultTotalRequests = 100;
export const maxTotalRequests = 1_000_000;
export const maxConcurrentRequests = 100;
export const defaultConcurrentRequests = 4;
export const defaultQuery =
  "I enjoyed a peaceful walk in the park today and the weather was perfect.";
