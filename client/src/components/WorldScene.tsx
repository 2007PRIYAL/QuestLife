// A tall, hand-crafted 16-bit fantasy RPG world map SVG.
// Features 4 distinct animated biomes:
// 1. Green Meadows & Lake Whispers (bottom, Tiers 1-3)
// 2. The Dark Woods, Waterfall & Ancient Bridge (lower-mid, Tiers 4-6)
// 3. Dragon Peaks, Chasm & Rope Bridge (upper-mid, Tiers 7-8)
// 4. High Castle Citadel & Astral Skyline (top, Tiers 9-10)
//
// MAP_HEIGHT is exported so WorldMap.tsx sizes its scroll container and
// positions quest markers accurately on the exact same coordinate plane.

export const MAP_HEIGHT = 1800;
const MAP_WIDTH = 430;

export const WorldScene = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <style>{`
          @keyframes mapTwinkle {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes mapWaterFlow {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -48; }
          }
          @keyframes mapFlameFlicker {
            0%, 100% { transform: scale(1) translateY(0); opacity: 0.9; }
            50% { transform: scale(1.2) translateY(-1px); opacity: 1; filter: drop-shadow(0 0 6px #FFA500); }
          }
          @keyframes mapCloudDrift {
            0% { transform: translateX(-15px); }
            50% { transform: translateX(15px); }
            100% { transform: translateX(-15px); }
          }
          @keyframes mapCrystalPulse {
            0%, 100% { opacity: 0.75; transform: translateY(0); filter: drop-shadow(0 0 4px #00F5D4); }
            50% { opacity: 1; transform: translateY(-4px); filter: drop-shadow(0 0 12px #38BDF8); }
          }
          @keyframes mapWispFloat {
            0%, 100% { transform: translate(0, 0); opacity: 0.5; }
            50% { transform: translate(5px, -7px); opacity: 0.95; }
          }
          @keyframes mapWaterfallSpray {
            0%, 100% { transform: scaleY(1); opacity: 0.7; }
            50% { transform: scaleY(1.05); opacity: 0.95; }
          }
          .twinkle-fast { animation: mapTwinkle 2.2s infinite ease-in-out; }
          .twinkle-mid { animation: mapTwinkle 3.5s infinite ease-in-out 1.2s; }
          .twinkle-slow { animation: mapTwinkle 4.8s infinite ease-in-out 2.4s; }
          .flame-anim { animation: mapFlameFlicker 1.4s infinite ease-in-out; transform-origin: 200px 1720px; }
          .cloud-drift-1 { animation: mapCloudDrift 18s infinite ease-in-out; }
          .cloud-drift-2 { animation: mapCloudDrift 24s infinite ease-in-out 6s; }
          .water-flow { stroke-dasharray: 8 6; animation: mapWaterFlow 1.6s linear infinite; }
          .crystal-beacon { animation: mapCrystalPulse 2.8s infinite ease-in-out; transform-origin: 215px 35px; }
          .wisp-1 { animation: mapWispFloat 3.8s infinite ease-in-out; }
          .wisp-2 { animation: mapWispFloat 4.6s infinite ease-in-out 1.5s; }
          .wisp-3 { animation: mapWispFloat 5.2s infinite ease-in-out 2.8s; }
          .waterfall-anim { animation: mapWaterfallSpray 1.2s infinite alternate ease-in-out; transform-origin: top center; }
        `}</style>

        {/* Global biome gradients */}
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#040714" />
          <stop offset="35%" stopColor="#0A162B" />
          <stop offset="70%" stopColor="#142646" />
          <stop offset="100%" stopColor="#1A3358" />
        </linearGradient>

        <linearGradient id="mountainPeakGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8DA3B8" />
          <stop offset="40%" stopColor="#3C4858" />
          <stop offset="100%" stopColor="#222B38" />
        </linearGradient>

        <linearGradient id="darkForestGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15241C" />
          <stop offset="50%" stopColor="#0E1B15" />
          <stop offset="100%" stopColor="#132F20" />
        </linearGradient>

        <linearGradient id="meadowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#163C26" />
          <stop offset="45%" stopColor="#1C4B30" />
          <stop offset="100%" stopColor="#235A3B" />
        </linearGradient>

        <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#1D78B5" />
          <stop offset="100%" stopColor="#0E4A77" />
        </linearGradient>

        <linearGradient id="lakeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#1B6A9C" />
          <stop offset="100%" stopColor="#0A3C60" />
        </linearGradient>

        <linearGradient id="waterfallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#BAE6FD" stopOpacity="0.85" />
          <stop offset="85%" stopColor="#38BDF8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="castleRoof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#0F2B75" />
        </linearGradient>

        <linearGradient id="castleWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="60%" stopColor="#2D3748" />
          <stop offset="100%" stopColor="#1A202C" />
        </linearGradient>

        {/* Glow filters */}
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="beaconGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="flameGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Pixel grid pattern for terrain texture */}
        <pattern id="pixelPattern" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="transparent" />
          <rect x="0" y="0" width="8" height="8" fill="rgba(255,255,255,0.02)" />
          <rect x="8" y="8" width="8" height="8" fill="rgba(0,0,0,0.04)" />
        </pattern>
      </defs>

      {/* ========================================================
          BACKGROUND BASE PANELS (BIOME SEGMENTS)
          ======================================================== */}
      {/* Sky & Astral Skyline (y: 0 to 450) */}
      <rect x="0" y="0" width={MAP_WIDTH} height="450" fill="url(#skyGrad)" />
      {/* Mountain & High Crags (y: 450 to 920) */}
      <rect x="0" y="450" width={MAP_WIDTH} height="470" fill="url(#mountainPeakGrad)" />
      {/* Dark Woods & Deep Forest (y: 920 to 1380) */}
      <rect x="0" y="920" width={MAP_WIDTH} height="460" fill="url(#darkForestGrad)" />
      {/* Green Meadows & Coastal Pasture (y: 1380 to 1800) */}
      <rect x="0" y="1380" width={MAP_WIDTH} height="420" fill="url(#meadowGrad)" />

      {/* Subtle pixel grit texture */}
      <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#pixelPattern)" />

      {/* ========================================================
          BIOME 1: CELESTIAL SKY & THE HIGH CASTLE CITADEL (y: 0 - 450)
          ======================================================== */}
      {/* Nebula clouds */}
      <ellipse cx="120" cy="90" rx="140" ry="60" fill="#3B0764" opacity="0.35" filter="url(#softGlow)" />
      <ellipse cx="330" cy="180" rx="110" ry="45" fill="#1E3A8A" opacity="0.28" filter="url(#softGlow)" />

      {/* Constellations & Starfield */}
      <g fill="#FFF8DB">
        {/* Major Stars */}
        <circle cx="60" cy="50" r="2.2" className="twinkle-fast" />
        <circle cx="95" cy="75" r="1.5" className="twinkle-mid" />
        <circle cx="150" cy="40" r="2.5" className="twinkle-slow" />
        <circle cx="190" cy="70" r="1.2" className="twinkle-fast" />
        <circle cx="280" cy="45" r="2.2" className="twinkle-mid" />
        <circle cx="380" cy="65" r="2.8" className="twinkle-slow" />
        <circle cx="340" cy="110" r="1.6" className="twinkle-fast" />
        <circle cx="50" cy="160" r="2" className="twinkle-slow" />
        <circle cx="105" cy="140" r="1.4" className="twinkle-mid" />
        <circle cx="390" cy="170" r="1.8" className="twinkle-fast" />
        <circle cx="30" cy="220" r="1.5" className="twinkle-slow" />
        <circle cx="410" cy="250" r="2.2" className="twinkle-fast" />
        {/* Constellation connector lines */}
        <path d="M 60 50 L 95 75 L 150 40 L 190 70" stroke="#93C5FD" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
        <path d="M 280 45 L 340 110 L 380 65" stroke="#93C5FD" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.4" />
      </g>

      {/* Celestial Moon with glowing rings & craters */}
      <circle cx="345" cy="95" r="42" fill="#38BDF8" opacity="0.12" filter="url(#beaconGlow)" />
      <circle cx="345" cy="95" r="32" fill="#E0F2FE" opacity="0.95" />
      <circle cx="345" cy="95" r="28" fill="#F0F9FF" />
      {/* Moon craters */}
      <circle cx="334" cy="88" r="4.5" fill="#BAE6FD" opacity="0.65" />
      <circle cx="356" cy="98" r="6" fill="#BAE6FD" opacity="0.6" />
      <circle cx="340" cy="108" r="3.5" fill="#BAE6FD" opacity="0.55" />
      {/* Moon dark-side shadow crescent */}
      <path d="M 345 67 A 28 28 0 0 0 358 122 A 28 28 0 0 1 345 67" fill="#0A1830" opacity="0.25" />

      {/* Castle Cliff Foundation */}
      <polygon points="60,370 140,270 290,270 370,370 410,430 20,430" fill="#141E2D" />
      <polygon points="120,290 215,280 310,290 340,360 90,360" fill="#1A273C" />

      {/* High Castle Citadel Architecture */}
      {/* Outer curtain wall */}
      <rect x="110" y="160" width="210" height="70" fill="url(#castleWall)" rx="2" stroke="#000" strokeWidth="2" />
      {/* Wall battlements (crenellations) */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => (
        <rect key={b} x={114 + b * 20} y="152" width="12" height="10" fill="#334155" stroke="#000" strokeWidth="1.5" />
      ))}

      {/* Left Tower */}
      <rect x="90" y="125" width="44" height="110" fill="url(#castleWall)" stroke="#000" strokeWidth="2" />
      <polygon points="84,125 112,65 140,125" fill="url(#castleRoof)" stroke="#000" strokeWidth="2" />
      <rect x="108" y="55" width="8" height="12" fill="#FBBF24" />
      <polygon points="112,50 106,56 118,56" fill="#F59E0B" />
      <rect x="105" y="145" width="14" height="22" rx="7" fill="#FDE047" filter="url(#softGlow)" stroke="#000" strokeWidth="1.5" />
      {/* Window mullion */}
      <line x1="112" y1="145" x2="112" y2="167" stroke="#000" strokeWidth="1.2" />
      <line x1="105" y1="156" x2="119" y2="156" stroke="#000" strokeWidth="1.2" />

      {/* Right Tower */}
      <rect x="296" y="125" width="44" height="110" fill="url(#castleWall)" stroke="#000" strokeWidth="2" />
      <polygon points="290,125 318,65 346,125" fill="url(#castleRoof)" stroke="#000" strokeWidth="2" />
      <rect x="314" y="55" width="8" height="12" fill="#FBBF24" />
      <polygon points="318,50 312,56 324,56" fill="#F59E0B" />
      <rect x="311" y="145" width="14" height="22" rx="7" fill="#FDE047" filter="url(#softGlow)" stroke="#000" strokeWidth="1.5" />
      <line x1="318" y1="145" x2="318" y2="167" stroke="#000" strokeWidth="1.2" />
      <line x1="311" y1="156" x2="325" y2="156" stroke="#000" strokeWidth="1.2" />

      {/* Grand Central Keep */}
      <rect x="165" y="95" width="100" height="135" fill="url(#castleWall)" stroke="#000" strokeWidth="2" />
      {/* Keep roof / spire */}
      <polygon points="155,95 215,25 275,95" fill="url(#castleRoof)" stroke="#000" strokeWidth="2" />

      {/* Floating Astral Beacon Crystal above apex */}
      <g className="crystal-beacon">
        <polygon points="215,8 223,24 215,36 207,24" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
        <polygon points="215,12 220,24 215,32 210,24" fill="#E0F2FE" />
        {/* Radiant beacon beam into sky */}
        <polygon points="215,8 195,-20 235,-20" fill="#38BDF8" opacity="0.3" filter="url(#beaconGlow)" />
      </g>

      {/* Royal Keep Rose Window */}
      <circle cx="215" cy="120" r="16" fill="#1E293B" stroke="#FBBF24" strokeWidth="2" />
      <circle cx="215" cy="120" r="11" fill="#FDE047" filter="url(#softGlow)" />
      <circle cx="215" cy="120" r="5" fill="#F97316" />
      {/* Rose window petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
        <line
          key={ang}
          x1="215"
          y1="120"
          x2={215 + Math.cos((ang * Math.PI) / 180) * 11}
          y2={120 + Math.sin((ang * Math.PI) / 180) * 11}
          stroke="#000"
          strokeWidth="1.5"
        />
      ))}

      {/* Main Portcullis & Drawbridge Gate */}
      <rect x="195" y="185" width="40" height="45" rx="20" fill="#0A0F1D" stroke="#000" strokeWidth="2" />
      {/* Iron portcullis bars */}
      <line x1="202" y1="187" x2="202" y2="230" stroke="#64748B" strokeWidth="2" />
      <line x1="209" y1="185" x2="209" y2="230" stroke="#64748B" strokeWidth="2" />
      <line x1="216" y1="185" x2="216" y2="230" stroke="#64748B" strokeWidth="2" />
      <line x1="223" y1="185" x2="223" y2="230" stroke="#64748B" strokeWidth="2" />
      <line x1="230" y1="187" x2="230" y2="230" stroke="#64748B" strokeWidth="2" />
      <line x1="195" y1="200" x2="235" y2="200" stroke="#64748B" strokeWidth="1.8" />
      <line x1="195" y1="214" x2="235" y2="214" stroke="#64748B" strokeWidth="1.8" />

      {/* Royal Banners fluttering on battlements */}
      <g>
        <rect x="150" y="165" width="10" height="32" fill="#DC2626" />
        <polygon points="150,197 155,189 160,197" fill="#1E293B" />
        <polygon points="152,172 158,172 155,178" fill="#FBBF24" />

        <rect x="270" y="165" width="10" height="32" fill="#DC2626" />
        <polygon points="270,197 275,189 280,197" fill="#1E293B" />
        <polygon points="272,172 278,172 275,178" fill="#FBBF24" />
      </g>

      {/* Grand Castle Approach Staircase */}
      <g fill="#334155" stroke="#000" strokeWidth="1.5">
        <rect x="180" y="230" width="70" height="8" rx="1" />
        <rect x="175" y="238" width="80" height="9" rx="1" />
        <rect x="170" y="247" width="90" height="9" rx="1" />
        <rect x="165" y="256" width="100" height="10" rx="1" />
        <rect x="160" y="266" width="110" height="10" rx="1" />
      </g>

      {/* ========================================================
          BIOME 2: DRAGON PEAKS & CRAGGY HIGHLANDS (y: 400 - 920)
          ======================================================== */}
      {/* Background Rocky Ridges */}
      <polygon points="0,520 80,430 160,510 240,410 330,500 430,420 430,680 0,680" fill="#1E2836" />
      <polygon points="0,620 110,510 190,610 290,490 380,590 430,530 430,760 0,760" fill="#293548" />

      {/* Foreground Mountain Range with snowy crags */}
      <polygon points="30,750 140,580 250,750" fill="#3A475C" stroke="#000" strokeWidth="2" />
      {/* Snow cap on Left Peak */}
      <polygon points="140,580 115,625 125,620 135,632 145,622 155,630 165,622" fill="#F8FAFC" />
      {/* Mountain shadow ridge */}
      <polygon points="140,580 250,750 140,750" fill="#212C3D" opacity="0.75" />

      <polygon points="210,720 320,540 430,720" fill="#3D4B61" stroke="#000" strokeWidth="2" />
      {/* Snow cap on Right Peak */}
      <polygon points="320,540 295,585 306,580 316,592 325,582 338,590 345,582" fill="#F8FAFC" />
      <polygon points="320,540 430,720 320,720" fill="#243042" opacity="0.75" />

      {/* Dragon's Lair Cavern Entrance (y: 640 - 720, right side) */}
      <g>
        {/* Rocky cave mouth shaped like jagged dragon jaws */}
        <polygon points="320,640 375,615 425,645 420,710 325,710" fill="#111827" stroke="#000" strokeWidth="2.5" />
        {/* Cave opening interior (deep black) */}
        <path d="M 340 695 C 340 650, 405 650, 405 695 Z" fill="#030712" />
        {/* Stalactites & teeth */}
        <polygon points="350,650 355,665 360,650" fill="#94A3B8" />
        <polygon points="365,649 370,668 375,649" fill="#94A3B8" />
        <polygon points="380,650 385,666 390,650" fill="#94A3B8" />
        {/* Glowing Dragon Eyes inside cave */}
        <ellipse cx="363" cy="672" rx="3.5" ry="5.5" fill="#EF4444" filter="url(#flameGlow)" />
        <ellipse cx="382" cy="672" rx="3.5" ry="5.5" fill="#EF4444" filter="url(#flameGlow)" />
        <circle cx="363" cy="672" r="1.5" fill="#FEF08A" />
        <circle cx="382" cy="672" r="1.5" fill="#FEF08A" />
        {/* Lava / ember glow leaking from the cavern */}
        <path d="M 355 695 Q 372 708 390 695" stroke="#F97316" strokeWidth="4" fill="none" filter="url(#softGlow)" />
      </g>

      {/* Mountain Rope Suspension Bridge over deep chasm (y: 770 - 810) */}
      <g>
        {/* Deep abyss under the bridge */}
        <polygon points="120,775 310,775 330,860 100,860" fill="#0A0E17" opacity="0.85" />
        {/* Wooden support posts */}
        <rect x="130" y="750" width="10" height="35" fill="#78350F" stroke="#000" strokeWidth="1.5" />
        <rect x="290" y="750" width="10" height="35" fill="#78350F" stroke="#000" strokeWidth="1.5" />
        {/* Suspension ropes */}
        <path d="M 135 755 Q 215 795 295 755" stroke="#D97706" strokeWidth="3" fill="none" />
        <path d="M 135 772 Q 215 808 295 772" stroke="#B45309" strokeWidth="3" fill="none" />
        {/* Bridge wood planks */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((p) => {
          const px = 145 + p * 12;
          const curveY = 770 + Math.sin(((p + 1) / 13) * Math.PI) * 20;
          return (
            <rect
              key={p}
              x={px}
              y={curveY}
              width="8"
              height="14"
              fill="#92400E"
              stroke="#000"
              strokeWidth="1.2"
              transform={`rotate(${(p - 5.5) * 2.8} ${px} ${curveY})`}
            />
          );
        })}
      </g>

      {/* Drifting Mountain Clouds */}
      <g className="cloud-drift-1" opacity="0.6">
        <ellipse cx="90" cy="510" rx="65" ry="18" fill="#CBD5E1" />
        <ellipse cx="120" cy="505" rx="45" ry="22" fill="#E2E8F0" />
        <ellipse cx="65" cy="515" rx="35" ry="14" fill="#F1F5F9" />
      </g>
      <g className="cloud-drift-2" opacity="0.55">
        <ellipse cx="340" cy="740" rx="75" ry="20" fill="#94A3B8" />
        <ellipse cx="370" cy="735" rx="50" ry="24" fill="#CBD5E1" />
        <ellipse cx="310" cy="744" rx="40" ry="16" fill="#E2E8F0" />
      </g>

      {/* ========================================================
          BIOME 3: THE DARK WOODS & ROARING WATERFALL (y: 900 - 1380)
          ======================================================== */}
      {/* Stone Cliff Ridge for Waterfall source */}
      <polygon points="0,960 160,940 270,950 430,930 430,1020 0,1020" fill="#19231E" />
      <polygon points="180,950 280,950 285,1090 175,1090" fill="#111B16" />

      {/* Tiered Waterfall (y: 950 - 1090) */}
      <g className="waterfall-anim">
        <rect x="200" y="950" width="60" height="135" fill="url(#waterfallGrad)" rx="6" />
        {/* Waterfall whitewater foam streaks */}
        <line x1="210" y1="950" x2="210" y2="1080" stroke="#FFFFFF" strokeWidth="3" opacity="0.8" />
        <line x1="225" y1="955" x2="225" y2="1085" stroke="#FFFFFF" strokeWidth="4" opacity="0.9" />
        <line x1="240" y1="952" x2="240" y2="1080" stroke="#FFFFFF" strokeWidth="3" opacity="0.8" />
        <line x1="252" y1="958" x2="252" y2="1075" stroke="#E0F2FE" strokeWidth="2.5" opacity="0.75" />
      </g>
      {/* Waterfall Basin & Frothing Spray */}
      <ellipse cx="230" cy="1090" rx="55" ry="16" fill="#0284C7" />
      <ellipse cx="230" cy="1088" rx="46" ry="12" fill="#38BDF8" opacity="0.85" />
      <ellipse cx="230" cy="1086" rx="36" ry="8" fill="#BAE6FD" opacity="0.9" />
      <ellipse cx="230" cy="1084" rx="22" ry="5" fill="#FFFFFF" opacity="0.95" />

      {/* Winding River running through Dark Woods down to Lake */}
      <path
        d="M 230 1090 C 260 1150, 310 1200, 270 1280 C 230 1360, 160 1420, 190 1520 C 220 1600, 290 1640, 320 1700"
        stroke="url(#riverGrad)"
        strokeWidth="42"
        fill="none"
        strokeLinecap="round"
      />
      {/* River bank edge outline */}
      <path
        d="M 230 1090 C 260 1150, 310 1200, 270 1280 C 230 1360, 160 1420, 190 1520 C 220 1600, 290 1640, 320 1700"
        stroke="#0F3628"
        strokeWidth="48"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Animated River Current flow */}
      <path
        d="M 230 1090 C 260 1150, 310 1200, 270 1280 C 230 1360, 160 1420, 190 1520 C 220 1600, 290 1640, 320 1700"
        stroke="#E0F2FE"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.65"
        className="water-flow"
      />

      {/* Ancient Stone Bridge across River (y: 1220 - 1265) */}
      <g>
        {/* Bridge shadow */}
        <rect x="175" y="1235" width="170" height="26" rx="4" fill="#06120D" opacity="0.6" />
        {/* Bridge roadway */}
        <rect x="180" y="1225" width="160" height="20" rx="3" fill="#475569" stroke="#000" strokeWidth="2" />
        {/* Cobblestone roadway pavers */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
          <line key={b} x1={188 + b * 19} y1="1225" x2={188 + b * 19} y2="1245" stroke="#1E293B" strokeWidth="2" />
        ))}
        {/* Bridge Stone Arch Pier (Double Arches over River) */}
        <path d="M 215 1245 A 16 16 0 0 1 245 1245 Z" fill="#0F172A" />
        <path d="M 275 1245 A 16 16 0 0 1 305 1245 Z" fill="#0F172A" />
        {/* Bridge parapet posts & lanterns */}
        <rect x="180" y="1218" width="8" height="9" fill="#64748B" stroke="#000" strokeWidth="1" />
        <rect x="332" y="1218" width="8" height="9" fill="#64748B" stroke="#000" strokeWidth="1" />
        {/* Lantern on left bridge post */}
        <circle cx="184" cy="1213" r="3.5" fill="#FBBF24" filter="url(#softGlow)" />
        <circle cx="336" cy="1213" r="3.5" fill="#FBBF24" filter="url(#softGlow)" />
      </g>

      {/* Dense Dark Pine & Oak Forest Clusters */}
      {/* Background deep pine layer */}
      <g fill="#0A1D13">
        {[
          [35, 960], [70, 990], [25, 1040], [80, 1080], [35, 1140], [60, 1200], [20, 1260],
          [375, 970], [410, 1020], [360, 1060], [405, 1110], [370, 1170], [410, 1230], [380, 1310]
        ].map(([tx, ty], i) => (
          <polygon
            key={i}
            points={`${tx},${ty - 42} ${tx - 24},${ty + 8} ${tx + 24},${ty + 8}`}
            stroke="#000"
            strokeWidth="1.5"
          />
        ))}
      </g>

      {/* Midground Emerald Pines with layered boughs */}
      <g fill="#143A26">
        {[
          [55, 1010], [40, 1100], [75, 1160], [35, 1220], [65, 1300],
          [385, 1040], [355, 1130], [395, 1190], [360, 1270], [395, 1340]
        ].map(([tx, ty], i) => (
          <g key={i}>
            {/* Trunk */}
            <rect x={tx - 4} y={ty + 4} width="8" height="12" fill="#451A03" stroke="#000" strokeWidth="1" />
            {/* Bottom tier */}
            <polygon points={`${tx},${ty - 10} ${tx - 26},${ty + 8} ${tx + 26},${ty + 8}`} stroke="#000" strokeWidth="1.5" />
            {/* Mid tier */}
            <polygon points={`${tx},${ty - 25} ${tx - 20},${ty - 4} ${tx + 20},${ty - 4}`} fill="#184830" stroke="#000" strokeWidth="1.5" />
            {/* Top apex */}
            <polygon points={`${tx},${ty - 40} ${tx - 14},${ty - 18} ${tx + 14},${ty - 18}`} fill="#1E593C" stroke="#000" strokeWidth="1.5" />
          </g>
        ))}
      </g>

      {/* Ancient Great Oak Landmark (y: 1120, left) */}
      <g>
        {/* Oak Foliage canopy */}
        <circle cx="85" cy="1120" r="38" fill="#143A26" stroke="#000" strokeWidth="2" />
        <circle cx="68" cy="1105" r="26" fill="#1E5236" />
        <circle cx="102" cy="1110" r="24" fill="#1A4730" />
        <circle cx="85" cy="1090" r="22" fill="#236040" />
        {/* Twisted Trunk & roots */}
        <path d="M 80 1150 C 78 1165, 65 1175, 60 1180 L 110 1180 C 105 1175, 92 1165, 90 1150 Z" fill="#542808" stroke="#000" strokeWidth="1.8" />
      </g>

      {/* Glowing Mystical Fairy Mushrooms in Dark Woods */}
      <g>
        <ellipse cx="118" cy="1268" rx="6" ry="4" fill="#00F5D4" filter="url(#softGlow)" />
        <rect x="117" y="1268" width="2" height="5" fill="#E2E8F0" />

        <ellipse cx="128" cy="1272" rx="4.5" ry="3" fill="#D946EF" filter="url(#softGlow)" />
        <rect x="127" y="1272" width="2" height="4" fill="#E2E8F0" />

        <ellipse cx="318" cy="1175" rx="5.5" ry="3.5" fill="#00F5D4" filter="url(#softGlow)" />
        <rect x="317" y="1175" width="2" height="4" fill="#E2E8F0" />

        <ellipse cx="328" cy="1178" rx="4" ry="2.5" fill="#38BDF8" filter="url(#softGlow)" />
        <rect x="327" y="1178" width="2" height="3" fill="#E2E8F0" />
      </g>

      {/* Floating Forest Wisps / Fireflies */}
      <circle cx="110" cy="1190" r="2" fill="#6EE7B7" className="wisp-1" filter="url(#softGlow)" />
      <circle cx="140" cy="1150" r="2.5" fill="#A7F3D0" className="wisp-2" filter="url(#softGlow)" />
      <circle cx="340" cy="1210" r="2" fill="#6EE7B7" className="wisp-3" filter="url(#softGlow)" />
      <circle cx="305" cy="1140" r="2.2" fill="#FDE68A" className="wisp-1" filter="url(#softGlow)" />

      {/* ========================================================
          BIOME 4: GREEN MEADOWS & WHISPERING LAKE (y: 1380 - 1800)
          ======================================================== */}
      {/* Rolling Meadow Terraces */}
      <ellipse cx="90" cy="1440" rx="180" ry="80" fill="#205335" stroke="#000" strokeWidth="1.5" />
      <ellipse cx="350" cy="1460" rx="190" ry="85" fill="#1C4B30" stroke="#000" strokeWidth="1.5" />
      <ellipse cx="180" cy="1580" rx="220" ry="90" fill="#266440" stroke="#000" strokeWidth="1.5" />
      <ellipse cx="370" cy="1670" rx="210" ry="100" fill="#2F754B" stroke="#000" strokeWidth="1.5" />

      {/* Whispering Lake (y: 1620 - 1760, right side) */}
      <g>
        {/* Sandy beach border */}
        <path
          d="M 285 1630 C 330 1620, 420 1630, 430 1660 C 435 1740, 360 1770, 305 1760 C 265 1750, 255 1670, 285 1630 Z"
          fill="#D4B483"
          stroke="#000"
          strokeWidth="2"
        />
        {/* Lake water body */}
        <path
          d="M 295 1638 C 335 1630, 415 1638, 422 1665 C 426 1730, 360 1756, 315 1748 C 275 1740, 268 1675, 295 1638 Z"
          fill="url(#lakeGrad)"
        />
        {/* Water shimmer rings */}
        <ellipse cx="360" cy="1680" rx="28" ry="8" fill="#7DD3FC" opacity="0.4" />
        <ellipse cx="335" cy="1710" rx="22" ry="6" fill="#7DD3FC" opacity="0.35" />

        {/* Lily pads with lotus flower */}
        <circle cx="320" cy="1665" r="5" fill="#15803D" stroke="#052E16" strokeWidth="1" />
        <circle cx="322" cy="1663" r="2" fill="#F472B6" />
        <circle cx="375" cy="1725" r="6" fill="#15803D" stroke="#052E16" strokeWidth="1" />
        <circle cx="377" cy="1723" r="2.5" fill="#F43F5E" />

        {/* Wooden fishing pier / dock */}
        <rect x="278" y="1678" width="34" height="8" fill="#78350F" stroke="#000" strokeWidth="1.5" />
        <rect x="288" y="1684" width="4" height="8" fill="#451A03" />
        <rect x="304" y="1684" width="4" height="8" fill="#451A03" />

        {/* Small wooden rowboat moored by the pier */}
        <ellipse cx="326" cy="1686" rx="10" ry="4.5" fill="#92400E" stroke="#000" strokeWidth="1.2" />
        <line x1="312" y1="1684" x2="318" y2="1686" stroke="#FEF08A" strokeWidth="1" />
      </g>

      {/* Wildflowers scattered on the meadow */}
      <g>
        {/* Red poppies */}
        {[
          [90, 1420], [135, 1450], [50, 1510], [110, 1570], [70, 1630], [130, 1690], [170, 1650]
        ].map(([fx, fy], i) => (
          <circle key={i} cx={fx} cy={fy} r="2.5" fill="#EF4444" stroke="#7F1D1D" strokeWidth="0.8" />
        ))}
        {/* Gold dandelions */}
        {[
          [115, 1430], [70, 1475], [140, 1530], [85, 1600], [160, 1610], [105, 1665], [145, 1720]
        ].map(([fx, fy], i) => (
          <circle key={i} cx={fx} cy={fy} r="2.2" fill="#FBBF24" stroke="#78350F" strokeWidth="0.8" />
        ))}
        {/* Bluebells */}
        {[
          [60, 1445], [100, 1500], [160, 1550], [125, 1620], [55, 1670], [180, 1705]
        ].map(([fx, fy], i) => (
          <circle key={i} cx={fx} cy={fy} r="2.2" fill="#60A5FA" stroke="#1E3A8A" strokeWidth="0.8" />
        ))}
      </g>

      {/* Adventurer's Camp & Village Crossroads (Starting point, y: 1690 - 1760) */}
      <g>
        {/* Camp canvas tent (A-frame) */}
        <polygon points="120,1745 142,1708 164,1745" fill="#FEF3C7" stroke="#000" strokeWidth="2" />
        {/* Tent entry fold */}
        <polygon points="135,1745 142,1722 149,1745" fill="#78350F" />
        <line x1="142" y1="1708" x2="142" y2="1745" stroke="#92400E" strokeWidth="1.5" />

        {/* Camp Wooden Crates & Barrels */}
        <rect x="104" y="1734" width="12" height="12" fill="#A16207" stroke="#000" strokeWidth="1.5" />
        <line x1="104" y1="1734" x2="116" y2="1746" stroke="#713F12" strokeWidth="1" />
        <rect x="94" y="1738" width="9" height="9" fill="#B45309" stroke="#000" strokeWidth="1.2" />

        {/* Wooden Signpost at Crossroads */}
        <rect x="238" y="1715" width="4" height="28" fill="#78350F" stroke="#000" strokeWidth="1.2" />
        <polygon points="230,1716 256,1716 262,1721 256,1726 230,1726" fill="#B45309" stroke="#000" strokeWidth="1.2" />
        <line x1="234" y1="1721" x2="252" y2="1721" stroke="#FEF3C7" strokeWidth="1" />

        {/* Cozy Campfire */}
        {/* Stones ring */}
        <ellipse cx="200" cy="1742" rx="14" ry="7" fill="#475569" stroke="#000" strokeWidth="1.5" />
        {/* Charcoal logs */}
        <line x1="192" y1="1742" x2="208" y2="1742" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
        <line x1="195" y1="1740" x2="205" y2="1744" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
        {/* Campfire Flame with animated flicker */}
        <g className="flame-anim">
          <polygon points="200,1720 207,1738 193,1738" fill="#F97316" filter="url(#flameGlow)" />
          <polygon points="200,1724 204,1736 196,1736" fill="#FBBF24" />
          <polygon points="200,1728 202,1735 198,1735" fill="#FFFFFF" />
        </g>
        {/* Campfire warmth light puddle */}
        <ellipse cx="200" cy="1742" rx="28" ry="14" fill="#F59E0B" opacity="0.22" filter="url(#flameGlow)" />
      </g>

      {/* ========================================================
          THE ADVENTURE TRAIL (THE HERO'S COBBLESTONE PATH)
          Runs continuously from Campfire (y: 1735) all the way
          to the Castle Portcullis (y: 260)
          ======================================================== */}
      {/* Dirt path underlay */}
      <path
        d="M 200 1735
           C 180 1660, 240 1580, 220 1500
           C 200 1420, 130 1380, 160 1300
           C 180 1250, 220 1245, 250 1235
           C 280 1225, 320 1190, 280 1120
           C 240 1050, 150 990,  190 910
           C 220 840,  150 800,  190 760
           C 230 720,  310 680,  270 600
           C 230 520,  170 460,  215 390
           C 230 350,  215 310,  215 265"
        stroke="#78350F"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Cobblestone path road */}
      <path
        d="M 200 1735
           C 180 1660, 240 1580, 220 1500
           C 200 1420, 130 1380, 160 1300
           C 180 1250, 220 1245, 250 1235
           C 280 1225, 320 1190, 280 1120
           C 240 1050, 150 990,  190 910
           C 220 840,  150 800,  190 760
           C 230 720,  310 680,  270 600
           C 230 520,  170 460,  215 390
           C 230 350,  215 310,  215 265"
        stroke="#D4B483"
        strokeWidth="8"
        fill="none"
        strokeDasharray="6 4"
        strokeLinecap="round"
      />
      {/* Gold path core dots */}
      <path
        d="M 200 1735
           C 180 1660, 240 1580, 220 1500
           C 200 1420, 130 1380, 160 1300
           C 180 1250, 220 1245, 250 1235
           C 280 1225, 320 1190, 280 1120
           C 240 1050, 150 990,  190 910
           C 220 840,  150 800,  190 760
           C 230 720,  310 680,  270 600
           C 230 520,  170 460,  215 390
           C 230 350,  215 310,  215 265"
        stroke="#FDE68A"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="3 7"
        strokeLinecap="round"
      />

      {/* Trail Lantern Posts along the trail */}
      {[
        [215, 1610], [175, 1420], [275, 1140], [170, 840], [250, 560], [225, 330]
      ].map(([lx, ly], i) => (
        <g key={i}>
          {/* Post */}
          <rect x={lx - 1.5} y={ly} width="3" height="14" fill="#334155" stroke="#000" strokeWidth="0.8" />
          {/* Lantern glass */}
          <rect x={lx - 3} y={ly - 5} width="6" height="6" fill="#FBBF24" filter="url(#softGlow)" stroke="#000" strokeWidth="0.8" />
          {/* Light pool on ground */}
          <circle cx={lx} cy={ly + 10} r="10" fill="#FDE047" opacity="0.18" filter="url(#softGlow)" />
        </g>
      ))}
    </svg>
  );
};
