export const SITE_ORIGIN = "https://itsjan.dev";
export const SITE_NAME = "itsjan.dev";
export const PERSON_NAME = "Jan-Marlon Leibl";
export const CONTACT_EMAIL = "hi@itsjan.dev";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;
export const PROFILE_IMAGE_URL = `${SITE_ORIGIN}/jan-profile.jpg`;
export const OPEN_GRAPH_IMAGE_URL = `${SITE_ORIGIN}/og.png`;
export const SOURCE_REPOSITORY_URL =
  "https://github.com/AtomicWasTaken/itsjan-personal-page";
export const FINNY_URL = "https://fnny.app";
export const VENTRY_URL = "https://ventry.host";

export const SOCIAL_HANDLES = {
  github: "AtomicWasTaken",
  x: "janodersooo",
} as const;

export const SOCIAL_LINKS = {
  github: `https://github.com/${SOCIAL_HANDLES.github}`,
  linkedin: "https://www.linkedin.com/in/janmarlonleibl/",
  x: `https://x.com/${SOCIAL_HANDLES.x}`,
} as const;
