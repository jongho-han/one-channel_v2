import { APP } from '../core/config';
import { saveFile } from '../core/download.js';
import { each, isNarrowScreen, when } from '../core/dom.js';
import { openModal, toast } from '../ui/overlay.js';

/* 바탕화면·홈 화면 바로가기 */
const device = {
  isIOS:     () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  isAndroid: () => /Android/.test(navigator.userAgent),
};
export const shortcut = {
  iconPng: '',
  installPrompt: null,   // 운영(HTTPS + 웹앱 매니페스트)에서 크롬·엣지·안드로이드 설치 창 호출용
};

/** 홈 화면 아이콘(PNG)을 그려 apple-touch-icon · favicon으로 등록 */
export function registerAppIcon() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 180;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00754A';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(0, 0, 180, 180, 40);
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

/** PC 바탕화면용 바로가기 파일 내려받기 (Windows .url / Mac .webloc) */
export function downloadShortcut(kind) {
  const { name, url } = APP.shortcut;
  const isMac = kind === 'mac';
  const body = isMac
    ? `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>URL</key><string>${url}</string></dict></plist>\n`
    : `[InternetShortcut]\r\nURL=${url}\r\nIconIndex=0\r\n`;

  saveFile(name + (isMac ? '.webloc' : '.url'), body, isMac ? 'application/xml' : 'application/octet-stream');
  toast('바로가기 파일을 내려받았습니다. 바탕화면으로 옮겨 주세요.');
}

export function openShortcutGuide(tab = defaultShortcutTab()) {
  const { name, url } = APP.shortcut;
  const appIcon = `<div class="sc-icon">${when(shortcut.iconPng, `<img src="${shortcut.iconPng}" alt="">`)}<div><b>${name}</b><small>${url}</small></div></div>`;
  const guides = {
    pc: `
      ${appIcon}
      <div class="navrow inline mt-0">
        <button class="btn pri" data-action="download-shortcut" data-kind="win">Windows용 바로가기 받기</button>
        <button class="btn" data-action="download-shortcut" data-kind="mac">Mac용 받기</button>
      </div>
      <ol class="sc-steps"><li>버튼을 누르면 '${name}' 바로가기 파일이 다운로드 폴더에 저장됩니다.</li><li>파일을 바탕화면으로 끌어다 놓으세요.</li><li>바탕화면 아이콘을 두 번 누르면 사이버창구 메인이 바로 열립니다.</li></ol>`,
    ios: `
      ${appIcon}
      <ol class="sc-steps"><li>Safari에서 사이버창구를 연 상태로 화면 아래 <b>공유 버튼(□↑)</b>을 누르세요.</li><li>목록에서 <b>'홈 화면에 추가'</b>를 고르세요.</li><li>이름이 '${name}'인지 확인하고 <b>'추가'</b>를 누르세요.</li></ol>`,
    and: `
      ${appIcon}
      ${when(shortcut.installPrompt, '<button class="btn pri block" data-action="install-app">홈 화면에 바로 추가</button>')}
      <ol class="sc-steps"><li>Chrome 오른쪽 위 <b>메뉴(⋮)</b>를 누르세요.</li><li><b>'홈 화면에 추가'</b>를 누르세요.</li><li><b>'추가'</b>를 누르면 홈 화면에 아이콘이 생깁니다.</li></ol>`,
  };
  const tabs = [['pc', 'PC'], ['ios', '아이폰'], ['and', '안드로이드']];

  openModal(`
    <h2>${tab === 'pc' ? '바탕화면에 바로가기 추가' : '홈 화면에 바로가기 추가'}</h2>
    <p>아이콘을 누르면 사이버창구 메인으로 바로 이동합니다.</p>
    <div class="seg block tabs mb-4" role="group" aria-label="기기 선택">${each(tabs, ([key, label]) => `<button class="${key === tab ? 'on' : ''}" aria-pressed="${key === tab}" data-action="shortcut-tab" data-tab="${key}">${label}</button>`)}</div>
    ${guides[tab]}
    <button class="btn block mt-16" data-action="close-modal">닫기</button>`);
}

function defaultShortcutTab() {
  if (device.isIOS()) return 'ios';
  if (device.isAndroid() || isNarrowScreen()) return 'and';
  return 'pc';
}
