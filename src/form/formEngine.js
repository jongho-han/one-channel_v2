import { AUTOCOMPLETE } from '../components/form/fieldSpec';
import { $, $$, each, escapeHtml, focusElement, when } from '../core/dom.js';
import { formatWon, toNumber } from '../core/format';
import { ZIP_SAMPLES } from '../data/addressRepository.js';
import { ACCOUNTS } from '../data/customerRepository';
import { NOT_APPLICABLE } from '../features/annuity.js';
import { icon } from '../ui/icons.js';
import { announce, closeModal, openModal } from '../ui/overlay.js';
import { calcBox } from '../ui/widgets.js';
import { validationMessage } from './validation';

/* 폼 엔진 ============================================================= */
/*  필드 정의 예: { id:'amt', label:'인출 금액', type:'money', max:5210000, min:100000, quick:[100000,'max'] }
    type: text(기본) · tel · email · date · select · radio · checks · money · account · file · addr
    optional: true 이면 필수 아님                                                         */


/** 입력칸 하나: 레이블 · 필수 표시(별표 + 글자) · 도움말 · 오류 문구를 서로 연결 (KWCAG 25 · 26번) */
/** 조건부 항목: showWhen { field, value } — 다른 항목 값이 맞을 때만 보이고 검증함 */
const currentFieldValue = (field, values) => values[field.id] ?? field.value ?? (field.type === 'radio' ? field.options[0] : '');
export function isFieldVisible(field, fields, values) {
  if (!field.showWhen) return true;
  const source = fields.find(item => item.id === field.showWhen.field);
  return !source || currentFieldValue(source, values) === field.showWhen.value;
}

export function renderField(field, values, fields = []) {
  const value = values[field.id] ?? field.value ?? '';
  const required = field.optional ? '' : '<span class="req" aria-hidden="true">*</span><span class="sr-only">(필수)</span>';
  const isGroup = ['radio', 'checks', 'addr'].includes(field.type);
  const label = isGroup
    ? `<span class="lb" id="lb-${field.id}">${field.label}${required}</span>`
    : `<label for="${field.id}">${field.label}${required}</label>`;

  return `
  <div class="fld${field.wide ? ' wide' : ''}" data-f="${field.id}"${isFieldVisible(field, fields, values) ? '' : ' hidden'}>
    ${label}
    ${fieldControl(field, value, values)}
    ${when(field.help, `<span class="help" id="h-${field.id}">${field.help}</span>`)}
    <span class="err" id="e-${field.id}" role="alert"></span>
  </div>`;
}

/** 입력 요소 공통 속성: 필수 · 설명 연결 · 자동완성 */
function fieldAttributes(field, extraDescribedBy = '') {
  const describedBy = [field.help && `h-${field.id}`, `e-${field.id}`, extraDescribedBy].filter(Boolean).join(' ');
  const autocomplete = AUTOCOMPLETE[field.id] ? ` autocomplete="${AUTOCOMPLETE[field.id]}"` : '';
  return `${field.optional ? '' : 'aria-required="true"'} aria-describedby="${describedBy}"${autocomplete}`;
}

