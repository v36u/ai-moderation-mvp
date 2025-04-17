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

export type ModerateSuccessfulResponse = {
  success: true;
  data: [ModerateResponseSuccessfulDataItem[]];
};

export type ModerateErrorResponse = {
  success: false;
  error: string;
};

export type ModerateResponse =
  | ModerateSuccessfulResponse
  | ModerateErrorResponse;
