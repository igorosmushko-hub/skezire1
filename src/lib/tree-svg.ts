import { escapeXML } from '@/lib/escapeXml';

export interface TreeSVGNode {
  kaz: string;
  label: string;
  name: string;
  isUser?: boolean;
}

export function buildTreeSVG(nodes: TreeSVGNode[], unknownLabel: string): string {
  const W     = 560;
  const nodeW = 220;
  const nodeH = 60;
  const gapV  = 44;
  const padT  = 28;
  const cx    = W / 2;
  const totalH = nodes.length * (nodeH + gapV) - gapV + padT * 2;
  const unknownText = unknownLabel;

  const defs = `
    <defs>
      <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#2B6FD4"/>
        <stop offset="100%" stop-color="#002A74"/>
      </linearGradient>
      <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stop-color="#E8C96A"/>
        <stop offset="100%" stop-color="#7A5E18"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  `;

  let shapes = '';

  nodes.forEach((node, i) => {
    const x    = cx - nodeW / 2;
    const y    = padT + i * (nodeH + gapV);
    const midY = y + nodeH / 2;
    const isUser  = node.isUser === true;
    const hasFill = !!node.name;
    const delay   = (i * 0.06).toFixed(2);

    // Connector
    if (i < nodes.length - 1) {
      const y1 = y + nodeH, y2 = y + nodeH + gapV - 8, yA = y2 + 8;
      const op = hasFill ? '.75' : '.28';
      const da = hasFill ? '' : 'stroke-dasharray="6 4"';
      shapes += `
        <line x1="${cx}" y1="${y1}" x2="${cx}" y2="${y2}"
              stroke="#C8A84B" stroke-width="2" opacity="${op}" ${da}/>
        <polygon points="${cx},${yA} ${cx-5},${y2} ${cx+5},${y2}"
                 fill="#C8A84B" opacity="${op}"/>
      `;
    }

    // Background rect
    let fill: string, stroke: string, strokeW: string, dash: string;
    if (isUser)       { fill = 'url(#gGold)'; stroke = '#E8C96A'; strokeW = '1.5'; dash = ''; }
    else if (hasFill) { fill = 'url(#gBlue)'; stroke = '#3B6FDB'; strokeW = '1.5'; dash = ''; }
    else              { fill = '#F2EEF8';      stroke = '#C0B4D8'; strokeW = '1';   dash = 'stroke-dasharray="5 3"'; }

    shapes += `
      <rect class="tree-node" x="${x}" y="${y}" width="${nodeW}" height="${nodeH}" rx="10"
            fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" ${dash}
            style="animation-delay:${delay}s"
            ${isUser && hasFill ? 'filter="url(#glow)"' : ''}/>
    `;

    // Generation label
    const lblColor = isUser
      ? 'rgba(60,30,0,.7)'
      : hasFill ? 'rgba(200,168,75,.85)' : 'rgba(160,150,180,.7)';
    shapes += `
      <text x="${x+12}" y="${y+18}" font-size="9" font-weight="800" letter-spacing="0.5"
            fill="${lblColor}" font-family="Inter,sans-serif">
        ${node.kaz.toUpperCase()}
      </text>
    `;

    // Name
    const nameColor = isUser ? '#1A0A00' : (hasFill ? '#FFFFFF' : '#B0A8C8');
    const nameW     = hasFill ? '600' : '400';
    const nameStr   = node.name || unknownText;
    const fSize     = nameStr.length > 22 ? 12 : 15;
    shapes += `
      <text x="${cx}" y="${midY+7}" text-anchor="middle"
            font-size="${fSize}" font-weight="${nameW}"
            fill="${nameColor}" font-family="Georgia,'Times New Roman',serif">
        ${escapeXML(nameStr)}
      </text>
    `;

    // Decorative ornament
    if (isUser) {
      shapes += `<text x="${x+nodeW-18}" y="${midY+7}" font-size="14"
                       fill="rgba(50,25,0,.4)" text-anchor="middle">\u2605</text>`;
    } else if (hasFill) {
      shapes += `<text x="${x+nodeW-18}" y="${midY+7}" font-size="13"
                       fill="rgba(200,168,75,.38)" text-anchor="middle">\u2726</text>`;
    }
  });

  return `
    <svg viewBox="0 0 ${W} ${totalH}" width="100%" style="max-width:${W}px"
         xmlns="http://www.w3.org/2000/svg" role="img" aria-label="\u0428\u0435\u0436\u0456\u0440\u0435 \u0430\u0493\u0430\u0448\u044B">
      ${defs}${shapes}
    </svg>
  `;
}
