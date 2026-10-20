import { $, $$, each, escapeHtml, focusElement, when } from '../core/dom.js';
import { formatWon } from '../core/format';
import { CONTRACTS, USER, insuredLabel } from '../data/customerRepository.js';
import { contractDocumentsCard } from '../features/contractDocuments.js';
import { SCREEN_BY_ID } from '../data/menuRepository.js';
import { bindFileList } from '../form/formEngine.js';
import { rerenderScreen } from '../pages/screen.js';
import { LIST_SCREENS, isStatusColumn, setRowStatus } from '../screens/listScreens.js';
import { state } from '../state/store';
import { icon } from '../ui/icons.js';
import { closeModal, openModal, toast } from '../ui/overlay.js';
import { infoBox, linkButtons, statusChip, summaryTiles } from '../ui/widgets.js';

/* T2 목록 + 상세 ---------------------------------------------------- */
const PERIODS = ['1개월', '3개월', '6개월', '1년'];
const isNumericColumn = column => /금액|잔액|액|이자|세$|수익률|비율/.test(column);
/** 보험금 찾기(PY-03)의 '신청' 열 → 이어서 열 신청 화면 */
const claimScreenFor = label => (label.startsWith('미수령') ? 'PY-07' : 'PY-04');

export function renderListDetail(screen) {
  if (screen.id === 'CT-02') return renderContractDetail();

  const config = LIST_SCREENS[screen.id];
  const list = state.screen.list;
  list.period ??= '3개월';
  list.filters ??= {};

  return [
    when(config.info, infoBox('info', 'info', config.info, 'mb-14')),
    when(config.warn, infoBox('warn', 'alert', config.warn, 'mb-14')),
    config.top ? config.top() : '',
    config.tiles ? summaryTiles(config.tiles) : '',
    listFilters(config),
    listRows(config),
    listDetailCard(screen, config),
    config.links ? linkButtons(config.links) : '',
  ].join('');
}

/** 선택 필터(예: 거래구분)에 맞는 행만 남김 */
function visibleRows(config) {
  const { filters } = state.screen.list;
  return config.rows
    .map((cells, index) => ({ cells, index }))
    .filter(({ cells }) => Object.entries(config.filterColumns || {}).every(([label, column]) => {
      const value = filters[label];
      return !value || value === '전체' || cells[column] === value;
    }));
}



function listFilters(config) {
  if (!config.filters.length) return '';
  const { period, filters } = state.screen.list;

  const periodFilter = () => `
    <div class="f"><span class="lb" id="periodLabel">조회기간</span><div class="seg" role="group" aria-labelledby="periodLabel">
      ${each(PERIODS, item => `<button class="${period === item ? 'on' : ''}" aria-pressed="${period === item}" data-action="set-period" data-period="${item}">${item}</button>`)}
    </div></div>`;
  const selectFilter = ({ label, options }) => `
    <div class="f"><label for="f-${label}">${label}</label>
      <select class="inp sm" id="f-${label}" data-filter="${label}">
        ${each(options, option => `<option ${filters[label] === option ? 'selected' : ''}>${option}</option>`)}
      </select>
    </div>`;

  return `
  <div class="filters">
    ${each(config.filters, filter => (filter === 'period' ? periodFilter() : selectFilter(filter)))}
    <div class="f end"><button class="btn sm navy" data-action="toast" data-message="조회했습니다.">${icon('search')}조회</button></div>
  </div>`;
}

