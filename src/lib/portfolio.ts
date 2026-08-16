import { EXPERIENCE_ONLY_TECHNOLOGIES } from "../data/technologies";
import type { Technology } from "../data/technologies";

export type StickerPlacement = {
  side: "left" | "right";
  topPercent: number;
  offsetPercent: number;
  size: number;
  rotation: number;
};

const FEATURED_MOBILE_TECHNOLOGIES = [
  "PHP",
  "TypeScript",
  "React",
  "Next.js",
  "TYPO3",
  "Symfony",
  "Git",
  "Docker",
];

const STICKER_HORIZONTAL_BANDS = [
  [7, 24],
  [36, 59],
  [72, 94],
] as const;

export function createTechnologyCollections(technologies: Technology[]) {
  const all = [...technologies, ...EXPERIENCE_ONLY_TECHNOLOGIES];
  const byName = new Map(
    all.map((technology) => [technology.name, technology]),
  );
  const featured = FEATURED_MOBILE_TECHNOLOGIES.map((name) =>
    byName.get(name),
  ).filter((technology): technology is Technology => Boolean(technology));

  return {
    all,
    featured,
    additional: all.filter(
      (technology) => !FEATURED_MOBILE_TECHNOLOGIES.includes(technology.name),
    ),
    find: (names: string[]) =>
      names
        .map((name) => byName.get(name))
        .filter((technology): technology is Technology => Boolean(technology)),
  };
}

export function createStickerLayout(count: number): StickerPlacement[] {
  const leftCount = Math.ceil(count / 2);
  const rightCount = count - leftCount;

  return shuffle([
    ...createStickerSideLayout("left", leftCount),
    ...createStickerSideLayout("right", rightCount),
  ]);
}

export function toStickerStyle(placement: StickerPlacement): string {
  return `top:${placement.topPercent}%; --sticker-x:${placement.offsetPercent}%; --icon-size:min(${placement.size}px,5vh); --sticker-rotation:${placement.rotation}deg`;
}

function createStickerSideLayout(
  side: StickerPlacement["side"],
  count: number,
): StickerPlacement[] {
  const firstTop = 4;
  const lastTop = 88;
  const step = count > 1 ? (lastTop - firstTop) / (count - 1) : 0;
  const verticalJitter = step * 0.02;
  const bands = createBandOrder(count);

  return Array.from({ length: count }, (_, row) => {
    const [bandStart, bandEnd] = STICKER_HORIZONTAL_BANDS[bands[row]];
    const topPercent =
      count > 1
        ? firstTop + row * step + (Math.random() * 2 - 1) * verticalJitter
        : (firstTop + lastTop) / 2;

    return {
      side,
      topPercent,
      offsetPercent: bandStart + Math.random() * (bandEnd - bandStart),
      size: randomInteger(31, 43),
      rotation: randomInteger(-10, 10),
    };
  });
}

function createBandOrder(count: number): number[] {
  const order: number[] = [];
  while (order.length < count) {
    const group = shuffle([0, 1, 2]);
    if (order.at(-1) === group[0]) [group[0], group[1]] = [group[1], group[0]];
    order.push(...group);
  }
  return order.slice(0, count);
}

function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(0, index);
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}