function fieldControl(field, value, values) {
  const { id } = field;
  switch (field.type) {
    case 'select':
      return `<select class="inp" id="${id}" name="${id}" ${fieldAttributes(field)}>${when(field.placeholder, `<option value="" ${value ? '' : 'selected'}>${field.placeholder}</option>`)}${each(field.options, option => `<option ${value === option ? 'selected' : ''}>${option}</option>`)}</select>`;

    case 'account':
      return `<select class="inp" id="${id}" name="${id}" ${fieldAttributes(field)}>${each(ACCOUNTS, option => `<option ${value === option ? 'selected' : ''}>${option}</option>`)}<option>다른 본인 계좌 등록</option></select>`;

    case 'radio':
      return `<div class="radios" role="radiogroup" aria-labelledby="lb-${id}" aria-describedby="${field.help ? `h-${id} ` : ''}e-${id}">${each(field.options, option =>
        `<label><input type="radio" name="${id}" value="${escapeHtml(option)}" ${(value || field.options[0]) === option ? 'checked' : ''}>${option}</label>`)}</div>`;

    case 'checks': {
      const checked = Array.isArray(value) ? value : field.value || [];
      return `<div class="checks${field.inline ? ' inline' : ''}" role="group" aria-labelledby="lb-${id}" aria-describedby="${field.help ? `h-${id} ` : ''}e-${id}">${each(field.options, option =>
        `<label><input type="checkbox" name="${id}" value="${escapeHtml(option)}" ${checked.includes(option) ? 'checked' : ''}><span>${option}</span></label>`)}</div>`;
    }

    case 'money':
      return `
        <div class="money"><input class="inp num" id="${id}" name="${id}" inputmode="numeric" value="${value ? Number(value).toLocaleString() : ''}" placeholder="0" data-money data-max="${field.max || ''}" ${fieldAttributes(field)}><span class="u" aria-hidden="true">원</span></div>
        ${field.quick ? `<div class="chips quick-amounts">${each(field.quick, amount =>
          `<button type="button" class="chip" data-add="${amount}" data-for="${id}" aria-label="${amount === 'max' ? '최대 금액 입력' : `+${amount / 10000}만 (${(amount / 10000).toLocaleString()}만원 더하기)`}">${amount === 'max' ? '최대' : `+${amount / 10000}만`}</button>`)}</div>` : ''}`;

    case 'file':
      return `
        <label class="file-drop" for="${id}">${icon('upload')}<b>사진 찍기 또는 파일 선택</b><small>${field.placeholder || 'JPG·PNG·PDF, 최대 20장'}</small><input type="file" id="${id}" name="${id}" multiple accept="image/*,.pdf" ${fieldAttributes(field, `fl-${id}`)}></label>
        <div class="files" id="fl-${id}" aria-live="polite"></div>`;

    case 'addr':
      return `
        <div class="inrow"><input class="inp num zip" id="${id}_zip" name="${id}_zip" value="${escapeHtml(values[id + '_zip'] ?? field.zip ?? '')}" readonly aria-label="${field.label} 우편번호" autocomplete="postal-code"><button type="button" class="btn" data-zip="${id}" aria-label="${field.label} 우편번호 검색">우편번호 검색</button></div>
        <input class="inp" id="${id}" name="${id}" value="${escapeHtml(value)}" aria-label="${field.label} 기본주소" autocomplete="street-address" ${field.optional ? '' : 'aria-required="true"'} aria-describedby="e-${id}">
        <input class="inp" id="${id}_d" name="${id}_d" placeholder="상세주소" value="${escapeHtml(values[id + '_d'] ?? '')}" aria-label="${field.label} 상세주소" autocomplete="address-line2">`;

    default:
      return `<input class="inp ${field.numeric ? 'num' : ''}" type="${field.type || 'text'}" id="${id}" name="${id}" value="${escapeHtml(value)}" placeholder="${field.placeholder || ''}" ${field.type === 'tel' ? 'inputmode="tel"' : ''} ${fieldAttributes(field)}>`;
  }
}

/** 확인 단계에 보여줄 값 */
export function displayValue(field, values) {
  const value = values[field.id];
  if (field.type === 'money') return value ? formatWon(value) : '-';
  if (field.type === 'addr')  return `(${values[field.id + '_zip']}) ${values[field.id]} ${values[field.id + '_d'] || ''}`;
  if (Array.isArray(value))   return value.length ? value.join(', ') : '-';
  return value;
}

export function readFieldValues(root, fields) {
  const values = {};
  for (const field of fields) {
    const { id } = field;
    if (!$(`[data-f="${id}"]`, root)) continue;   // 화면에 없는 칸은 읽지 않음 (다른 단계에서 값이 지워지지 않게)
    switch (field.type) {
      case 'radio':  values[id] = $(`input[name="${id}"]:checked`, root)?.value ?? ''; break;
      case 'checks': values[id] = $$(`input[name="${id}"]:checked`, root).map(input => input.value); break;
      case 'money':  values[id] = toNumber($('#' + id, root)?.value ?? 0); break;
      case 'file':   values[id] = [...($('#' + id, root)?.files ?? [])].map(file => file.name); break;
      case 'addr':   for (const suffix of ['', '_zip', '_d']) { const input = $('#' + id + suffix, root); if (input) values[id + suffix] = input.value; } break;
      default:       values[id] = $('#' + id, root)?.value ?? '';
    }
  }
  return values;
}