/** PC는 표, 모바일은 카드 목록으로 같은 행을 보여줌 */
function listRows(config) {
  const rows = visibleRows(config);
  if (!rows.length) return '<div class="card empty">조회 조건에 맞는 내역이 없습니다.</div>';

  const { selectedRow } = state.screen.list;
  const columns = config.columns;
  const statusIndex  = columns.findIndex(isStatusColumn);
  const numericIndex = columns.findIndex(isNumericColumn);

  const cell = (column, value, cells) => {
    if (isStatusColumn(column)) return statusChip(value);
    if (column === '신청') return `<button class="btn sm pri" data-action="open" data-id="${claimScreenFor(value)}">${value}</button>`;
    if (column === '열람' || column === '파일') return `<button class="btn sm" data-action="toast" data-message="PDF 열람은 실제 서비스에서 제공됩니다." aria-label="${escapeHtml(`${cells[0]} ${cells[1]}`)} ${value}">${icon('doc')}${value}</button>`;
    return escapeHtml(value);
  };
  const mobileHeadline = cells =>
    statusIndex >= 0 ? statusChip(cells[statusIndex]) : numericIndex >= 0 ? `<span class="num">${escapeHtml(cells[numericIndex])}</span>` : '';

  /* 행 전체를 눌러도 되지만, 키보드·화면낭독기 사용자는 첫 칸의 버튼으로 상세를 엶 */
  const firstCell = (value, index) =>
    `<button class="cell-btn" data-action="select-row" data-index="${index}" aria-pressed="${selectedRow === index}">${escapeHtml(value)}<span class="sr-only"> 상세 보기</span></button>`;

  return `
  <div class="tbl-wrap has-m"><table class="tbl">
    <caption class="sr-only">${escapeHtml(SCREEN_BY_ID[state.route.screenId].depth3)} 목록 · 첫 칸을 누르면 아래에 상세 내용이 나옵니다</caption>
    <thead><tr>${each(columns, column => `<th scope="col" class="${isNumericColumn(column) ? 'r' : ''}">${column}</th>`)}</tr></thead>
    <tbody>
      ${each(rows, ({ cells, index }) => `
        <tr class="clk ${selectedRow === index ? 'sel' : ''}" data-action="select-row" data-index="${index}">
          ${each(cells, (value, column) => `<td class="${isNumericColumn(columns[column]) ? 'r num' : ''}">${column === 0 ? firstCell(value, index) : cell(columns[column], value, cells)}</td>`)}
        </tr>`)}
    </tbody>
  </table></div>
  <div class="mlist">
    ${each(rows, ({ cells, index }) => `
      <button class="mrow ${selectedRow === index ? 'sel' : ''}" data-action="select-row" data-index="${index}" aria-pressed="${selectedRow === index}">
        <span class="t"><span>${escapeHtml(cells[1])}</span>${mobileHeadline(cells)}</span>
        <span class="s">${each(cells, (value, column) => (column === 1 || column === statusIndex || column === numericIndex) ? '' : `<span>${columns[column]} · ${escapeHtml(value)}</span>`)}</span>
      </button>`)}
  </div>`;
}

function listDetailCard(screen, config) {
  const rowIndex = state.screen.list.selectedRow;
  const cells = config.rows[rowIndex];
  if (rowIndex == null || !cells) return '';

  return `
  <div class="card detail" id="rowDetail" role="region" aria-labelledby="rowDetailTitle">
    <h2 class="split center"><span id="rowDetailTitle">상세 내용</span><button class="icon-btn" data-action="close-row" aria-label="상세 내용 닫기">${icon('x')}</button></h2>
    <dl class="kv">${each(config.columns, (column, index) => `<dt>${column}</dt><dd class="num">${isStatusColumn(column) ? statusChip(cells[index]) : escapeHtml(cells[index])}</dd>`)}</dl>
    ${rowFollowUp(screen.id, config, rowIndex)}
  </div>`;
}

/** 선택한 행 상태에 따라 이어서 할 수 있는 일 (서류 보완 · 재심사 · 취소 · 신청) */
function rowFollowUp(screenId, config, rowIndex) {
  const cells = config.rows[rowIndex];
  const status = cells[config.columns.findIndex(isStatusColumn)];

  if (screenId === 'PY-02' && status === '보완서류 요청') return `
    ${infoBox('danger', 'alert', '<b>보완서류가 필요합니다 (요청일 2026.09.26)</b>진료비 세부내역서 1부를 올려 주시면 심사를 이어서 진행합니다.', 'my-14')}
    <label class="file-drop" for="upl">${icon('upload')}<b>보완서류 사진 찍기 또는 파일 선택</b><small>JPG·PNG·PDF, 1건당 10MB 이하</small><input type="file" id="upl" multiple accept="image/*,.pdf"></label>
    <div class="files mt-8" id="fl-upl"></div>
    <span class="err" id="uplErr" role="alert"></span>
    <button class="btn pri block mt-12" data-action="submit-documents">보완서류 제출</button>`;

  if (screenId === 'PY-02' && status === '지급완료') return infoBox('ok', 'check',
    '지급 결정 내용에 이의가 있으시면 재심사를 요청할 수 있습니다. <button class="link" data-action="toast" data-message="재심사 요청은 실제 서비스에서 접수됩니다.">재심사 요청</button>', 'mt-14');

  if ((screenId === 'PY-06' && status === '접수') || (screenId === 'LN-03' && status === '심사중')) return `
    ${infoBox('warn', 'info', '처리 전인 신청은 지금 취소할 수 있습니다.', 'mt-14')}
    <button class="btn block danger mt-10" data-action="cancel-request" data-index="${rowIndex}">신청 취소</button>`;

  if (screenId === 'PY-03') {
    const label = cells[config.columns.indexOf('신청')];
    return `<button class="btn pri block mt-14" data-action="open" data-id="${claimScreenFor(label)}">${label}</button>`;
  }

  return '';
}

