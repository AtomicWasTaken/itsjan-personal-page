import { FINNY_URL, VENTRY_URL } from "../lib/site";

export const PROJECTS = {
  finny: { id: "finny", href: FINNY_URL },
  ventry: { id: "ventry", href: VENTRY_URL },
} as const;

export type ProjectId = keyof typeof PROJECTS;

export const ORGANIZATION_IDS = [
  "finny",
  "team-neusta",
  "ventry",
  "homelab",
] as const;

export type OrganizationId = (typeof ORGANIZATION_IDS)[number];

export const EXPERIENCE_IDS = [
  "building-finny",
  "team-neusta-apprenticeship",
  "built-ventry",
  "homelab",
] as const;

export type ExperienceId = (typeof EXPERIENCE_IDS)[number];
