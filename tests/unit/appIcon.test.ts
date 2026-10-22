/* 브라우저 탭·홈 화면 아이콘: 흰 바탕 가운데에 iM 심볼 (헤더 로고와 같은 도형) */
import { appIconLayout, drawAppIcon } from '../../src/ui/appIcon';
import { LOGO_SYMBOL } from '../../src/ui/logoSymbol';

test('appIconLayout: 심볼 폭은 아이콘의 70%, 가운데 정렬', () => {
  const { scale, x, y } = appIconLayout(180);
  expect(LOGO_SYMBOL.width * scale).toBeCloseTo(126);
  expect(x).toBeCloseTo(27);
  expect(y).toBeCloseTo((180 - LOGO_SYMBOL.height * scale) / 2);
});

test('drawAppIcon: 흰 바탕 → 막대·호(단색) + 가운데 호(그라데이션) 3개 도형', () => {
  const calls: string[] = [];
  const gradient = { stops: [] as [number, string][], addColorStop(offset: number, color: string) { this.stops.push([offset, color]); } };
  const ctx = {
    fillStyle: '' as unknown,
    fillRect: (...args: number[]) => calls.push(`fillRect ${args.join(',')} ${String(ctx.fillStyle)}`),
    translate: (x: number, y: number) => calls.push(`translate ${x.toFixed(1)},${y.toFixed(1)}`),
    scale: (sx: number) => calls.push(`scale ${sx.toFixed(3)}`),
    createLinearGradient: (...args: number[]) => { calls.push(`gradient ${args.join(',')}`); return gradient; },
    fill: (path: string) => calls.push(`fill ${path === LOGO_SYMBOL.arc ? 'arc' : path === LOGO_SYMBOL.bar ? 'bar' : 'curve'} ${ctx.fillStyle === gradient ? 'gradient' : String(ctx.fillStyle)}`),
  };
  drawAppIcon(ctx as never, 180, { teal: '#00C4A6', mid: '#61D687', lime: '#DFEE5F', background: '#fff' }, d => d as never);
  expect(calls).toEqual([
    'fillRect 0,0,180,180 #fff',
    'translate 27.0,58.5',
    `scale ${(126 / LOGO_SYMBOL.width).toFixed(3)}`,
    'fill bar #00C4A6',
    `gradient ${LOGO_SYMBOL.gradient.x1},0,${LOGO_SYMBOL.gradient.x2},0`,
    'fill arc gradient',
    'fill curve #00C4A6',
  ]);
  expect(gradient.stops).toEqual([[0, '#00C4A6'], [0.5, '#61D687'], [1, '#DFEE5F']]);
});
