import styles from './HeroFallback.module.css'

const toPercent = (value) => `${value * 100}%`

/**
 * Static illustration of the desk, shown instead of the 3D scene when
 * WebGL is unavailable or the device is low on power. It is placed in
 * the same slot the 3D diorama would occupy.
 */
export function HeroFallback({ frame, label }) {
  const style = frame
    ? { left: toPercent(frame.x), top: toPercent(frame.y), width: toPercent(frame.width), height: toPercent(frame.height) }
    : undefined

  return (
    <div className={styles.fallback} style={style} role="img" aria-label={label}>
      <svg viewBox="0 0 480 300" className={styles.art} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="fb-led" x1="0" x2="1">
            <stop offset="0" stopColor="#4f6bff" />
            <stop offset="1" stopColor="#8a5bff" />
          </linearGradient>
        </defs>

        {/* Platform */}
        <path d="M60 232 L240 290 L420 232 L240 174 Z" fill="#2a2d8c" />
        <path d="M60 232 L60 246 L240 304 L420 246 L420 232 L240 290 Z" fill="#1b1c62" />

        {/* Desk */}
        <path d="M110 190 L240 232 L370 190 L240 148 Z" fill="#241c2e" />
        <path d="M110 190 L110 198 L240 240 L370 198 L370 190 L240 232 Z" fill="#17121d" />
        <rect x="112" y="196" width="5" height="40" fill="#2a2c33" />
        <rect x="363" y="196" width="5" height="40" fill="#2a2c33" />
        <rect x="236" y="238" width="6" height="40" fill="#2a2c33" />

        {/* Riser with LED */}
        <path d="M140 160 L240 192 L340 160 L240 128 Z" fill="#241c2e" />
        <path d="M140 160 L140 166 L240 198 L340 166 L340 160 L240 192 Z" fill="#17121d" />
        <path d="M150 157 L240 186 L330 157" stroke="url(#fb-led)" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Curved monitor */}
        <path d="M150 86 Q240 70 330 86 L330 140 Q240 124 150 140 Z" fill="#15161b" />
        <path d="M156 92 Q240 77 324 92 L324 134 Q240 119 156 134 Z" fill="#0b0e17" />
        <rect x="170" y="98" width="46" height="4" rx="2" fill="#c792ea" />
        <rect x="222" y="98" width="30" height="4" rx="2" fill="#82aaff" />
        <rect x="178" y="108" width="60" height="4" rx="2" fill="#c3e88d" />
        <rect x="178" y="118" width="40" height="4" rx="2" fill="#ffcb6b" />
        <rect x="224" y="118" width="50" height="4" rx="2" fill="#89ddff" />
        <rect x="236" y="140" width="8" height="12" fill="#2a2c33" />

        {/* Laptop */}
        <path d="M212 170 L252 183 L292 170 L252 157 Z" fill="#3b3e46" />
        <path d="M214 146 L252 158 L252 134 L214 122 Z" fill="#2f3239" />
        <path d="M218 143 L249 153 L249 136 L218 126 Z" fill="#1d2550" />

        {/* Coffee mug */}
        <rect x="300" y="170" width="12" height="12" rx="2" fill="#f1ede6" />
        <path d="M312 173 q6 3 0 7" stroke="#f1ede6" strokeWidth="2" fill="none" />
        <path d="M304 166 q-3 -5 0 -9 M309 166 q3 -5 0 -9" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Chair (back view) */}
        <rect x="222" y="196" width="42" height="56" rx="10" fill="#121318" />
        <rect x="234" y="204" width="6" height="36" rx="3" fill="#e9e9ee" />
        <rect x="246" y="204" width="6" height="36" rx="3" fill="#e9e9ee" />
        <rect x="240" y="252" width="6" height="22" fill="#2a2c33" />
        <path d="M216 282 L270 282" stroke="#121318" strokeWidth="6" strokeLinecap="round" />

        {/* Lamp and duck */}
        <rect x="296" y="124" width="14" height="30" rx="5" fill="#2a62ff" opacity="0.8" />
        <circle cx="303" cy="136" r="3.5" fill="#ffd3ee" />
        <path d="M334 150 h12 l1 6 h-14 z" fill="#ffd23f" />
      </svg>
    </div>
  )
}
