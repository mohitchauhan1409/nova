// A small, self-contained 3D-style character for the floating launcher only.
// Inline gradients keep the mark sharp without remote assets or image requests.
export const launcherMark = `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="nova-shell" cx="28%" cy="18%" r="88%">
      <stop offset="0" stop-color="#faf6ff"/>
      <stop offset=".3" stop-color="#ded0ff"/>
      <stop offset=".62" stop-color="#a991df"/>
      <stop offset=".84" stop-color="#8261c3"/>
      <stop offset="1" stop-color="#604497"/>
    </radialGradient>
    <radialGradient id="nova-eye" cx="30%" cy="22%" r="84%">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".45" stop-color="#fdfcff"/>
      <stop offset=".8" stop-color="#dfddf0"/>
      <stop offset="1" stop-color="#aaa0cf"/>
    </radialGradient>
    <radialGradient id="nova-pupil" cx="35%" cy="20%" r="85%">
      <stop offset="0" stop-color="#4b4363"/>
      <stop offset=".5" stop-color="#272039"/>
      <stop offset="1" stop-color="#171221"/>
    </radialGradient>
    <linearGradient id="nova-gleam" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".8"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <ellipse cx="33" cy="58" rx="19" ry="3" fill="#604497" opacity=".1"/>
  <path d="M5 32C5 16 16 6 31 6C47 6 59 17 59 33C59 49 48 57 32 57C16 57 5 48 5 32Z" fill="url(#nova-shell)"/>
  <path d="M12 22C16 12 28 8 39 11C25 10 19 16 16 24Z" fill="url(#nova-gleam)"/>
  <ellipse cx="24" cy="34" rx="9.5" ry="12.5" fill="#604497" opacity=".22"/>
  <ellipse cx="44" cy="33" rx="9" ry="12" fill="#604497" opacity=".22"/>
  <ellipse cx="23" cy="31" rx="9" ry="12" transform="rotate(-8 23 31)" fill="url(#nova-eye)"/>
  <ellipse cx="43" cy="30" rx="8.5" ry="11.5" transform="rotate(-8 43 30)" fill="url(#nova-eye)"/>
  <ellipse cx="26" cy="32" rx="4.6" ry="7" fill="url(#nova-pupil)"/>
  <ellipse cx="46" cy="31" rx="4.3" ry="6.7" fill="url(#nova-pupil)"/>
  <ellipse cx="24.8" cy="29.4" rx="1.5" ry="2" fill="#ffffff" opacity=".96"/>
  <ellipse cx="44.8" cy="28.4" rx="1.4" ry="1.8" fill="#ffffff" opacity=".96"/>
</svg>`;
