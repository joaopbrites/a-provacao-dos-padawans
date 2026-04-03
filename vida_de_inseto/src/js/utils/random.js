export function mulberry32(seed) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function generateUniqueArray(size, min, max, seed) {
  if (size > max - min + 1) {
    throw new Error("Intervalo insuficiente para gerar valores unicos");
  }

  const rng = mulberry32(seed);
  const values = new Set();

  while (values.size < size) {
    values.add(randomInt(rng, min, max));
  }

  return Array.from(values);
}

export function pickRandom(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

export function shuffleWithRng(rng, list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
