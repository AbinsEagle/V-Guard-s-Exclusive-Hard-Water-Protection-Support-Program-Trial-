// Generates a full A4-proportioned consent certificate as a PNG data URI.
// Pure canvas drawing — no external libraries, no React imports.
// Web-only: returns '' immediately when document is undefined (native env).

interface ConsentDocParams {
  customerName:     string;
  whatsApp:         string;
  pincode:          string;
  timestamp:        string;          // ISO string
  signatureDataUri: string | null;
  heaterSerial?:    string;
  cartridgeNumber?: string;
}

const SCALE = 2;                     // render at 2× for crisp output on high-DPI screens
const W  = 794;
const H  = 1200;
const MX = 40;                       // horizontal margin (logical pixels)
const CW = W - MX * 2;              // content width = 714

// ─── Colors (hardcoded — no theme import so this works outside React) ─────────

const C = {
  dark:       '#1A1A1A',
  amber:      '#F5A623',
  amberLight: '#FFF4DC',
  white:      '#FFFFFF',
  green:      '#34C759',
  grey:       '#636366',
  greyLight:  '#F2F2F7',
  border:     '#C6C6C8',
  canvas:     '#FAFAFA',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setFont(ctx: CanvasRenderingContext2D, size: number, bold = false) {
  ctx.font = `${bold ? 'bold ' : ''}${size}px system-ui, -apple-system, Arial, sans-serif`;
}

// Draws (or just measures if draw=false) wrapped text. Returns Y after last line.
function textBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  draw = true,
): number {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      if (draw) ctx.fillText(line.trimEnd(), x, curY);
      line  = word + ' ';
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line.trim()) {
    if (draw) ctx.fillText(line.trimEnd(), x, curY);
    curY += lineHeight;
  }
  return curY;
}

