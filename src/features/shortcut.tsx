/* 바탕화면·홈 화면 바로가기 */
import { ShortcutGuide, type ShortcutTab } from '../components/modal/ShortcutGuide';
import { APP } from '../core/config';
import { isNarrowScreen } from '../core/dom';
import { saveFile } from '../core/download';
import { openModal } from '../ui/modal';
import { toast } from '../ui/overlay';

/** 브라우저 설치 창 (beforeinstallprompt) — 표준 타입이 없어 필요한 부분만 정의 */
export interface InstallPromptEvent extends Event { prompt: () => Promise<void> }

const device = {
  isIOS:     () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  isAndroid: () => /Android/.test(navigator.userAgent),
};
export const shortcut: { iconPng: string; installPrompt: InstallPromptEvent | null } = {
  iconPng: '',
  installPrompt: null,   // 운영(HTTPS + 웹앱 매니페스트)에서 크롬·엣지·안드로이드 설치 창 호출용
};

/** 홈 화면 아이콘(PNG)을 그려 apple-touch-icon · favicon으로 등록 */
export function registerAppIcon(): void {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#00754A';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') ctx.roundRect(0, 0, 180, 180, 40);
    else ctx.rect(0, 0, 180, 180);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '800 78px "Pretendard Variable",Pretendard,"Apple SD Gothic Neo",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('iM', 90, 94);
    shortcut.iconPng = canvas.toDataURL('image/png');

    for (const rel of ['apple-touch-icon', 'icon']) {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = shortcut.iconPng;
      document.head.appendChild(link);
    }
  } catch { /* 아이콘을 못 그려도 기능은 계속 */ }
}

/** 바로가기가 열 주소: 지금 보고 있는 사이버창구(웹·파일). 알 수 없으면 설정 주소 */
export function shortcutTarget(href: string, fallback: string): string {
  return /^(https?|file):/.test(href) ? href.split('#')[0] : fallback;
}
const escapeXml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const currentTarget = () => shortcutTarget(location.href, APP.shortcut.url);

/** PC 바탕화면용 바로가기 파일 내려받기 (Windows .url / Mac .webloc) */
export function downloadShortcut(kind: string): void {
  const { name } = APP.shortcut;
  const url = currentTarget();
  const isMac = kind === 'mac';
  const body = isMac
    ? `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>URL</key><string>${escapeXml(url)}</string></dict></plist>\n`
    : `[InternetShortcut]\r\nURL=${url}\r\nIconIndex=0\r\n`;

  saveFile(name + (isMac ? '.webloc' : '.url'), body, isMac ? 'application/xml' : 'application/octet-stream');
  toast('바로가기 파일을 내려받았습니다. 바탕화면으로 옮겨 주세요.');
}

export function openShortcutGuide(tab: ShortcutTab = defaultShortcutTab()): void {
  openModal(<ShortcutGuide tab={tab} name={APP.shortcut.name} url={currentTarget()} iconPng={shortcut.iconPng} canInstall={Boolean(shortcut.installPrompt)} />);
}

function defaultShortcutTab(): ShortcutTab {
  if (device.isIOS()) return 'ios';
  if (device.isAndroid() || isNarrowScreen()) return 'and';
  return 'pc';
}
