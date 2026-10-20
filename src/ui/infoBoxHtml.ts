import { icon } from './icons.js';

/** 안내 박스 HTML — 모달처럼 HTML 문자열로 그리는 곳에서 사용 (화면 본문은 React InfoBox) */
export const infoBoxHtml = (tone: string, iconName: string, html: string): string =>
  `<div class="box ${tone} ">${icon(iconName)}<div>${html}</div></div>`;
