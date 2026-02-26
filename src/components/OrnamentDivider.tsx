export function OrnamentDivider() {
  return (
    <div className="orn-divider" aria-hidden="true">
      <svg viewBox="0 0 800 30" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="15" x2="800" y2="15" stroke="#C8A84B" strokeWidth=".5" opacity=".4" />
        <g fill="#C8A84B" opacity=".6">
          <polygon points="400,4 410,15 400,26 390,15" />
          <polygon points="360,8 368,15 360,22 352,15" />
          <polygon points="440,8 448,15 440,22 432,15" />
          <polygon points="320,11 326,15 320,19 314,15" />
          <polygon points="480,11 486,15 480,19 474,15" />
          <circle cx="280" cy="15" r="2.5" />
          <circle cx="520" cy="15" r="2.5" />
        </g>
      </svg>
    </div>
  );
}
