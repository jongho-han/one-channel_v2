/* 바탕화면·홈 화면 바로가기 */
import { ShortcutGuide, type ShortcutTab } from '../components/modal/ShortcutGuide';
import { APP } from '../core/config';
import { isNarrowScreen } from '../core/dom';
import { saveFile } from '../core/download';
import { zipFiles } from '../core/zip';
import { drawAppIcon } from '../ui/appIcon';
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

/** 홈 화면 아이콘(PNG)을 그려 apple-touch-icon · favicon으로 등록 (iM 심볼, 색은 app.css 로고 토큰) */
export function registerAppIcon(): void {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    drawAppIcon(ctx, 180, { teal: token('--logo-teal'), mid: token('--logo-mid'), lime: token('--logo-lime'), background: token('--card') });
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

/**
 * PC 바탕화면용 바로가기 파일
 * - Windows: 크롬·엣지는 웹에서 받는 .url 을 보안상 '.url.download' 로 바꿔 저장하므로 zip 에 담아 준다
 * - Mac: .webloc (사파리가 형식에 맞춰 확장자를 덧붙이지 않도록 octet-stream)
 */
export function shortcutFile(kind: string, name: string, url: string): { name: string; body: BlobPart; type: string } {
  if (kind === 'mac') {
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>URL</key><string>${escapeXml(url)}</string></dict></plist>\n`;
    return { name: name + '.webloc', body, type: 'application/octet-stream' };
  }
  const zip = zipFiles([{ name: name + '.url', body: `[InternetShortcut]\r\nURL=${url}\r\nIconIndex=0\r\n` }]);
  return { name: name + '.zip', body: zip as Uint8Array<ArrayBuffer>, type: 'application/zip' };
}

/** PC 바탕화면용 바로가기 파일 내려받기 */
export function downloadShortcut(kind: string): void {
  const file = shortcutFile(kind, APP.shortcut.name, currentTarget());
  saveFile(file.name, file.body, file.type);
  toast(kind === 'mac' ? '바로가기 파일을 내려받았습니다. 바탕화면으로 옮겨 주세요.' : '바로가기 압축 파일을 내려받았습니다. 압축 파일 안의 바로가기를 바탕화면으로 옮겨 주세요.');
}

export function openShortcutGuide(tab: ShortcutTab = defaultShortcutTab()): void {
  openModal(<ShortcutGuide tab={tab} name={APP.shortcut.name} url={currentTarget()} iconPng={shortcut.iconPng} canInstall={Boolean(shortcut.installPrompt)} />);
}

function defaultShortcutTab(): ShortcutTab {
  if (device.isIOS()) return 'ios';
  if (device.isAndroid() || isNarrowScreen()) return 'and';
  return 'pc';
}
