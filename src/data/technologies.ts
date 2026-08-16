import type { ImageMetadata } from "astro";
import type { SvgComponent } from "astro/types";
import angularLogo from "../assets/logos/angular.svg";
import appleLogo from "../assets/logos/apple.svg";
import astroLogo from "../assets/logos/astro.svg";
import bunLogo from "../assets/logos/bun.svg";
import claudeLogo from "../assets/logos/claude.svg";
import cloudflareLogo from "../assets/logos/cloudflare.svg";
import cursorLogo from "../assets/logos/cursor.svg";
import dockerLogo from "../assets/logos/docker.svg";
import giteaLogo from "../assets/logos/gitea.svg";
import gitLogo from "../assets/logos/git.svg";
import githubLogo from "../assets/logos/github.svg";
import gitlabLogo from "../assets/logos/gitlab.svg";
import geminiLogo from "../assets/logos/googlegemini.svg";
import linuxLogo from "../assets/logos/linux.svg";
import nextLogo from "../assets/logos/nextdotjs.svg";
import openaiLogo from "../assets/logos/openai.svg";
import perplexityLogo from "../assets/logos/perplexity.svg";
import phpLogo from "../assets/logos/php.svg";
import phpstormLogo from "../assets/logos/phpstorm.svg";
import proxmoxLogo from "../assets/logos/proxmox.svg";
import reactLogo from "../assets/logos/react.svg";
import symfonyLogo from "../assets/logos/symfony.svg";
import tailwindLogo from "../assets/logos/tailwindcss.svg";
import typescriptLogo from "../assets/logos/typescript.svg";
import typo3Logo from "../assets/logos/typo3.svg";
import vscodeLogo from "../assets/logos/vscode.svg";
import vueLogo from "../assets/logos/vuedotjs.svg";
import windowsLogo from "../assets/logos/windows11.svg";

export type Technology = {
  name: string;
  logo: SvgComponent & ImageMetadata;
  href: string;
  darkModeLight?: boolean;
};

export const TECHNOLOGIES: Technology[] = [
  { name: "PHP", logo: phpLogo, href: "https://www.php.net/" },
  {
    name: "TypeScript",
    logo: typescriptLogo,
    href: "https://www.typescriptlang.org/",
  },
  { name: "React", logo: reactLogo, href: "https://react.dev/" },
  {
    name: "Next.js",
    logo: nextLogo,
    href: "https://nextjs.org/",
    darkModeLight: true,
  },
  { name: "TYPO3", logo: typo3Logo, href: "https://typo3.org/" },
  { name: "Angular", logo: angularLogo, href: "https://angular.dev/" },
  { name: "Vue", logo: vueLogo, href: "https://vuejs.org/" },
  {
    name: "GitHub",
    logo: githubLogo,
    href: "https://github.com/",
    darkModeLight: true,
  },
  { name: "GitLab", logo: gitlabLogo, href: "https://gitlab.com/" },
  { name: "Gitea", logo: giteaLogo, href: "https://about.gitea.com/" },
  { name: "Docker", logo: dockerLogo, href: "https://www.docker.com/" },
  { name: "Proxmox", logo: proxmoxLogo, href: "https://www.proxmox.com/" },
  { name: "Linux", logo: linuxLogo, href: "https://www.linux.org/" },
  {
    name: "macOS",
    logo: appleLogo,
    href: "https://www.apple.com/macos/",
    darkModeLight: true,
  },
  { name: "Astro", logo: astroLogo, href: "https://astro.build/" },
  {
    name: "Cloudflare",
    logo: cloudflareLogo,
    href: "https://www.cloudflare.com/",
  },
  { name: "Bun", logo: bunLogo, href: "https://bun.sh/", darkModeLight: true },
  { name: "Claude", logo: claudeLogo, href: "https://claude.ai/" },
  {
    name: "Codex",
    logo: openaiLogo,
    href: "https://openai.com/codex",
    darkModeLight: true,
  },
  {
    name: "Cursor",
    logo: cursorLogo,
    href: "https://cursor.com/",
    darkModeLight: true,
  },
  { name: "Gemini", logo: geminiLogo, href: "https://gemini.google.com/" },
  {
    name: "Perplexity",
    logo: perplexityLogo,
    href: "https://www.perplexity.ai/",
  },
  { name: "VS Code", logo: vscodeLogo, href: "https://code.visualstudio.com/" },
  {
    name: "PhpStorm",
    logo: phpstormLogo,
    href: "https://www.jetbrains.com/phpstorm/",
    darkModeLight: true,
  },
  {
    name: "Windows",
    logo: windowsLogo,
    href: "https://www.microsoft.com/windows",
  },
  {
    name: "Tailwind CSS",
    logo: tailwindLogo,
    href: "https://tailwindcss.com/",
  },
];

export const EXPERIENCE_ONLY_TECHNOLOGIES: Technology[] = [
  {
    name: "Symfony",
    logo: symfonyLogo,
    href: "https://symfony.com/",
    darkModeLight: true,
  },
  { name: "Git", logo: gitLogo, href: "https://git-scm.com/" },
];
