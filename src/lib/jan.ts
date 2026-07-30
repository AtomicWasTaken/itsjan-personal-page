// Single source of truth for Jan's birthdate.
// Computed at SSR time so meta tags + initial age ticker are always current.

export const BIRTHDATE_ISO = "2007-05-30T00:00:00+02:00";

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

export const ageNow = (): number =>
  (Date.now() - new Date(BIRTHDATE_ISO).getTime()) / YEAR_MS;

export const ageYears = (): number => Math.floor(ageNow());
