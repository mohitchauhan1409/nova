export type PageColorScheme = 'light' | 'dark';
export type PageThemeEvent = { type: 'page-theme'; scheme: PageColorScheme };

export function isPageColorScheme(value: unknown): value is PageColorScheme {
  return value === 'light' || value === 'dark';
}

// Presentation only: no page text, controls, snapshots, or browser-control API.
// Keep passive initialization and later DOM snapshots on the same detector.
export function readPageColorScheme(): PageColorScheme {
  const rootStyle = getComputedStyle(document.documentElement);
  const bodyStyle = document.body ? getComputedStyle(document.body) : rootStyle;
  const declared = bodyStyle.colorScheme === 'normal' ? rootStyle.colorScheme : bodyStyle.colorScheme;
  const surface = [bodyStyle.backgroundColor, rootStyle.backgroundColor].find(color => color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)');
  const rgb = surface?.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  return declared === 'dark' || declared !== 'light' &&
    (rgb?.length === 3 ? rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 < 128 : matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}

export function observePageColorScheme(onChange: (scheme: PageColorScheme) => void): () => void {
  let previous: PageColorScheme | undefined;
  let frame = 0;
  let body = document.body;
  const update = () => {
    frame = 0;
    if (body !== document.body) {
      body = document.body;
      bodyObserver.disconnect();
      if (body) bodyObserver.observe(body, { attributes: true });
    }
    const scheme = readPageColorScheme();
    if (scheme !== previous) { previous = scheme; onChange(scheme); }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const rootObserver = new MutationObserver(schedule);
  const bodyObserver = new MutationObserver(schedule);
  const headObserver = new MutationObserver(schedule);
  // Do not watch the site's content subtree or Nova's own rendered controls.
  rootObserver.observe(document.documentElement, { attributes: true, childList: true });
  if (body) bodyObserver.observe(body, { attributes: true });
  if (document.head) headObserver.observe(document.head, { subtree: true, childList: true, characterData: true, attributes: true });
  const preference = matchMedia('(prefers-color-scheme: dark)');
  preference.addEventListener('change', schedule);
  document.addEventListener('load', schedule, true);
  update();
  return () => {
    cancelAnimationFrame(frame);
    rootObserver.disconnect(); bodyObserver.disconnect(); headObserver.disconnect();
    preference.removeEventListener('change', schedule);
    document.removeEventListener('load', schedule, true);
  };
}
