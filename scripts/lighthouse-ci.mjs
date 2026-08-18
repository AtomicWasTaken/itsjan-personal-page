import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromeProfileDirectory = await mkdtemp(
  join(tmpdir(), "itsjan-lighthouse-"),
);

try {
  const exitCode = await new Promise((resolve, reject) => {
    const lighthouse = spawn(
      process.execPath,
      ["x", "@lhci/cli@0.15.1", "autorun"],
      {
        env: {
          ...process.env,
          LIGHTHOUSE_PROFILE_DIRECTORY: chromeProfileDirectory,
        },
        stdio: "inherit",
      },
    );

    lighthouse.once("error", reject);
    lighthouse.once("close", (code) => resolve(code ?? 1));
  });

  if (exitCode !== 0) process.exitCode = exitCode;
} finally {
  await rm(chromeProfileDirectory, { recursive: true, force: true });
}
