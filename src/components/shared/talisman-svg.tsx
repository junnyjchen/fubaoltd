interface TalismanSVGProps {
  className?: string;
  variant?: 'protection' | 'home' | 'career' | 'personalized' | 'giftbox';
}

function ProtectionSymbol() {
  return (
    <g opacity="0.85">
      {/* Central vertical axis */}
      <line x1="100" y1="45" x2="100" y2="210" stroke="#C23B22" strokeWidth="1.5" />
      {/* Top horizontal */}
      <line x1="65" y1="60" x2="135" y2="60" stroke="#C23B22" strokeWidth="1.2" />
      {/* Cross strokes */}
      <line x1="70" y1="80" x2="130" y2="80" stroke="#C23B22" strokeWidth="1" />
      <line x1="75" y1="100" x2="125" y2="100" stroke="#C23B22" strokeWidth="0.8" />
      {/* Diagonal protective strokes */}
      <line x1="70" y1="65" x2="55" y2="95" stroke="#C23B22" strokeWidth="1" />
      <line x1="130" y1="65" x2="145" y2="95" stroke="#C23B22" strokeWidth="1" />
      {/* Shield-like curves */}
      <path d="M 70 120 Q 100 145 130 120" fill="none" stroke="#C23B22" strokeWidth="1.2" />
      <path d="M 75 135 Q 100 155 125 135" fill="none" stroke="#C23B22" strokeWidth="0.8" />
      {/* Bottom character-like strokes */}
      <line x1="80" y1="170" x2="120" y2="170" stroke="#C23B22" strokeWidth="1" />
      <line x1="85" y1="185" x2="115" y2="185" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="90" y1="170" x2="85" y2="200" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="110" y1="170" x2="115" y2="200" stroke="#C23B22" strokeWidth="0.8" />
      {/* Circle symbol */}
      <circle cx="100" cy="150" r="8" fill="none" stroke="#C23B22" strokeWidth="0.8" />
      <circle cx="100" cy="150" r="2" fill="#C23B22" />
    </g>
  );
}

function HomeSymbol() {
  return (
    <g opacity="0.85">
      {/* House-like top structure */}
      <path d="M 100 45 L 60 75 L 140 75 Z" fill="none" stroke="#C23B22" strokeWidth="1.2" />
      {/* Central pillar */}
      <line x1="100" y1="75" x2="100" y2="200" stroke="#C23B22" strokeWidth="1.5" />
      {/* Horizontal beams */}
      <line x1="65" y1="95" x2="135" y2="95" stroke="#C23B22" strokeWidth="1" />
      <line x1="70" y1="115" x2="130" y2="115" stroke="#C23B22" strokeWidth="0.8" />
      {/* Side walls */}
      <line x1="65" y1="75" x2="65" y2="160" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="135" y1="75" x2="135" y2="160" stroke="#C23B22" strokeWidth="0.8" />
      {/* Inner harmony symbol */}
      <circle cx="100" cy="135" r="15" fill="none" stroke="#C23B22" strokeWidth="0.8" />
      <path d="M 85 135 Q 100 120 115 135 Q 100 150 85 135" fill="none" stroke="#C23B22" strokeWidth="0.6" />
      {/* Base */}
      <line x1="60" y1="160" x2="140" y2="160" stroke="#C23B22" strokeWidth="1.2" />
      {/* Bottom decorative */}
      <line x1="80" y1="175" x2="120" y2="175" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="85" y1="190" x2="115" y2="190" stroke="#C23B22" strokeWidth="0.6" />
    </g>
  );
}

function CareerSymbol() {
  return (
    <g opacity="0.85">
      {/* Upward arrow/momentum */}
      <line x1="100" y1="210" x2="100" y2="50" stroke="#C23B22" strokeWidth="1.5" />
      <path d="M 85 65 L 100 45 L 115 65" fill="none" stroke="#C23B22" strokeWidth="1.2" />
      {/* Rising steps */}
      <line x1="60" y1="180" x2="80" y2="180" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="70" y1="160" x2="90" y2="160" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="80" y1="140" x2="100" y2="140" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="100" y1="120" x2="120" y2="120" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="110" y1="100" x2="130" y2="100" stroke="#C23B22" strokeWidth="0.8" />
      {/* Kai Wen inspired symbol */}
      <rect x="82" y="75" width="36" height="36" fill="none" stroke="#C23B22" strokeWidth="1" rx="1" />
      <line x1="90" y1="85" x2="110" y2="85" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="100" y1="78" x2="100" y2="108" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="90" y1="95" x2="110" y2="95" stroke="#C23B22" strokeWidth="0.6" />
      {/* Bottom foundation */}
      <line x1="65" y1="200" x2="135" y2="200" stroke="#C23B22" strokeWidth="1" />
      <line x1="75" y1="210" x2="125" y2="210" stroke="#C23B22" strokeWidth="0.6" />
    </g>
  );
}

