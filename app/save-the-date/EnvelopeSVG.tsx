// Server-rendered SVG envelope
export function EnvelopeSVG({ isOpen }: { isOpen?: boolean }) {
  const W = 440;
  const H = 300;
  const flap_depth = 0.55;
  const tip_x = W / 2;
  const tip_y = H * flap_depth;
  
  // Colors with higher contrast
  const c_interior = "rgb(178, 199, 224)";
  const c_side = "rgb(193, 211, 232)";
  const c_bottom = "rgb(199, 216, 236)";
  const c_flap = "rgb(204, 220, 238)";
  const c_line = "rgb(150, 175, 205)";
  
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="envelope-svg"
      style={{ 
        width: '100%', 
        height: 'auto',
        filter: 'drop-shadow(0 8px 16px rgba(60, 80, 110, 0.20))'
      }}
    >
      {/* Interior/back panel */}
      <defs>
        <linearGradient id="interior-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(150, 170, 200)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="rgb(178, 199, 224)" stopOpacity="0" />
        </linearGradient>
        
        {/* Flap shadow */}
        <filter id="flap-shadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
          <feOffset dy="2" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Seal gradient */}
        <radialGradient id="seal-grad" cx="35%" cy="35%">
          <stop offset="0%" stopColor="rgb(143, 159, 82)" />
          <stop offset="100%" stopColor="rgb(102, 116, 54)" />
        </radialGradient>
      </defs>
      
      {/* Background interior */}
      <rect x="0" y="0" width={W} height={H} fill={c_interior} />
      <rect x="0" y="0" width={W} height={H} fill="url(#interior-grad)" />
      
      {/* Left side fold */}
      <polygon
        points={`0,0 0,${H} ${W * 0.43},${H * 0.53}`}
        fill={c_side}
      />
      <line
        x1="0"
        y1="0"
        x2={W * 0.43}
        y2={H * 0.53}
        stroke={c_line}
        strokeWidth="1"
        opacity="0.6"
      />
      
      {/* Right side fold */}
      <polygon
        points={`${W},0 ${W},${H} ${W * 0.57},${H * 0.53}`}
        fill={c_side}
      />
      <line
        x1={W}
        y1="0"
        x2={W * 0.57}
        y2={H * 0.53}
        stroke={c_line}
        strokeWidth="1"
        opacity="0.6"
      />
      
      {/* Bottom fold with shadow */}
      <defs>
        <filter id="bottom-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dy="-2" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon
        points={`0,${H} ${W},${H} ${W / 2},${H * 0.40}`}
        fill={c_bottom}
        filter="url(#bottom-shadow)"
      />
      <line
        x1="0"
        y1={H}
        x2={W / 2}
        y2={H * 0.40}
        stroke={c_line}
        strokeWidth="1"
      />
      <line
        x1={W}
        y1={H}
        x2={W / 2}
        y2={H * 0.40}
        stroke={c_line}
        strokeWidth="1"
      />
      
      {/* Top flap */}
      <g className={isOpen ? "flap-open" : ""}>
        <polygon
          points={`0,0 ${W},0 ${tip_x},${tip_y}`}
          fill={c_flap}
          filter="url(#flap-shadow)"
          style={{
            transformOrigin: `${tip_x}px 0px`,
            WebkitTransformOrigin: `${tip_x}px 0px`,
          }}
        />
        <line
          x1="0"
          y1="0"
          x2={tip_x}
          y2={tip_y}
          stroke={c_line}
          strokeWidth="1"
          style={{
            transformOrigin: `${tip_x}px 0px`,
            WebkitTransformOrigin: `${tip_x}px 0px`,
          }}
        />
        <line
          x1={W}
          y1="0"
          x2={tip_x}
          y2={tip_y}
          stroke={c_line}
          strokeWidth="1"
          style={{
            transformOrigin: `${tip_x}px 0px`,
            WebkitTransformOrigin: `${tip_x}px 0px`,
          }}
        />
      </g>
      
      {/* Wax seal */}
      {!isOpen && (
        <g className="wax-seal" transform={`translate(${tip_x - 32}, ${tip_y - 32})`}>
          {/* Wobbly circle path */}
          <path
            d="M32,0 C34.5,0.8 36.8,2.2 38.8,4.1 C42.5,7.5 45,12 45.5,17 C45.8,20 45.3,22.8 44,25.5 C42,29.5 38.5,32.8 34,34.8 C30.5,36.3 26.5,36.8 22.5,36 C18,35 14,32.5 11,28.8 C8.5,25.5 7,21.5 7,17 C7,12.2 9,7.8 12.2,4.5 C15.5,1.2 20,0 24.5,0.2 C27,0.3 29.5,0.5 32,0 Z"
            fill="url(#seal-grad)"
            filter="drop-shadow(0 3px 3px rgba(40,50,30,0.4))"
          />
          
          {/* Inner embossed ring */}
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="rgba(200,214,150,0.3)"
            strokeWidth="1"
          />
          <circle
            cx="32"
            cy="32.5"
            r="26"
            fill="none"
            stroke="rgba(78,90,40,0.5)"
            strokeWidth="1"
          />
          
          {/* Monogram text */}
          <text
            x="32"
            y="37"
            textAnchor="middle"
            fontFamily="'Great Vibes', cursive"
            fontSize="20"
            fill="rgba(60,70,30,0.3)"
          >
            E &amp; R
          </text>
          <text
            x="32"
            y="36"
            textAnchor="middle"
            fontFamily="'Great Vibes', cursive"
            fontSize="20"
            fill="rgb(248,242,222)"
          >
            E &amp; R
          </text>
        </g>
      )}
    </svg>
  );
}
