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
  // SPAs often paint an app root while leaving html/body transparent. Looking
  // only at those two elements made a light app inherit the OS dark preference.
  // Sample painted surfaces, never text or control values, and ignore our UI.
  const luminances: number[] = [];
  for (const [x, y] of [[.2, .25], [.5, .25], [.2, .65], [.5, .65], [.75, .5]]) {
    for (const element of document.elementsFromPoint(innerWidth * x, innerHeight * y)) {
      if (element.closest('[data-nova-root]')) continue;
      const components = getComputedStyle(element).backgroundColor.match(/[\d.]+/g)?.map(Number);
      if (!components || components.length < 3 || (components[3] ?? 1) < .8) continue;
      luminances.push(components[0] * .2126 + components[1] * .7152 + components[2] * .0722);
      break;
    }
  }
  const surface = [bodyStyle.backgroundColor, rootStyle.backgroundColor].find(color => color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)');
  const rgb = surface?.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  const luminance = luminances.length
    ? luminances.sort((a, b) => a - b)[Math.floor(luminances.length / 2)]
    : rgb?.length === 3 ? rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 : undefined;
  return declared === 'dark' || declared !== 'light' &&
    (luminance !== undefined ? luminance < 128 : matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
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
      if (body) bodyObserver.observe(body, { attributes: true, childList: true });
    }
    appRootObserver.disconnect();
    for (const element of Array.from(body?.children ?? [])) {
      if (!element.matches('[data-nova-root]')) appRootObserver.observe(element, { attributes: true });
    }
    const scheme = readPageColorScheme();
    if (scheme !== previous) { previous = scheme; onChange(scheme); }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const rootObserver = new MutationObserver(schedule);
  const bodyObserver = new MutationObserver(schedule);
  const headObserver = new MutationObserver(schedule);
  const appRootObserver = new MutationObserver(schedule);
  // Watch only app-root attributes, not content subtrees or our rendered controls.
  rootObserver.observe(document.documentElement, { attributes: true, childList: true });
  if (body) bodyObserver.observe(body, { attributes: true, childList: true });
  if (document.head) headObserver.observe(document.head, { subtree: true, childList: true, characterData: true, attributes: true });
  const preference = matchMedia('(prefers-color-scheme: dark)');
  preference.addEventListener('change', schedule);
  document.addEventListener('load', schedule, true);
  window.addEventListener('resize', schedule);
  update();
  return () => {
    cancelAnimationFrame(frame);
    rootObserver.disconnect(); bodyObserver.disconnect(); headObserver.disconnect(); appRootObserver.disconnect();
    preference.removeEventListener('change', schedule);
    document.removeEventListener('load', schedule, true);
    window.removeEventListener('resize', schedule);
  };
}
