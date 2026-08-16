import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const skillPath = new URL(
  "../public/skills/itsjan-profile/SKILL.md",
  import.meta.url,
);
const discoveryPath = new URL(
  "../public/.well-known/agent-skills/index.json",
  import.meta.url,
);

const [skill, discoverySource] = await Promise.all([
  readFile(skillPath),
  readFile(discoveryPath, "utf8"),
]);

const discovery = JSON.parse(discoverySource);
const publishedDigest = discovery.skills?.find(
  (skillEntry) => skillEntry.name === "itsjan-profile",
)?.digest;
const actualDigest = `sha256:${createHash("sha256").update(skill).digest("hex")}`;

if (publishedDigest !== actualDigest) {
  console.error(
    [
      "Agent Skill digest is out of date.",
      `Expected: ${actualDigest}`,
      `Found:    ${publishedDigest ?? "missing"}`,
    ].join("\n"),
  );
  process.exitCode = 1;
} else {
  process.stdout.write("Agent Skill digest is current.\n");
}
