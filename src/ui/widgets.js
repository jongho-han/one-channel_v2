import { each, escapeHtml, when } from '../core/dom.js';
import { icon } from './icons.js';

/* 화면 공통 부품 ---------------------------------------------------- */
const STATUS_TONE = {
  '정상': 'g', '완료': 'g', '지급완료': 'g', '실행완료': 'g',
  '납입유예': 'a',
  '보완서류 요청': 'r', '연체': 'r', '미납': 'r',
  '접수': 'b', '심사중': 'b', '처리중': 'b',
  '취소': 'n',
};
export const statusChip = status => `<span class="st ${STATUS_TONE[status] || 'n'}">${escapeHtml(status)}</span>`;

export const infoBox = (tone, iconName, html, spacing = '') => `<div class="box ${tone} ${spacing}">${icon(iconName)}<div>${html}</div></div>`;

export const calcBox = rows => `
  <div class="calc num">${each(rows, ([label, value, isTotal]) => `<div class="${isTotal ? 'tot' : ''}"><span>${label}</span><b>${value}</b></div>`)}</div>`;

export const keyValueList = rows => `<dl class="kv">${each(rows, ([key, value]) => `<dt>${escapeHtml(key)}</dt><dd class="num">${escapeHtml(value)}</dd>`)}</dl>`;

/** 다른 화면으로 가는 버튼 줄 (primaryIndex 번째 버튼을 강조) */
export const linkButtons = (links, { spacing = 'mt-18', primaryIndex = 0 } = {}) => `
  <div class="navrow inline ${spacing}">${each(links, ([label, id], index) => `<button class="btn ${index === primaryIndex ? 'pri' : ''}" data-action="open" data-id="${id}">${label}</button>`)}</div>`;

/** 완료 카드: rows = [[항목, 값, 글자형 여부(숫자 정렬 안 함)]] */
export function doneCard({ title, message, rows }) {
  return `
  <div class="card"><div class="donebox">
    <div class="ck">${icon('check')}</div>
    <h2>${title}</h2><p>${message}</p>
    <div class="receipt"><dl class="kv">${each(rows, ([key, value, isText]) => `<dt>${key}</dt><dd${isText ? '' : ' class="num"'}>${value}</dd>`)}</dl></div>
  </div></div>`;
}

export function summaryTiles(tiles) {
  return `
  <dl class="tiles cols" style="--cols:${tiles.length}">
    ${each(tiles, ([label, value], index) => `<div class="tile ${index === 0 ? 'hl' : ''}"><dt>${label}</dt><dd class="num">${value}</dd></div>`)}
  </dl>`;
}

export function stepper(steps, currentIndex) {
  return `
  <ol class="steps" aria-label="진행 단계 (전체 ${steps.length}단계)">
    ${each(steps, (name, index) => {
      const status = index < currentIndex ? 'done' : index === currentIndex ? 'on' : '';
      const spoken = { done: '완료', on: '현재 단계', '': '' }[status];
      return `
      <li class="${status}"${status === 'on' ? ' aria-current="step" id="currentStep"' : ''}>
        <span class="n" aria-hidden="true">${index < currentIndex ? icon('check') : index + 1}</span>${name}${when(spoken, `<span class="sr-only"> (${spoken})</span>`)}
      </li>`; })}
  </ol>`;
}

export function agreementList(items, agreed = []) {
  return `
  <div class="agree checks mt-14" id="agr">
    ${each(items, (text, index) => `<label><input type="checkbox" data-agree="${index}" ${agreed.includes(index) ? 'checked' : ''}><span>${text}</span></label>`)}
  </div>
  <span class="agree-err" id="agrErr" role="alert"></span>`;
}
