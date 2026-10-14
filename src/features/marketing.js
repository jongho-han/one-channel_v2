import { each } from '../core/dom.js';
import { MARKETING_CONSENTS } from '../data/consentRepository.js';

export function marketingConsentBody() {
  return `
  <div class="card"><h2>마케팅 활용 동의 현황</h2>
    ${each(MARKETING_CONSENTS, ([name, date, agreed], index) => `
      <div class="toggle-row">
        <div><b>${name}</b><small>${agreed ? '동의일 ' + date : '미동의'}</small></div>
        <label class="tg"><input type="checkbox" id="mk${index}" ${agreed ? 'checked' : ''} aria-label="${name}"><span></span></label>
      </div>`)}
  </div><div id="frm"></div>`;
}