// Same as textBlock but draw=false — just measures height
function measureBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
): number {
  return textBlock(ctx, text, 0, 0, maxWidth, lineHeight, false);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateConsentDocument(params: ConsentDocParams): Promise<string> {
  // Guard: canvas API requires a browser environment
  if (typeof document === 'undefined') return '';

  const {
    customerName, whatsApp, pincode, timestamp,
    signatureDataUri, heaterSerial, cartridgeNumber,
  } = params;

  const formattedDate = (() => {
    try {
      return new Date(timestamp).toLocaleString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  })();

  const canvas = (document as any).createElement('canvas') as HTMLCanvasElement;
  canvas.width  = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.scale(SCALE, SCALE);

  ctx.textBaseline = 'top';

  // ── White background ──────────────────────────────────────────────────────
  ctx.fillStyle = C.white;
  ctx.fillRect(0, 0, W, H);

  let y = 0;

  // ── HEADER BAR ──────────────────────────────────────────────────────────
  ctx.fillStyle = C.dark;
  ctx.fillRect(0, y, W, 90);

  // Amber accent bar at top
  ctx.fillStyle = C.amber;
  ctx.fillRect(0, y, W, 4);

  // V-GUARD title
  setFont(ctx, 22, true);
  ctx.fillStyle = C.white;
  ctx.textAlign = 'left';
  ctx.fillText('V-GUARD', MX, y + 18);

  setFont(ctx, 11);
  ctx.fillStyle = C.amber;
  ctx.fillText('INDUSTRIES LTD', MX, y + 44);

  setFont(ctx, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText('HARD WATER PROTECTION PROGRAM', MX, y + 64);

  // Shield accent (filled amber rectangle top-right)
  ctx.fillStyle = C.amber;
  ctx.fillRect(W - MX - 40, y + 18, 40, 52);
  ctx.fillStyle = C.dark;
  setFont(ctx, 9, true);
  ctx.textAlign = 'center';
  ctx.fillText('TRIAL', W - MX - 20, y + 39);
  ctx.textAlign = 'left';

  y += 90;

  // ── TITLE BAND ───────────────────────────────────────────────────────────
  ctx.fillStyle = C.amber;
  ctx.fillRect(0, y, W, 46);

  setFont(ctx, 14, true);
  ctx.fillStyle = C.dark;
  ctx.textAlign = 'center';
  ctx.fillText('CUSTOMER CONSENT & DECLARATION', W / 2, y + 16);
  ctx.textAlign = 'left';

  y += 46 + 20;

  // ── DISCLAIMER CARD ───────────────────────────────────────────────────────
  const disclaimerBody =
    'This installation is part of the V-Guard exclusive hard water protection trial program. ' +
    'Product performance may vary based on local water quality, installation conditions, and ' +
    'usage patterns. This product is intended for evaluation purposes only and is not a commercial sale.';

  setFont(ctx, 11);
  const disclaimerBodyH = measureBlock(ctx, disclaimerBody, CW - 20, 17) + 16;
  const disclaimerCardH = 20 + disclaimerBodyH + 8;

  ctx.fillStyle = C.amberLight;
  ctx.fillRect(MX, y, CW, disclaimerCardH);
  ctx.fillStyle = C.amber;
  ctx.fillRect(MX, y, 3, disclaimerCardH);

  setFont(ctx, 11, true);
  ctx.fillStyle = C.dark;
  ctx.fillText('DISCLAIMER', MX + 12, y + 8);

  setFont(ctx, 11);
  ctx.fillStyle = C.grey;
  textBlock(ctx, disclaimerBody, MX + 12, y + 24, CW - 20, 17);

  y += disclaimerCardH + 18;

  // ── AGREEMENT ITEMS ───────────────────────────────────────────────────────
  setFont(ctx, 11, true);
  ctx.fillStyle = C.dark;
  ctx.fillText('BY PROCEEDING, I CONFIRM THAT:', MX, y);
  y += 18;

  // Amber underline
  ctx.fillStyle = C.amber;
  ctx.fillRect(MX, y, 160, 2);
  y += 10;

  const agreements = [
    'I agree to participate in the V-Guard trial installation program.',
    'I allow the installation of the anti-scalant cartridge and collection of usage data.',
    'I allow photographs of the product and installation to be recorded (no photographs of persons will be taken).',
    'I understand that product performance may vary based on local water quality and conditions.',
    'I understand there are no guaranteed performance outcomes from this trial.',
    'I understand that V-Guard may contact me for feedback during the trial period.',
    "I understand that factors outside V-Guard's control (water quality, maintenance, and usage patterns) may affect results, and V-Guard is not liable for such outcomes.",
    'I understand this product is intended for evaluation purposes only and is not for medical use.',
  ];

  setFont(ctx, 11);
  for (const item of agreements) {
    // Green checkbox square
    ctx.fillStyle = C.green;
    ctx.fillRect(MX, y + 2, 10, 10);
    // Checkmark
    ctx.fillStyle = C.white;
    setFont(ctx, 8, true);
    ctx.fillText('✓', MX + 1, y + 2);
    setFont(ctx, 11);

    ctx.fillStyle = C.dark;
    const nextY = textBlock(ctx, item, MX + 18, y, CW - 18, 16);
    y = nextY + 5;
  }

  y += 8;

  // ── CUSTOMER INFORMATION ──────────────────────────────────────────────────
  setFont(ctx, 11, true);
  ctx.fillStyle = C.dark;
  ctx.fillText('CUSTOMER INFORMATION', MX, y);
  ctx.fillStyle = C.amber;
  ctx.fillRect(MX, y + 15, 120, 2);
  y += 22;

  const infoRows: [string, string][] = [
    ['Customer Name', customerName || '—'],
    ['WhatsApp', '+91 ' + (whatsApp || '—')],
    ['Pincode', pincode || '—'],
    ['Heater Serial No.', heaterSerial || '—'],
    ['Cartridge No.', cartridgeNumber || '—'],
    ['Consent Date & Time', formattedDate],
  ];

  const ROW_H = 28;
  for (let i = 0; i < infoRows.length; i++) {
    const [label, value] = infoRows[i];
    if (i % 2 === 0) {
      ctx.fillStyle = C.greyLight;
      ctx.fillRect(MX, y, CW, ROW_H);
    }
    setFont(ctx, 11);
    ctx.fillStyle = C.grey;
    ctx.textAlign = 'left';
    ctx.fillText(label, MX + 8, y + 9);
    setFont(ctx, 11, true);
    ctx.fillStyle = C.dark;
    ctx.textAlign = 'right';
    ctx.fillText(value, MX + CW - 8, y + 9);
    y += ROW_H;
  }
  ctx.textAlign = 'left';
  y += 16;

  // ── DIGITAL SIGNATURE ─────────────────────────────────────────────────────
  setFont(ctx, 11, true);
  ctx.fillStyle = C.dark;
  ctx.fillText('DIGITAL SIGNATURE', MX, y);
  ctx.fillStyle = C.amber;
  ctx.fillRect(MX, y + 15, 100, 2);
  y += 22;

  const SIG_BOX_H = 130;
  // Box background
  ctx.fillStyle = C.canvas;
  ctx.fillRect(MX, y, CW, SIG_BOX_H);
  // Box border
  ctx.strokeStyle = C.border;
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(MX + 0.75, y + 0.75, CW - 1.5, SIG_BOX_H - 1.5);

  if (signatureDataUri) {
    await new Promise<void>((resolve) => {
      const img = new (window as any).Image() as HTMLImageElement;
      img.onload  = () => {
        ctx.drawImage(img, MX + 8, y + 8, CW - 16, SIG_BOX_H - 16);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = signatureDataUri;
    });
  } else {
    setFont(ctx, 11);
    ctx.fillStyle = C.border;
    ctx.textAlign = 'center';
    ctx.fillText('No signature captured', W / 2, y + SIG_BOX_H / 2 - 6);
    ctx.textAlign = 'left';
  }

  y += SIG_BOX_H + 20;

  // ── FOOTER ────────────────────────────────────────────────────────────────
  // Light separator line
  ctx.strokeStyle = C.border;
  ctx.lineWidth   = 0.5;
  ctx.beginPath();
  ctx.moveTo(MX, y);
  ctx.lineTo(W - MX, y);
  ctx.stroke();
  y += 12;

  setFont(ctx, 10);
  ctx.fillStyle = C.border;
  ctx.textAlign = 'center';
  ctx.fillText(
    'This consent is captured digitally as part of the V-Guard Trial Program.',
    W / 2, y,
  );
  ctx.fillText(`Document generated: ${formattedDate}`, W / 2, y + 14);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}