function PersonalizedSymbol() {
  return (
    <g opacity="0.85">
      {/* Bagua-inspired circle */}
      <circle cx="100" cy="110" r="40" fill="none" stroke="#C23B22" strokeWidth="1" />
      <circle cx="100" cy="110" r="35" fill="none" stroke="#C23B22" strokeWidth="0.5" />
      {/* Yin-yang inspired center */}
      <path d="M 100 70 A 40 40 0 0 1 100 150 A 20 20 0 0 0 100 110 A 20 20 0 0 1 100 70" fill="none" stroke="#C23B22" strokeWidth="0.8" />
      <circle cx="100" cy="90" r="3" fill="#C23B22" opacity="0.6" />
      <circle cx="100" cy="130" r="3" fill="none" stroke="#C23B22" strokeWidth="0.8" />
      {/* Eight trigram lines */}
      <line x1="100" y1="65" x2="100" y2="55" stroke="#C23B22" strokeWidth="1.2" />
      <line x1="100" y1="155" x2="100" y2="165" stroke="#C23B22" strokeWidth="1.2" />
      <line x1="55" y1="110" x2="65" y2="110" stroke="#C23B22" strokeWidth="1.2" />
      <line x1="135" y1="110" x2="145" y2="110" stroke="#C23B22" strokeWidth="1.2" />
      {/* Diagonal lines */}
      <line x1="72" y1="82" x2="65" y2="75" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="128" y1="82" x2="135" y2="75" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="72" y1="138" x2="65" y2="145" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="128" y1="138" x2="135" y2="145" stroke="#C23B22" strokeWidth="0.8" />
      {/* Bottom text area */}
      <line x1="75" y1="185" x2="125" y2="185" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="80" y1="195" x2="120" y2="195" stroke="#C23B22" strokeWidth="0.6" />
      <line x1="85" y1="205" x2="115" y2="205" stroke="#C23B22" strokeWidth="0.4" />
      {/* Top character */}
      <line x1="90" y1="45" x2="110" y2="45" stroke="#C23B22" strokeWidth="1" />
      <line x1="100" y1="40" x2="100" y2="55" stroke="#C23B22" strokeWidth="0.8" />
    </g>
  );
}

function GiftBoxSymbol() {
  return (
    <g opacity="0.85">
      {/* Three overlapping talismans */}
      {/* Left talisman */}
      <rect x="40" y="55" width="45" height="70" rx="1" fill="none" stroke="#C23B22" strokeWidth="0.8" opacity="0.5" />
      <line x1="62" y1="65" x2="62" y2="115" stroke="#C23B22" strokeWidth="0.6" opacity="0.5" />
      <line x1="50" y1="75" x2="75" y2="75" stroke="#C23B22" strokeWidth="0.5" opacity="0.5" />
      {/* Right talisman */}
      <rect x="115" y="55" width="45" height="70" rx="1" fill="none" stroke="#C23B22" strokeWidth="0.8" opacity="0.5" />
      <line x1="137" y1="65" x2="137" y2="115" stroke="#C23B22" strokeWidth="0.6" opacity="0.5" />
      <line x1="125" y1="75" x2="150" y2="75" stroke="#C23B22" strokeWidth="0.5" opacity="0.5" />
      {/* Center talisman (main) */}
      <rect x="72" y="45" width="56" height="85" rx="1" fill="none" stroke="#C23B22" strokeWidth="1.2" />
      <line x1="100" y1="55" x2="100" y2="120" stroke="#C23B22" strokeWidth="1.2" />
      <line x1="82" y1="65" x2="118" y2="65" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="85" y1="80" x2="115" y2="80" stroke="#C23B22" strokeWidth="0.6" />
      <circle cx="100" cy="100" r="6" fill="none" stroke="#C23B22" strokeWidth="0.6" />
      {/* Copper coin below */}
      <circle cx="100" cy="165" r="18" fill="none" stroke="#B8860B" strokeWidth="1.2" />
      <rect x="93" y="158" width="14" height="14" fill="none" stroke="#B8860B" strokeWidth="0.8" />
      {/* Bottom decorative */}
      <line x1="70" y1="200" x2="130" y2="200" stroke="#C23B22" strokeWidth="0.8" />
      <line x1="80" y1="210" x2="120" y2="210" stroke="#C23B22" strokeWidth="0.5" />
    </g>
  );
}

export function TalismanSVG({ className = '', variant = 'protection' }: TalismanSVGProps) {
  return (
    <svg
      viewBox="0 0 200 280"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Paper background */}
      <defs>
        <filter id={`paper-texture-${variant}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
          <feDiffuseLighting in="noise" lightingColor="#F5E6C8" surfaceScale="1.5" result="light">
            <feDistantLight azimuth="45" elevation="55" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="light" operator="multiply" />
        </filter>
      </defs>
      <rect
        x="20"
        y="10"
        width="160"
        height="260"
        rx="2"
        fill="#F5E6C8"
        stroke="#D4A853"
        strokeWidth="0.5"
        opacity="0.9"
      />
      {/* Inner border */}
      <rect
        x="30"
        y="20"
        width="140"
        height="240"
        rx="1"
        fill="none"
        stroke="#C23B22"
        strokeWidth="0.8"
        opacity="0.3"
      />
      {/* Top decorative line */}
      <line x1="40" y1="35" x2="160" y2="35" stroke="#C23B22" strokeWidth="0.5" opacity="0.25" />

      {variant === 'protection' && <ProtectionSymbol />}
      {variant === 'home' && <HomeSymbol />}
      {variant === 'career' && <CareerSymbol />}
      {variant === 'personalized' && <PersonalizedSymbol />}
      {variant === 'giftbox' && <GiftBoxSymbol />}

      {/* Bottom seal stamp */}
      <g opacity="0.6">
        <rect x="82" y="225" width="36" height="36" rx="2" fill="none" stroke="#C23B22" strokeWidth="1" />
        <text x="100" y="249" textAnchor="middle" fontSize="14" fill="#C23B22" fontFamily="serif">
          符宝
        </text>
      </g>
    </svg>
  );
}

export function getTalismanVariant(slug: string): TalismanSVGProps['variant'] {
  if (slug.includes('protection')) return 'protection';
  if (slug.includes('home')) return 'home';
  if (slug.includes('career')) return 'career';
  if (slug.includes('personalized') || slug.includes('birth')) return 'personalized';
  if (slug.includes('gift') || slug.includes('energy') || slug.includes('box')) return 'giftbox';
  return 'protection';
}
