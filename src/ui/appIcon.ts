/* 브라우저 탭·홈 화면 아이콘: 흰 바탕 가운데에 iM 심볼 */
import { LOGO_SYMBOL } from './logoSymbol';

export interface AppIconColors { teal: string; mid: string; lime: string; background: string }

const SYMBOL_RATIO = 0.7;   // 아이콘 폭 대비 심볼 폭

export function appIconLayout(size: number): { scale: number; x: number; y: number } {
  const scale = size * SYMBOL_RATIO / LOGO_SYMBOL.width;
  return { scale, x: (size - LOGO_SYMBOL.width * scale) / 2, y: (size - LOGO_SYMBOL.height * scale) / 2 };
}

type IconContext = Pick<CanvasRenderingContext2D, 'fillRect' | 'translate' | 'scale' | 'createLinearGradient'> & { fillStyle: unknown; fill: (path: Path2D) => void };

/** makePath: SVG 경로 → Path2D (테스트에서 바꿔 끼움) */
export function drawAppIcon(ctx: IconContext, size: number, colors: AppIconColors, makePath: (d: string) => Path2D = d => new Path2D(d)): void {
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, size, size);   // 홈 화면은 기기가 모서리를 둥글게 자르므로 바탕을 가득 채움
  const { scale, x, y } = appIconLayout(size);
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = colors.teal;
  ctx.fill(makePath(LOGO_SYMBOL.bar));
  const gradient = ctx.createLinearGradient(LOGO_SYMBOL.gradient.x1, 0, LOGO_SYMBOL.gradient.x2, 0);
  gradient.addColorStop(0, colors.teal);
  gradient.addColorStop(0.5, colors.mid);
  gradient.addColorStop(1, colors.lime);
  ctx.fillStyle = gradient;
  ctx.fill(makePath(LOGO_SYMBOL.arc));
  ctx.fillStyle = colors.teal;
  ctx.fill(makePath(LOGO_SYMBOL.curve));
}