/** 필수 입력 · 형식 · 금액 범위를 검사하고, 첫 오류 위치로 스크롤 */
export function validateFields(root, fields, values) {
  let isValid = true;

  for (const field of fields) {
    const errorLabel = $('#e-' + field.id, root);
    if (!errorLabel || errorLabel.closest('.fld')?.hidden) continue;   // 숨겨진 조건부 항목은 검증 제외
    const input = $('#' + field.id, root);
    errorLabel.textContent = '';
    input?.classList.remove('bad');
    input?.removeAttribute('aria-invalid');
    if (field.optional) continue;

    const message = validationMessage(field, values[field.id]);
    if (message) {
      isValid = false;
      errorLabel.textContent = message;
      input?.classList.add('bad');
      input?.setAttribute('aria-invalid', 'true');
    }
  }

  /* 첫 오류 칸으로 초점 이동 (KWCAG 25번 오류 정정) */
  if (!isValid) {
    const firstError = $('.err:not(:empty)', root)?.closest('.fld');
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    focusElement($('input:not([type=hidden]), select, textarea', firstError) || firstError);
  }
  return isValid;
}



/** 폼 공통 동작: 금액 입력 · 빠른 금액 · 파일 목록 · 우편번호 · 실시간 계산 · 동의 체크 */
export function bindFormBehaviors(root, config, flow) {
  const fields = config.fields || [];
  const calcTarget = $('#calc', root);
  const recalc = () => {
    if (!calcTarget || !config.calc) return;
    Object.assign(flow.values, readFieldValues(root, fields));
    calcTarget.innerHTML = calcBox(config.calc(flow.values, flow.pick));
  };

  $$('[data-money]', root).forEach(input => input.addEventListener('input', () => {
    const digits = input.value.replace(/[^\d]/g, '');
    input.value = digits ? Number(digits).toLocaleString() : '';
    recalc();
  }));

  $$('[data-add]', root).forEach(button => {
    button.onclick = () => {
      const input = $('#' + button.dataset.for, root);
      const max = Number(input.dataset.max) || Infinity;
      const amount = button.dataset.add === 'max' ? max : Math.min(toNumber(input.value) + Number(button.dataset.add), max);
      input.value = amount.toLocaleString();
      recalc();
    };
  });

  $$('[data-zip]', root).forEach(button => {
    button.onclick = () => openZipSearch(root, button.dataset.zip);
  });

  /* 선택 상자를 고르면 남아 있던 오류 문구를 지움 */
  $$('select', root).forEach(select => select.addEventListener('change', () => {
    if (!select.value || !select.hasAttribute('aria-invalid')) return;
    select.classList.remove('bad');
    select.removeAttribute('aria-invalid');
    const errorLabel = $('#e-' + select.id, root);
    if (errorLabel) errorLabel.textContent = '';
  }));

  $$('[data-agree]', root).forEach(checkbox => {
    checkbox.onchange = () => { flow.agreed = $$('[data-agree]:checked', root).map(item => Number(item.dataset.agree)); };
  });

  if (config.lockRules) {
    applyLockRules(root, config, flow);
    $$('input[type=radio]', root).forEach(radio => radio.addEventListener('change', () => {
      const changed = applyLockRules(root, config, flow);
      if (changed.length) announce(`바뀐 항목: ${changed.join(', ')}`);
    }));
  }

  /* 조건부 항목 보이기/숨기기 */
  const conditionalFields = fields.filter(field => field.showWhen);
  if (conditionalFields.length) {
    const updateVisibility = () => {
      const values = readFieldValues(root, fields);
      conditionalFields.forEach(field => { const group = $(`[data-f="${field.id}"]`, root); if (group) group.hidden = !isFieldVisible(field, fields, values); });
    };
    $$('input, select', root).forEach(input => input.addEventListener('change', updateVisibility));
  }

  $$('input, select', root).forEach(input => input.addEventListener('change', recalc));
  bindFileList(root);
  recalc();
}

