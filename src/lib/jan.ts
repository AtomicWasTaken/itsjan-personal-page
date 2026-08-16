// Single source of truth for Jan's birthdate.
// Computed at SSR time so meta tags + initial age ticker are always current.

export const BIRTHDATE_ISO = "2007-05-30T00:00:00+02:00";

const [birthYear, birthMonth, birthDay] = BIRTHDATE_ISO.slice(0, 10)
  .split("-")
  .map(Number);
const localDateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "numeric",
  month: "numeric",
  timeZone: "Europe/Berlin",
  year: "numeric",
});

export const ageYears = (now = new Date()): number => {
  const parts = Object.fromEntries(
    localDateFormatter
      .formatToParts(now)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  let age = parts.year - birthYear;
  const beforeBirthday =
    parts.month < birthMonth ||
    (parts.month === birthMonth && parts.day < birthDay);

  if (beforeBirthday) age -= 1;
  return age;
};