export function bindListDetail(screen, root) {
  $$('[data-filter]', root).forEach(select => select.addEventListener('change', () => {
    state.screen.list.filters[select.dataset.filter] = select.value;
    state.screen.list.selectedRow = null;
    rerenderScreen();
  }));
  bindFileList(root);
}

export function confirmCancelRequest(rowIndex) {
  const rows = LIST_SCREENS[state.route.screenId].rows;
  const modal = openModal(`
    <h2>신청을 취소할까요?</h2>
    <p>${escapeHtml(rows[rowIndex][1])} 신청이 취소됩니다. 취소 후에는 다시 신청해야 합니다.</p>
    <div class="navrow inline mt-0">
      <button class="btn" data-action="close-modal">닫기</button>
      <button class="btn pri" id="cOk">취소하기</button>
    </div>`);
  $('#cOk', modal).onclick = () => {
    closeModal();
    setRowStatus(state.route.screenId, rowIndex, '취소');
    state.screen.list.selectedRow = null;
    rerenderScreen();
    toast('신청을 취소했습니다.');
  };
}

/** 보완서류 제출: 선택한 청구 건에 파일이 1개 이상 있어야 제출 */
export function submitDocuments() {
  const input = $('#upl');
  if (!input?.files.length) {
    $('#uplErr').textContent = '보완서류를 1장 이상 올려 주세요.';
    focusElement(input);
    return;
  }
  setRowStatus(state.route.screenId, state.screen.list.selectedRow, '처리중');
  state.screen.list.selectedRow = null;
  rerenderScreen();
  toast('보완서류를 제출했습니다. 알림톡으로 결과를 알려드립니다.');
}

/* 계약조회 (CT-02): 계약 탭 + 보장내용 + 약관·안내장 */
function renderContractDetail() {
  const list = state.screen.list;
  list.contractTab ??= 0;
  const contract = CONTRACTS[list.contractTab];

  return `
  <div class="seg block mb-14" role="group" aria-label="조회할 계약">
    ${each(CONTRACTS, (item, index) => `<button class="${index === list.contractTab ? 'on' : ''}" aria-pressed="${index === list.contractTab}" data-action="contract-tab" data-index="${index}">${escapeHtml(item.name.replace('(무)iM ', ''))}</button>`)}
  </div>
  <div class="card">
    <h2 class="split">${escapeHtml(contract.name)} ${statusChip(contract.status)}</h2>
    <dl class="kv">
      <dt>증권번호</dt><dd class="num">${contract.no}</dd>
      <dt>계약일</dt><dd class="num">${contract.startDate}</dd>
      <dt>보험기간</dt><dd>${contract.endDate}</dd>
      <dt>납입기간</dt><dd>${contract.payEnd === '갱신형' ? '갱신형' : contract.payEnd + '까지'}</dd>
    </dl>
  </div>
  <div class="card">
    <h2>보장내용</h2>
    <div class="tbl-wrap"><table class="tbl min-420">
      <thead><tr><th>구분</th><th>보장</th><th class="r">가입금액</th></tr></thead>
      <tbody>${each(contract.coverage, ([type, desc, amount]) => `<tr><td>${type}</td><td>${desc}</td><td class="r num">${amount}</td></tr>`)}</tbody>
    </table></div>
  </div>
  <div class="card">
    <h2>계약관계자 · 납입정보</h2>
    <dl class="kv">
      <dt>계약자</dt><dd>${USER.name}</dd>
      <dt>피보험자</dt><dd>${insuredLabel(contract)}</dd>
      <dt>수익자</dt><dd>${contract.beneficiary}</dd>
      <dt>월 보험료</dt><dd class="num">${formatWon(contract.premium)}</dd>
      <dt>납입 회차</dt><dd class="num">${contract.paidCount}회 / ${contract.totalCount}${typeof contract.totalCount === 'number' ? '회' : ''}</dd>
      <dt>자동이체</dt><dd>${contract.account} · 매월 ${contract.debitDay}</dd>
    </dl>
    ${linkButtons([['계약관계자 변경', 'CH-10'], ['자동이체 변경', 'PM-02'], ['보험증권 재발급', 'CF-03']], { spacing: 'mt-16', primaryIndex: 2 })}
  </div>
  ${contractDocumentsCard(contract)}`;
}