/** 파일을 고르면 파일 이름을 칩으로 보여줌 */
export function bindFileList(root) {
  $$('input[type=file]', root).forEach(input => input.addEventListener('change', () => {
    const list = $('#fl-' + input.id, root);
    if (list) list.innerHTML = each([...input.files], file => `<span class="fchip">${escapeHtml(file.name)}</span>`);
  }));
}

export function openZipSearch(root, fieldId) {
  const modal = openModal(`
    <h2>우편번호 검색</h2>
    <p>도로명, 건물명 또는 지번을 입력하세요.</p>
    <label class="sr-only" for="zq">도로명, 건물명 또는 지번</label>
    <div class="inrow"><input class="inp" id="zq" value="세종대로 110"><button class="btn navy" id="zgo">검색</button></div>
    <div class="mt-12" id="zres" role="group" aria-label="검색 결과" aria-live="polite"></div>
    <button class="btn block mt-12" data-action="close-modal">닫기</button>`);

  const showResults = () => {
    $('#zres', modal).innerHTML = each(ZIP_SAMPLES, ([zip, address]) => `
      <button class="pick mb-6" data-zip-code="${zip}" data-address="${address}"><span class="pm"><b class="num">${zip}</b><small>${address}</small></span></button>`);
    $$('[data-zip-code]', modal).forEach(result => {
      result.onclick = () => {
        $('#' + fieldId + '_zip', root).value = result.dataset.zipCode;
        $('#' + fieldId, root).value = result.dataset.address;
        closeModal();
        $('#' + fieldId + '_d', root).focus();
      };
    });
  };
  $('#zgo', modal).onclick = showResults;
  showResults();
}


/** 고정 규칙을 화면에 반영: 고정 항목은 고정값만 보이고 선택 불가, 풀리면 원래 선택지로 */
function applyLockRules(root, config, flow) {
  Object.assign(flow.values, readFieldValues(root, config.fields));
  const locks = config.lockRules(flow.values);
  const changed = [];

  for (const field of config.fields) {
    const group = $(`[data-f="${field.id}"]`, root);
    if (!group) continue;
    const radios = $$(`input[name="${field.id}"]`, group);
    const [fixedValue, reason] = locks[field.id] || [];
    const isLocked = fixedValue !== undefined;
    const wasLocked = group.classList.contains('locked');

    radios.forEach(radio => {
      const isNotApplicable = radio.value === NOT_APPLICABLE;
      radio.disabled = isLocked;
      radio.closest('label').hidden = isLocked ? radio.value !== fixedValue : isNotApplicable;
      if (isLocked && radio.value === fixedValue) radio.checked = true;
    });
    if (!isLocked && $(`input[name="${field.id}"]:checked`, group)?.value === NOT_APPLICABLE) radios[0].checked = true;

    group.classList.toggle('locked', isLocked);
    let note = $('.lock-note', group);
    if (isLocked && !note) {
      note = document.createElement('span');
      note.className = 'help lock-note';
      note.id = `lk-${field.id}`;
      group.append(note);
      const radioGroup = $('[role=radiogroup]', group);
      radioGroup?.setAttribute('aria-describedby', `${radioGroup.getAttribute('aria-describedby') || ''} ${note.id}`.trim());
    }
    if (note) {
      note.hidden = !isLocked;
      note.textContent = isLocked ? `${reason} 고정` : '';
    }
    if (isLocked !== wasLocked) changed.push(`${field.label} ${isLocked ? `「${fixedValue}」 고정` : '다시 선택 가능'}`);
  }

  Object.assign(flow.values, readFieldValues(root, config.fields));
  return changed;
}
