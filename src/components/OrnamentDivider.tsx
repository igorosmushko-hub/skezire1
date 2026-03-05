export function OrnamentDivider() {
  return (
    <div className="orn-divider" aria-hidden="true">
      <svg viewBox="0 0 800 20" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="10" x2="370" y2="10" stroke="#D4A843" strokeWidth=".5" opacity=".25" />
        <line x1="430" y1="10" x2="800" y2="10" stroke="#D4A843" strokeWidth=".5" opacity=".25" />
        {/* Minimal koshkar-muiiz (ram's horn) motif */}
        <path
          d="M392,10 C392,4 396,2 400,2 C404,2 408,4 408,10 C408,16 404,18 400,18 C396,18 392,16 392,10Z"
          fill="none" stroke="#D4A843" strokeWidth=".8" opacity=".35"
        />
      </svg>
    </div>
  );
}
