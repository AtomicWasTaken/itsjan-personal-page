// Single source of truth for Jan's birthdate.
// Computed at SSR time so meta tags + initial age ticker are always current.

export const BIRTHDATE_ISO = "2007-05-30T00:00:00+02:00";

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

export const ageNow = (): number =>
  (Date.now() - new Date(BIRTHDATE_ISO).getTime()) / YEAR_MS;

export const ageYears = (): number => Math.floor(ageNow());

// "a" vs "an" — pick based on the spoken sound of the leading number.
// Numbers that start with a vowel sound: 8, 11, 18, and 80–89.
export const aOrAn = (n: number): string => {
  if (n === 8 || n === 11 || n === 18) return "an";
  if (n >= 80 && n <= 89) return "an";
  return "a";
};
