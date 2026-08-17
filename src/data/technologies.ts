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
  id: TechnologyId;
  name: string;
  logo: SvgComponent & ImageMetadata;
  href: string;
  darkModeLight?: boolean;
};

export type TechnologyId =
  | "angular"
  | "astro"
  | "bun"
  | "claude"
  | "cloudflare"
  | "codex"
  | "cursor"
  | "docker"
  | "git"
  | "gitea"
  | "github"
  | "gitlab"
  | "linux"
  | "macos"
  | "nextjs"
  | "gemini"
  | "perplexity"
  | "php"
  | "phpstorm"
  | "proxmox"
  | "react"
  | "symfony"
  | "tailwindcss"
  | "typescript"
  | "typo3"
  | "vscode"
  | "vue"
  | "windows";

export const TECHNOLOGIES: Technology[] = [
  { id: "php", name: "PHP", logo: phpLogo, href: "https://www.php.net/" },
  {
    id: "typescript",
    name: "TypeScript",
    logo: typescriptLogo,
    href: "https://www.typescriptlang.org/",
  },
  { id: "react", name: "React", logo: reactLogo, href: "https://react.dev/" },
  {
    id: "nextjs",
    name: "Next.js",
    logo: nextLogo,
    href: "https://nextjs.org/",
    darkModeLight: true,
  },
  { id: "typo3", name: "TYPO3", logo: typo3Logo, href: "https://typo3.org/" },
  {
    id: "angular",
    name: "Angular",
    logo: angularLogo,
    href: "https://angular.dev/",
  },
  { id: "vue", name: "Vue", logo: vueLogo, href: "https://vuejs.org/" },
  {
    id: "github",
    name: "GitHub",
    logo: githubLogo,
    href: "https://github.com/",
    darkModeLight: true,
  },
  {
    id: "gitlab",
    name: "GitLab",
    logo: gitlabLogo,
    href: "https://gitlab.com/",
  },
  {
    id: "gitea",
    name: "Gitea",
    logo: giteaLogo,
    href: "https://about.gitea.com/",
  },
  {
    id: "docker",
    name: "Docker",
    logo: dockerLogo,
    href: "https://www.docker.com/",
  },
  {
    id: "proxmox",
    name: "Proxmox",
    logo: proxmoxLogo,
    href: "https://www.proxmox.com/",
  },
  {
    id: "linux",
    name: "Linux",
    logo: linuxLogo,
    href: "https://www.linux.org/",
  },
  {
    id: "macos",
    name: "macOS",
    logo: appleLogo,
    href: "https://www.apple.com/macos/",
    darkModeLight: true,
  },
  { id: "astro", name: "Astro", logo: astroLogo, href: "https://astro.build/" },
  {
    id: "cloudflare",
    name: "Cloudflare",
    logo: cloudflareLogo,
    href: "https://www.cloudflare.com/",
  },
  {
    id: "bun",
    name: "Bun",
    logo: bunLogo,
    href: "https://bun.sh/",
    darkModeLight: true,
  },
  {
    id: "claude",
    name: "Claude",
    logo: claudeLogo,
    href: "https://claude.ai/",
  },
  {
    id: "codex",
    name: "Codex",
    logo: openaiLogo,
    href: "https://openai.com/codex",
    darkModeLight: true,
  },
  {
    id: "cursor",
    name: "Cursor",
    logo: cursorLogo,
    href: "https://cursor.com/",
    darkModeLight: true,
  },
  {
    id: "gemini",
    name: "Gemini",
    logo: geminiLogo,
    href: "https://gemini.google.com/",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    logo: perplexityLogo,
    href: "https://www.perplexity.ai/",
  },
  {
    id: "vscode",
    name: "VS Code",
    logo: vscodeLogo,
    href: "https://code.visualstudio.com/",
  },
  {
    id: "phpstorm",
    name: "PhpStorm",
    logo: phpstormLogo,
    href: "https://www.jetbrains.com/phpstorm/",
    darkModeLight: true,
  },
  {
    id: "windows",
    name: "Windows",
    logo: windowsLogo,
    href: "https://www.microsoft.com/windows",
  },
  {
    id: "tailwindcss",
    name: "Tailwind CSS",
    logo: tailwindLogo,
    href: "https://tailwindcss.com/",
  },
];

export const EXPERIENCE_ONLY_TECHNOLOGIES: Technology[] = [
  {
    id: "symfony",
    name: "Symfony",
    logo: symfonyLogo,
    href: "https://symfony.com/",
    darkModeLight: true,
  },
  { id: "git", name: "Git", logo: gitLogo, href: "https://git-scm.com/" },
];

export const ALL_TECHNOLOGIES = [
  ...TECHNOLOGIES,
  ...EXPERIENCE_ONLY_TECHNOLOGIES,
];
