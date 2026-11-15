import styles from './HeroFallback.module.css'

/**
 * Static illustration of the desk, shown when WebGL is unavailable, the
 * device is low on power, or while the 3D bundle is still loading.
 */
export function HeroFallback({ loading = false }) {
  return (
    <div className={styles.fallback} data-loading={loading || undefined}>
      <svg viewBox="0 0 480 300" className={styles.art} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="fb-led" x1="0" x2="1">
            <stop offset="0" stopColor="#4f6bff" />
            <stop offset="1" stopColor="#8a5bff" />
          </linearGradient>
          <radialGradient id="fb-glow" cx="0.5" cy="0.55" r="0.55">
            <stop offset="0" stopColor="#5b6cff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#5b6cff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="240" cy="190" rx="220" ry="90" fill="url(#fb-glow)" />

        {/* Platform */}
        <path d="M60 232 L240 290 L420 232 L240 174 Z" fill="#161b36" />
        <path d="M60 232 L60 244 L240 302 L420 244 L420 232 L240 290 Z" fill="#10142a" />

        {/* Desk */}
        <path d="M110 190 L240 232 L370 190 L240 148 Z" fill="#1d191e" />
        <path d="M110 190 L110 198 L240 240 L370 198 L370 190 L240 232 Z" fill="#141114" />
        <rect x="112" y="196" width="5" height="40" fill="#2a2c33" />
        <rect x="363" y="196" width="5" height="40" fill="#2a2c33" />
        <rect x="236" y="238" width="6" height="40" fill="#2a2c33" />

        {/* Riser with LED */}
        <path d="M140 160 L240 192 L340 160 L240 128 Z" fill="#1d191e" />
        <path d="M140 160 L140 166 L240 198 L340 166 L340 160 L240 192 Z" fill="#141114" />
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

        {/* Chair (back view) */}
        <rect x="222" y="196" width="42" height="56" rx="10" fill="#121318" />
        <rect x="234" y="204" width="6" height="36" rx="3" fill="#e9e9ee" />
        <rect x="246" y="204" width="6" height="36" rx="3" fill="#e9e9ee" />
        <rect x="240" y="252" width="6" height="22" fill="#2a2c33" />
        <path d="M216 282 L270 282" stroke="#121318" strokeWidth="6" strokeLinecap="round" />

        {/* Lamp and plant */}
        <rect x="296" y="124" width="14" height="30" rx="5" fill="#2a62ff" opacity="0.8" />
        <circle cx="303" cy="136" r="3.5" fill="#ffd3ee" />
        <path d="M172 150 L184 150 L182 164 L174 164 Z" fill="#b5633a" />
        <path d="M178 150 L170 134 M178 150 L178 130 M178 150 L187 136" stroke="#63b06f" strokeWidth="3" strokeLinecap="round" />
        <path d="M334 150 h12 l1 6 h-14 z" fill="#ffd23f" />
      </svg>
      {loading && <span className="visually-hidden">Loading the 3D desk scene</span>}
    </div>
  )
}
