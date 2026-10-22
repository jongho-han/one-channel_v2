/* 빌드 결과(dist/index.html)를 jsdom에 올려 전 화면 렌더링과 주요 회귀 버그를 확인 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { domShape } from './domShape.js';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const SCRIPT = /<script type="module"[^>]*>([\s\S]*?)<\/script>/;
const bundle = html.match(SCRIPT)[1];

let window;
let errors;

function boot() {
  const dom = new JSDOM(html.replace(SCRIPT, ''), { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.test/' });
  window = dom.window;
  errors = [];
  window.addEventListener('error', event => errors.push(event.error || event.message));
  window.matchMedia = () => ({ matches: false, addEventListener() {} });
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.HTMLCanvasElement.prototype.getContext = () => null;
  window.eval(bundle);
}

const $ = selector => window.document.querySelector(selector);
const click = element => element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const login = () => { window.App.state.isLoggedIn = true; };

beforeEach(boot);

test('메인 화면이 오류 없이 그려진다', () => {
  assert.ok($('#main h1'));
  assert.deepEqual(errors, []);
});

test('메뉴정의서의 모든 화면이 열린다', () => {
  login();
  click($('[data-action="toggle-all-menu"]'));
  const allIds = [...new Set([...window.document.querySelectorAll('#amList [data-id]')].map(button => button.dataset.id))];
  assert.equal(allIds.length, 53);
  for (const id of allIds) {
    window.App.openScreen(id);
    assert.equal(window.App.state.route.screenId, id, id);
    assert.ok($('#main h1')?.textContent.trim(), `${id} 제목`);
  }
  assert.deepEqual(errors, []);
});

test('단일폼 동의 체크가 큰글씨 전환 후에도 유지된다 (PM-02)', () => {
  login();
  window.App.openScreen('PM-02');
  const agree = $('[data-agree="0"]');
  agree.checked = true;
  agree.dispatchEvent(new window.Event('change', { bubbles: true }));
  click($('[data-action="toggle-large-text"]'));
  assert.equal($('[data-agree="0"]').checked, true);
  assert.deepEqual([...window.App.state.screen.flow.agreed], [0]);
});

test('입력 중인 값이 큰글씨 전환 후에도 유지된다 (MY-05)', () => {
  login();
  window.App.openScreen('MY-05');
  $('#work').value = '테스트상사';
  click($('[data-action="toggle-large-text"]'));
  assert.equal($('#work').value, '테스트상사');
});

test('보완서류는 파일이 없으면 제출되지 않는다 (PY-02)', () => {
  login();
  window.App.openScreen('PY-02');
  click($('.cell-btn[data-index="0"]'));
  click($('[data-action="submit-documents"]'));
  assert.ok($('#uplErr').textContent);
  assert.ok($('#rowDetail'), '상세가 닫히지 않음');
});

test('메인 요약의 대출 잔액은 계약 데이터로 계산된다', () => {
  login();
  window.App.render();
  assert.match($('.my-summary').textContent, /300만원/);
});

test('보험계약대출 확인 단계는 예정 계약 카드를 보여준다 (LN-02)', () => {
  login();
  window.App.openScreen('LN-02');
  const input = $('#loanAmount');
  input.value = '1,000,000';
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
  click($('#next'));
  for (const box of window.document.querySelectorAll('[data-agree]')) {
    box.checked = true;
    box.dispatchEvent(new window.Event('change', { bubbles: true }));
  }
  click($('#next'));
  assert.match($('#sbody').textContent, /대출 실행 예정 계약/);
  assert.deepEqual(errors, []);
});

test('계약조회에서 계약별 약관·안내장 PDF를 내려받는다 (CT-02)', async () => {
  login();
  window.App.openScreen('CT-02');
  let saved = null;
  window.URL.createObjectURL = blob => { saved = { blob }; return 'blob:test'; };
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = function () { saved.name = this.download; };

  click($('[data-action="contract-open"][data-index="1"]'));   // 변액연금도 약관 · 보험상품안내장 각 1건
  const buttons = [...window.document.querySelectorAll('[data-action="download-contract-doc"]')];
  assert.deepEqual(buttons.map(button => button.dataset.doc), ['terms', 'product-notice']);

  click(buttons[0]);
  assert.equal(saved.name, '2020-0456789_보험약관.pdf');
  assert.equal(saved.blob.type, 'application/pdf');
  assert.match(await saved.blob.text(), /^%PDF-1\.4[\s\S]*%%EOF\n$/);
  assert.deepEqual(errors, []);
});

test('하단 이용 안내 링크는 회사 홈페이지로 새 창 연결된다', () => {
  const links = Object.fromEntries([...window.document.querySelectorAll('#footer nav a')].map(a => [a.firstChild.textContent, a]));
  assert.equal(links['개인정보처리방침']?.href, 'https://www.imlifeins.co.kr/BE/BE_A030_2.do');
  assert.equal(links['신용정보활용체제']?.href, 'https://www.imlifeins.co.kr/BE/BE_A032.do');
  assert.equal(links['고객권리안내']?.href, 'https://www.imlifeins.co.kr/BE/BE_A031.do');
  assert.equal(links['보험사기신고']?.href, 'https://www.imlifeins.co.kr/BB/BB_C020.do');
  assert.equal(links['전자민원']?.href, 'https://www.imlifeins.co.kr/BB/BB_B010.do');
  for (const link of Object.values(links)) {
    assert.equal(link.target, '_blank');
    assert.match(link.rel, /noopener/);
  }
});

test('연금전환 사전신청 메뉴 위치(보험금청구/신청)와 계산 (CH-11)', () => {
  login();
  window.App.openScreen('CH-11');
  const lnb = [...window.document.querySelectorAll('.lnb button')].map(button => button.textContent.trim());
  assert.equal(lnb[lnb.indexOf('연금 지급 신청') + 1], '연금전환 사전신청');
  const start = lnb.indexOf('계약관계자변경');
  assert.deepEqual(lnb.slice(start, start + 10), ['계약관계자변경', '보험기간/연금개시연도 변경', '연금개시유형 선택/변경',
    '변액보험 펀드변경/관리', '감액완납', '특약해지', '보험계약 해지', '대리청구인 지정/등록', '금융정보보호 신청/해제', '청약철회']);

  const picks = [...window.document.querySelectorAll('[data-action="pick"]')];
  assert.equal(picks.length, 2, '종신·변액종신 계약만');
  click(picks[0]);
  click($('#next'));
  const age = $('#age');
  age.value = age.options[2].value;   // 60세
  age.dispatchEvent(new window.Event('change', { bubbles: true }));
  click($('#next'));
  assert.match($('#main').textContent, /매월 예상 연금액\(예시\)/);
  assert.deepEqual(errors, []);
});

test('하단 영역은 React로 한 번만 그려 화면 이동 시 다시 만들지 않는다', () => {
  const firstLink = $('#footer nav a');
  assert.ok(firstLink);
  window.App.navigate('login');
  window.App.navigate('home');
  assert.equal($('#footer nav a'), firstLink);
  assert.equal(window.document.querySelectorAll('#footer nav').length, 1);
  assert.deepEqual(errors, []);
});

/* ---- 공통 셸(헤더·메가메뉴·앱바·탭바) 특성 테스트: React 전환 전후 동작 동일 ---- */
const texts = selector => [...window.document.querySelectorAll(selector)].map(element => element.textContent.trim());

test('셸: 화면 이동에 따라 탭바·주메뉴·앱바 제목·로그인 버튼이 바뀐다', () => {
  assert.deepEqual(texts('#tabbar button'), ['홈', '내 계약', '보험금청구', '증명서', '전체메뉴']);
  assert.equal($('#tabbar button.on').textContent.trim(), '홈');
  assert.equal($('#header [data-action="nav"][data-page="login"]').textContent.trim(), '로그인');

  login();
  window.App.openScreen('CT-01');
  assert.equal($('#tabbar button.on').textContent.trim(), '내 계약');
  assert.equal($('#tabbar button.on').getAttribute('aria-current'), 'page');
  assert.equal($('#gnb button.on').textContent.trim(), '보험');
  assert.equal($('#gnb button[aria-current="true"]').dataset.group, '보험');
  assert.equal($('#appbar .title').textContent, '계약종합현황');
  assert.ok($('#appbar [data-action="back"]'));
  assert.match($('#header .user-chip').textContent, /홍길동/);
  assert.equal($('#header [data-action="logout"]').textContent.trim(), '로그아웃');

  window.App.openScreen('CF-02');
  assert.equal($('#tabbar button.on').textContent.trim(), '증명서');
  assert.deepEqual(errors, []);
});

test('셸: 큰글씨 버튼은 눌림 상태와 이름이 바뀐다', () => {
  click($('#header [data-action="toggle-large-text"]'));
  assert.equal($('#header [data-action="toggle-large-text"]').getAttribute('aria-pressed'), 'true');
  assert.match($('#header [data-action="toggle-large-text"]').textContent, /큰글씨 켜짐/);
  assert.ok(window.document.documentElement.classList.contains('big'));
  click($('#header [data-action="toggle-large-text"]'));
  assert.equal($('#header [data-action="toggle-large-text"]').getAttribute('aria-pressed'), 'false');
  assert.deepEqual(errors, []);
});

test('셸: 전체메뉴 버튼은 열림 상태를 알리고 다시 누르면 닫힌다', () => {
  click($('#header [data-action="toggle-all-menu"]'));
  assert.equal(window.App.state.route.page, 'all');
  assert.equal($('#header [data-action="toggle-all-menu"]').getAttribute('aria-expanded'), 'true');
  assert.equal($('#header [data-action="toggle-all-menu"]').getAttribute('aria-label'), '전체메뉴 닫기');
  assert.equal($('#tabbar button.on').textContent.trim(), '전체메뉴');
  click($('#header [data-action="toggle-all-menu"]'));
  assert.equal(window.App.state.route.page, 'home');
  assert.deepEqual(errors, []);
});

test('셸: 주메뉴에 초점이 오면 메가메뉴, 2Depth 선택·Esc 닫기', () => {
  const gnbButton = $('#gnb [data-group="보험"]');
  gnbButton.dispatchEvent(new window.FocusEvent('focusin', { bubbles: true }));
  assert.equal($('#mega').hidden, false);
  assert.equal(gnbButton.getAttribute('aria-expanded'), 'true');
  assert.equal($('#mega .mega-title').textContent, '계약종합현황');

  click($('#mega [data-action="mega-section"][data-index="2"]'));
  assert.equal($('#mega .mega-title').textContent, '보험금청구/신청');
  assert.equal($('#mega .mega-depth2 button.on').dataset.index, '2');
  assert.equal(window.document.activeElement, $('#mega [data-index="2"]'));
  assert.ok(texts('#mega .mega-depth3 li button').includes('연금전환 사전신청'));

  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal($('#mega').hidden, true);
  assert.equal($('#gnb [data-group="보험"]').getAttribute('aria-expanded'), 'false');
  assert.deepEqual(errors, []);
});

test('셸은 React가 유지해 화면 이동 시 요소를 다시 만들지 않는다', () => {
  const logo = $('#header .logo');
  const homeTab = $('#tabbar button');
  login();
  window.App.openScreen('CT-01');
  window.App.navigate('home');
  assert.equal($('#header .logo'), logo);
  assert.equal($('#tabbar button'), homeTab);
  assert.deepEqual(errors, []);
});

/* ---- 업무 화면 본문 golden 비교: 기준 파일은 전환 전(JS) 화면에서 UPDATE_GOLDEN=1 로 생성 ---- */
function assertMatchesGolden(name, selector = '#sbody') {
  const file = new URL(`./golden/${name}.json`, import.meta.url);
  const shape = domShape($(selector));
  if (process.env.UPDATE_GOLDEN) writeFileSync(file, JSON.stringify(shape, null, 1) + '\n');
  assert.deepEqual(shape, JSON.parse(readFileSync(file, 'utf8')));
}

test('T1 계약종합현황(CT-01) 본문이 기준 화면과 같다', () => {
  login();
  window.App.openScreen('CT-01');
  assertMatchesGolden('CT-01');
  assert.deepEqual(errors, []);
});

/* ---- T5 발급 (CF-01~06 로그인 발급, CS-01~02 비로그인 서류) ---- */
const ISSUANCE_IDS = ['CF-01', 'CF-02', 'CF-03', 'CF-04', 'CF-05', 'CF-06', 'CS-01', 'CS-02'];
const fixRandom = () => { window.Math.random = () => 0.5; };   // 발급번호·문서확인번호 고정

for (const id of ISSUANCE_IDS) {
  test(`T5 ${id} 첫 화면 본문이 기준 화면과 같다`, () => {
    login();
    window.App.openScreen(id);
    assertMatchesGolden(id);
    assert.deepEqual(errors, []);
  });
}

test('T5 받는 방법에 따라 이메일·팩스 입력칸이 보인다 (CF-02)', () => {
  login();
  window.App.openScreen('CF-02');
  const choose = value => {
    const radio = $(`input[name="recv"][value="${value}"]`);
    radio.click();
  };
  assert.equal($('#emailF').hidden, true);
  assert.equal($('#faxF').hidden, true);
  choose('이메일로 받기');
  assert.equal($('#emailF').hidden, false);
  assert.equal($('#email').value, 'gildong.hong@example.com');
  choose('팩스로 받기');
  assert.equal($('#emailF').hidden, true);
  assert.equal($('#faxF').hidden, false);
  assert.deepEqual(errors, []);
});

test('T5 팩스번호가 틀리면 발급하지 않는다 (CF-02)', () => {
  login();
  window.App.openScreen('CF-02');
  $('input[name="recv"][value="팩스로 받기"]').click();
  $('#fax').value = '12';
  click($('#issue'));
  assert.equal($('#faxErr').textContent, '팩스번호를 확인해 주세요.');
  assert.equal(window.App.state.screen.flow.step, 0);
  assert.deepEqual(errors, []);
});

test('T5 발급하면 입력값으로 견본 증명서를 보여준다 (CF-02)', () => {
  fixRandom();
  login();
  window.App.openScreen('CF-02');
  const select = $('#ct');
  select.value = select.options[2].value;
  $('#from').value = '2026-02-01';
  $('input[name="recv"][value="이메일로 받기"]').click();
  $('#email').value = 'test@example.com';
  click($('#issue'));
  assert.equal(window.App.state.screen.flow.step, 1);
  assertMatchesGolden('CF-02-issued');
  assert.match($('#sbody').textContent, /test@example\.com\(으\)로 보냈습니다/);
  assert.match($('#sbody .cert').textContent, /2026\.02\.01 ~ 2026\.09\.30/);

  click($('#sbody [data-action="reset-flow"]'));
  assert.ok($('#issue'));
  assert.deepEqual(errors, []);
});

test('T5 발급 조건 입력값은 큰글씨 전환 후에도 유지된다 (CF-04)', () => {
  login();
  window.App.openScreen('CF-04');
  $('#base').value = '2026-09-15';
  click($('[data-action="toggle-large-text"]'));
  assert.equal($('#base').value, '2026-09-15');
  assert.deepEqual(errors, []);
});

/* ---- T4 단일폼 변경 (표준 8개 화면; MY-02·MY-03·CH-01 전용 화면은 별도) ---- */
const SINGLE_FORM_IDS = ['MY-01', 'PY-08', 'PM-02', 'PM-03', 'CH-09', 'CH-08', 'LN-05', 'LN-06'];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const fixClock = () => { window.Date.prototype.toTimeString = () => '09:30:00 GMT+0900'; };   // 처리일시 고정

for (const id of SINGLE_FORM_IDS) {
  test(`T4 ${id} 첫 화면 본문이 기준 화면과 같다`, () => {
    login();
    window.App.openScreen(id);
    assertMatchesGolden(id);
    assert.deepEqual(errors, []);
  });
}

test('T4 필수 항목이 비면 오류를 알리고 첫 오류 칸으로 초점 (CH-09)', () => {
  login();
  window.App.openScreen('CH-09');
  click($('#next'));
  assert.equal($('#e-nm').textContent, '대리청구인 이름을(를) 입력해 주세요.');
  assert.equal($('#nm').getAttribute('aria-invalid'), 'true');
  assert.ok($('#nm').classList.contains('bad'));
  assert.equal($('#e-tel').textContent, '전화번호 형식을 확인해 주세요. 예: 010-1234-5678');
  assert.equal(window.document.activeElement, $('#nm'));
  assert.equal($('#layer .dim'), null, '서명 창이 열리지 않음');

  $('#nm').value = '홍서연';
  click($('#next'));
  assert.equal($('#e-nm').textContent, '');
  assert.equal($('#nm').getAttribute('aria-invalid'), null);
  assert.deepEqual(errors, []);
});

test('T4 필수 확인 항목에 체크하지 않으면 진행하지 않는다 (PM-02)', () => {
  login();
  window.App.openScreen('PM-02');
  $('#no').value = '12345678';
  click($('#next'));
  assert.equal($('#agrErr').textContent, '필수 확인 항목에 체크해 주세요.');
  assert.equal($('#layer .dim'), null);
  click($('[data-agree="0"]'));
  click($('#next'));
  assert.ok($('#layer [data-auth]'), '서명 수단 선택');
  assert.deepEqual(errors, []);
});

test('T4 선택에 따라 상환 계산이 바뀐다 (LN-05)', () => {
  login();
  window.App.openScreen('LN-05');
  assert.match($('#calc').textContent, /상환 완료까지30개월/);
  $('input[name="m"][value="300,000원"]').click();
  assert.match($('#calc').textContent, /월 상환 원금300,000원/);
  assert.match($('#calc').textContent, /상환 완료까지10개월/);
  assert.deepEqual(errors, []);
});

test('T4 우편번호 검색 결과를 주소 칸에 넣는다 (MY-01)', () => {
  login();
  window.App.openScreen('MY-01');
  click($('[data-zip="addrW"]'));
  const result = $('#layer [data-zip-code]');
  click(result);
  assert.equal($('#addrW_zip').value, result.dataset.zipCode);
  assert.equal($('#addrW').value, result.dataset.address);
  assert.equal($('#layer .dim'), null);
  assert.deepEqual(errors, []);
});

test('T4 전자서명하면 완료 화면, 다시 보기로 돌아온다 (CH-09)', async () => {
  fixRandom();
  fixClock();
  login();
  window.App.openScreen('CH-09');
  $('#nm').value = '홍서연';
  $('#bd').value = '2010-03-04';
  $('#tel').value = '010-9876-5432';
  click($('#next'));
  click($('#layer [data-auth="간편인증"]'));
  await wait(1400);
  assert.equal(window.App.state.screen.flow.step, 1);
  assertMatchesGolden('CH-09-done');
  assert.deepEqual(window.App.state.screen.flow.values.nm, '홍서연');

  click($('#sbody [data-action="reset-flow"]'));
  assert.ok($('#next'));
  assert.deepEqual(errors, []);
});

/* ---- T4 전용 화면: 안내장 수신설정(MY-02) · 마케팅 동의(MY-03) · 펀드변경(CH-01) ---- */
/** 입력값 바꾸고 이벤트 발생 (React가 값 변화를 감지하도록 원래 setter 사용) */
function setInput(element, value, eventType = element.tagName === 'SELECT' ? 'change' : 'input') {
  const prototype = element.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
  element.dispatchEvent(new window.Event(eventType, { bubbles: true }));
}
const toasts = () => texts('#toastRegion .toast');

for (const id of ['MY-02', 'MY-03', 'CH-01']) {
  test(`T4 ${id} 첫 화면 본문이 기준 화면과 같다`, () => {
    login();
    window.App.openScreen(id);
    assertMatchesGolden(id);
    assert.deepEqual(errors, []);
  });
}

test('MY-02 수신동의 해제: 확인하면 모바일·이메일을 우편(자택)으로, 전자 수신을 고르면 다시 동의', () => {
  login();
  window.App.openScreen('MY-02');
  click($('#eConsent'));
  assert.equal($('#eConsent').checked, true, '확인 전에는 체크 유지');
  click($('#dlgNo'));
  assert.equal($('#eConsent').checked, true);

  click($('#eConsent'));
  click($('#dlgYes'));
  assert.equal($('#eConsent').checked, false);
  assert.deepEqual([...window.document.querySelectorAll('[data-notice-method]')].map(select => select.value),
    ['우편(자택)', '우편(자택)', '우편(자택)', '우편(자택)', '우편(자택)', '우편(직장)']);
  assert.ok(toasts().includes('4개 안내장의 수신 방법을 우편(자택)으로 바꿨습니다.'));

  setInput($('#nt5'), '이메일');
  assert.equal($('#eConsent').checked, true);
  click($('[data-action="toggle-large-text"]'));
  assert.equal($('#nt5').value, '이메일');
  assert.equal($('#nt0').value, '우편(자택)');
  assert.equal($('#eConsent').checked, true);
  assert.deepEqual(errors, []);
});

test('MY-03 동의 설정 후 전자서명하면 완료', async () => {
  login();
  window.App.openScreen('MY-03');
  click($('#mk2'));
  click($('#next'));
  click($('#layer [data-auth="간편인증"]'));
  await wait(1400);
  assert.equal($('#sbody .donebox h2').textContent, '변경이 완료되었습니다');
  assert.deepEqual(errors, []);
});

test('CH-01 편입비율 합계·위험 안내, 변경 없음·합계 오류 안내', () => {
  login();
  window.App.openScreen('CH-01');
  click($('#next'));
  assert.ok(toasts().includes('변경된 내용이 없습니다. 변경 후 비율이나 자동재배분을 바꿔 주세요.'));

  setInput($('#fd0'), '30');
  assert.equal($('#fsum').textContent, '90% (100%로 맞춰 주세요)');
  assert.equal($('#fsum').className, 'num is-invalid');
  assert.equal($('#riskLine').textContent, '');
  click($('#next'));
  assert.ok(toasts().includes('변경 후 비율 합계를 100%로 맞춰 주세요.'));

  setInput($('#fd4'), '10');
  assert.equal($('#fsum').textContent, '100%');
  assert.equal($('#fsum').className, 'num is-valid');
  assert.equal($('#riskLine').className, 'risk-line ok');
  assert.match($('#riskLine').textContent, /4등급\(보통위험\) \(가중평균 4\.2\) · 현재 투자성향\(위험중립형\) 범위 안입니다\./);

  click($('[data-action="toggle-large-text"]'));
  assert.equal($('#fd0').value, '30');
  assert.equal($('#fsum').textContent, '100%');
  assert.deepEqual(errors, []);
});

test('CH-01 변액 계약을 바꾸면 그 계약의 펀드로 다시 시작', () => {
  login();
  window.App.openScreen('CH-01');
  setInput($('#fd0'), '30');
  click($('[data-action="variable-tab"][data-no="2021-0345678"]'));
  assert.equal(window.document.querySelectorAll('[data-fund]').length, 5);
  assert.equal($('#fd0').value, '30');   // 아시아주식형 현재 30%
  assert.equal($('#fsum').textContent, '100%');
  assert.deepEqual(errors, []);
});

test('CH-01 적합성진단 → 결과 → 변경 전후 비교 → 전자서명 완료', async () => {
  fixRandom();
  fixClock();
  login();
  window.App.openScreen('CH-01');
  setInput($('#fd0'), '30');
  setInput($('#fd4'), '10');
  click($('#rebal'));
  click($('#next'));
  assert.match($('#layer').textContent, /적합성진단이 필요합니다/);
  assert.match($('#layer').textContent, /마지막 적합성진단\(2023\.08\.14\) 후 3년이 지났습니다\./);
  click($('#layer [data-action="suit-start"]'));
  assertMatchesGolden('CH-01-diagnose');

  click($('[data-action="suit-submit"]'));
  assert.deepEqual(texts('[id^="sqErr"]'), Array(5).fill('답을 선택해 주세요.'));
  assert.equal(window.document.activeElement, $('#sq0 input'));
  window.document.querySelectorAll('.suit-q').forEach(question => {
    const options = question.querySelectorAll('input[type=radio]');
    click(options[options.length - 1]);
  });
  assert.equal($('#sqErr0').textContent, '');
  click($('[data-action="suit-submit"]'));
  assertMatchesGolden('CH-01-result');

  click($('[data-action="fund-compare"]'));
  assertMatchesGolden('CH-01-compare');
  click($('[data-action="fund-sign"]'));
  click($('#layer [data-auth="간편인증"]'));
  await wait(1400);
  assertMatchesGolden('CH-01-done');
  assert.deepEqual(errors, []);
});

test('CH-01 진단 결과 투자성향이 낮으면 변경 불가·익일 재진행 안내', () => {
  login();
  window.App.openScreen('CH-01');
  setInput($('#fd0'), '30');
  setInput($('#fd4'), '10');
  click($('#next'));
  click($('#layer [data-action="suit-start"]'));
  window.document.querySelectorAll('.suit-q').forEach(question => click(question.querySelector('input[type=radio]')));
  click($('[data-action="suit-submit"]'));
  assertMatchesGolden('CH-01-result-fail');

  click($('[data-action="suit-edit"]'));
  click($('#next'));
  assert.match($('#layer').textContent, /오늘은 적합성진단을 다시 할 수 없습니다/);
  assert.deepEqual(errors, []);
});

/* ---- T2 목록·상세 (15개 화면) ---- */
const LIST_IDS = ['MY-04', 'MY-07', 'CT-02', 'CT-03', 'CT-04', 'CT-05', 'CT-06', 'CT-07', 'CT-08', 'CT-09', 'PY-02', 'PY-03', 'PY-06', 'LN-01', 'LN-03'];
const attachFiles = (input, names) => {
  Object.defineProperty(input, 'files', { configurable: true, value: names.map(name => new window.File(['x'], name, { type: 'application/pdf' })) });
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
};

for (const id of LIST_IDS) {
  test(`T2 ${id} 첫 화면 본문이 기준 화면과 같다`, () => {
    login();
    window.App.openScreen(id);
    assertMatchesGolden(id);
    assert.deepEqual(errors, []);
  });
}

test('T2 행을 고르면 상세와 이어서 할 일 (PY-02 보완서류 · 지급완료 재심사)', () => {
  login();
  window.App.openScreen('PY-02');
  click($('.cell-btn[data-index="0"]'));
  assertMatchesGolden('PY-02-row0');
  assert.equal(window.document.querySelectorAll('tr.sel').length, 1);
  click($('.mrow[data-index="1"]'));
  assertMatchesGolden('PY-02-row1');
  click($('[data-action="close-row"]'));
  assert.equal($('#rowDetail'), null);
  assert.deepEqual(errors, []);
});

test('T2 보완서류를 올리면 파일 이름을 보여주고 제출하면 처리중 (PY-02)', () => {
  login();
  window.App.openScreen('PY-02');
  click($('.cell-btn[data-index="0"]'));
  click($('[data-action="submit-documents"]'));
  assert.equal($('#uplErr').textContent, '보완서류를 1장 이상 올려 주세요.');
  assert.equal(window.document.activeElement, $('#upl'));
  attachFiles($('#upl'), ['세부내역서.pdf', '영수증.jpg']);
  assert.deepEqual(texts('#fl-upl .fchip'), ['세부내역서.pdf', '영수증.jpg']);
  click($('[data-action="submit-documents"]'));
  assert.equal($('#rowDetail'), null);
  assert.equal($('tbody tr .st').textContent, '처리중');
  assert.ok(toasts().includes('보완서류를 제출했습니다. 알림톡으로 결과를 알려드립니다.'));
  assert.deepEqual(errors, []);
});

test('T2 처리 전 신청은 취소할 수 있다 (PY-06 · LN-03)', () => {
  login();
  window.App.openScreen('PY-06');
  click($('.cell-btn[data-index="0"]'));
  assertMatchesGolden('PY-06-row0');
  click($('[data-action="cancel-request"]'));
  assert.match($('#layer').textContent, /중도인출 신청이 취소됩니다/);
  click($('#cOk'));
  assert.equal($('#rowDetail'), null);
  assert.equal($('tbody tr .st').textContent, '취소');
  assert.ok(toasts().includes('신청을 취소했습니다.'));

  window.App.openScreen('LN-03');
  click($('.cell-btn[data-index="0"]'));
  assertMatchesGolden('LN-03-row0');
  assert.deepEqual(errors, []);
});

test('T2 보험금 찾기는 종류에 맞는 신청 화면으로 (PY-03)', () => {
  login();
  window.App.openScreen('PY-03');
  click($('.cell-btn[data-index="1"]'));
  assertMatchesGolden('PY-03-row1');
  click($('#rowDetail [data-action="open"]'));
  assert.equal(window.App.state.route.screenId, 'PY-04');
  assert.deepEqual(errors, []);
});

test('T2 조회기간·필터에 맞는 행만 보여준다 (CT-08)', () => {
  login();
  window.App.openScreen('CT-08');
  click($('[data-action="set-period"][data-period="1년"]'));
  assert.equal($('[data-action="set-period"].on').dataset.period, '1년');
  click($('.cell-btn[data-index="0"]'));
  setInput($('#f-거래구분'), '지급');
  assert.equal($('#rowDetail'), null, '필터를 바꾸면 상세 닫힘');
  assertMatchesGolden('CT-08-filter');
  assert.deepEqual(errors, []);
});

test('T2 계약조회 카드 → 계약 상세 · 변액 계약 탭 (CT-02 · CT-03)', () => {
  login();
  window.App.openScreen('CT-02');
  assert.equal(window.document.querySelectorAll('#sbody article.ct').length, 8, '보유계약마다 카드');
  assert.equal($('[data-action="download-contract-doc"]'), null, '처음에는 상세 없이 카드 목록');
  click($('[data-action="contract-open"][data-index="6"]'));
  assertMatchesGolden('CT-02-detail6');
  assert.equal(window.document.activeElement, $('#contractTitle'), '상세를 열면 계약 이름으로 초점');
  assert.equal($('#sbody article.ct'), null);
  click($('[data-action="contract-list"]'));
  assert.equal(window.document.querySelectorAll('#sbody article.ct').length, 8);
  assert.equal(window.document.activeElement, $('[data-action="contract-open"][data-index="6"]'), '목록으로 돌아오면 보던 계약 카드로 초점');
  window.App.openScreen('CT-03');
  click($('[data-action="variable-tab"][data-no="2021-0345678"]'));
  assertMatchesGolden('CT-03-tab2');
  assert.deepEqual(errors, []);
});

test('계약종합현황의 계약상세는 그 계약의 상세를 바로 연다 (CT-01 → CT-02)', () => {
  login();
  window.App.openScreen('CT-01');
  click($('[data-action="open"][data-id="CT-02"][data-contract="2020-0456789"]'));
  assert.equal(window.App.state.route.screenId, 'CT-02');
  assert.match($('#contractTitle').textContent, /하이브리드 변액연금보험/);
  assert.equal(window.document.activeElement, $('#contractTitle'));
  click($('[data-action="contract-list"]'));
  assert.equal(window.document.querySelectorAll('#sbody article.ct').length, 8);
  window.App.openScreen('CT-03');
  click($('[data-action="variable-tab"][data-no="2021-0345678"]'));
  assertMatchesGolden('CT-03-tab2');
  assert.deepEqual(errors, []);
});

/* ---- T3 단계형 신청 (18개 화면): 각 화면을 끝까지 진행하며 단계마다 기준 화면과 비교 ---- */
const currentStepName = () => [...($('#currentStep')?.childNodes ?? [])].find(node => node.nodeType === 3 && node.textContent.trim())?.textContent.trim();
const checkAll = selector => window.document.querySelectorAll(selector).forEach(box => { if (!box.checked) click(box); });

/** 화면별 입력: 선택 단계(맞춤 단계 포함)와 입력 단계에서 필수 값 채우기 */
const STEP_FLOW_INPUTS = {
  'MY-05': { input: () => { $('#work').value = '테스트상사'; } },
  'PY-01': { input: () => { click($('input[name="kind"]')); attachFiles($('#docs'), ['receipt.pdf']); } },
  'PY-05': { input: () => setInput($('#amt'), '1,000,000') },
  'CH-05': { pick: () => click($('input[name="annuityPick"]')), input: () => setInput($('#age'), $('#age').options[2].value) },
  'CH-11': { input: () => setInput($('#age'), $('#age').options[1].value) },
  'CH-03': { input: () => click($('input[name="riders"]')) },
  'CH-10': { input: () => { $('#nm').value = '홍서연'; $('#bd').value = '2010-03-04'; $('#tel').value = '010-9876-5432'; } },
  'LN-02': { pick: () => setInput($('#loanAmount'), '3,000,000') },
};
const STEP_FLOW_IDS = ['MY-05', 'PY-01', 'PY-04', 'PY-05', 'PY-07', 'PY-09', 'CH-11', 'PM-01', 'PM-04', 'CH-10', 'CH-05', 'CH-07', 'CH-02', 'CH-03', 'CH-04', 'CH-06', 'LN-02', 'LN-04'];

for (const id of STEP_FLOW_IDS) {
  test(`T3 ${id} 단계마다 본문이 기준 화면과 같다 (선택 → 입력 → 확인 → 인증 → 완료)`, async () => {
    fixRandom();
    fixClock();
    login();
    window.App.openScreen(id);
    const inputs = STEP_FLOW_INPUTS[id] ?? {};
    const visited = [];
    for (let guard = 0; guard < 6; guard++) {
      const step = currentStepName();
      visited.push(step);
      if (step === '선택') {
        if (inputs.pick) inputs.pick(); else click($('[data-action="pick"]'));
        assertMatchesGolden(`${id}-1선택`);
        click($('#next'));
      } else if (step === '입력') {
        inputs.input?.();
        checkAll('[data-agree]');
        assertMatchesGolden(`${id}-2입력`);
        click($('#next'));
      } else if (step === '확인') {
        assertMatchesGolden(`${id}-3확인`);
        click($('#next'));
      } else if (step === '인증') {
        assertMatchesGolden(`${id}-4인증`);
        click($('[data-auth="간편인증"]'));
        await wait(1400);
        if ($('#otp')) { $('#otp').value = '123456'; click($('#otpOk')); }
      } else {
        assert.equal(step, '완료');
        assertMatchesGolden(`${id}-5완료`);
        break;
      }
    }
    assert.equal(visited.at(-1), '완료', visited.join(' → '));
    assert.deepEqual(errors, []);
  });
}

/* T3 입력 동작 특성 테스트 */
const goToInput = (id, pick = () => click($('[data-action="pick"]'))) => {
  login();
  window.App.openScreen(id);
  if (currentStepName() === '선택') { pick(); click($('#next')); }
  assert.equal(currentStepName(), '입력');
};

test('T3 선택 전에는 다음 버튼이 비활성, 계약을 고르면 피보험자를 미리 선택 (PY-01)', () => {
  login();
  window.App.openScreen('PY-01');
  assert.equal($('#next').disabled, true);
  assert.equal($('#pickHint').textContent, '먼저 위에서 하나를 선택해야 다음 단계로 갈 수 있습니다.');
  click($('[data-action="pick"][data-key="2019-0234567"]'));
  assert.equal($('#next').disabled, false);
  assert.equal($('[data-action="pick"].on').dataset.key, '2019-0234567');
  click($('#next'));
  assert.equal($('input[name="who"]:checked').value, '홍서연(자녀)');
  attachFiles($('#docs'), ['a.jpg', 'b.pdf']);
  assert.deepEqual(texts('#fl-docs .fchip'), ['a.jpg', 'b.pdf']);
  assert.deepEqual(errors, []);
});

test('T3 필수 입력·필수 확인 검증과 초점 (CH-10 · MY-05)', () => {
  goToInput('CH-10');
  click($('#next'));
  assert.equal($('#e-nm').textContent, '새 수익자 이름을(를) 입력해 주세요.');
  assert.equal(window.document.activeElement, $('#nm'));
  assert.equal(currentStepName(), '입력');

  goToInput('MY-05');
  $('#work').value = '테스트상사';
  click($('#next'));
  assert.equal($('#agrErr').textContent, '필수 확인 항목에 모두 체크해 주세요.');
  assert.equal(window.document.activeElement, $('[data-agree="0"]'));
  assert.equal(currentStepName(), '입력');
  assert.deepEqual(errors, []);
});

test('T3 금액 입력: 숫자만·천 단위, 빠른 금액·최대, 범위 검증, 실시간 계산 (PY-05)', () => {
  goToInput('PY-05');
  setInput($('#amt'), '12abc34');
  assert.equal($('#amt').value, '1,234');
  click($('[data-add="100000"]'));
  assert.equal($('#amt').value, '101,234');
  click($('[data-add="max"]'));
  assert.equal($('#amt').value, '5,210,000');
  assert.match($('#calc').textContent, /실지급액5,208,000원/);
  setInput($('#amt'), '50000');
  click($('#next'));
  assert.equal($('#e-amt').textContent, '최소 100,000원 이상 입력해 주세요.');
  setInput($('#amt'), '6000000');
  click($('#next'));
  assert.equal($('#e-amt').textContent, '최대 5,210,000원까지 가능합니다.');
  assert.deepEqual(errors, []);
});

test('T3 조건부 항목과 가상계좌 발급 (PM-01)', async () => {
  fixRandom();
  fixClock();
  goToInput('PM-01');
  assert.equal($('[data-f="acct"]').hidden, false);
  assert.equal($('[data-f="vbank"]').hidden, true);
  $('input[name="how"][value="가상계좌로 이체"]').click();
  assert.equal($('[data-f="acct"]').hidden, true);
  assert.equal($('[data-f="vbank"]').hidden, false);
  $('input[name="vbank"][value="농협"]').click();
  $('input[name="cnt"][value="3개월 선납"]').click();
  assert.match($('#calc').textContent, /납입할 금액384,173원/);
  click($('#next'));
  assertMatchesGolden('PM-01-virtual-3확인');
  click($('#next'));
  click($('[data-auth="간편인증"]'));
  await wait(1400);
  assertMatchesGolden('PM-01-virtual-5완료');
  assert.deepEqual(errors, []);
});

test('T3 연금유형에 따라 항목이 고정·해제된다 (CH-07)', async () => {
  goToInput('CH-07');
  const lockedNote = id => $(`[data-f="${id}"] .lock-note`);
  assert.equal(lockedNote('fixed').textContent, '종신연금 선택 시 고정');
  $('input[name="type"][value="확정연금"]').click();
  assert.equal($('input[name="growth"]:checked').value, '정액형');
  assert.equal($('input[name="growth"]:checked').disabled, true);
  assert.equal($('[data-f="growth"]').classList.contains('locked'), true);
  assert.equal($('[data-f="fixed"]').classList.contains('locked'), false);
  await wait(60);
  assert.match($('#liveRegion').textContent, /바뀐 항목: /);
  assertMatchesGolden('CH-07-locked');
  assert.match($('#calc').textContent, /확정연금/);
  assert.deepEqual(errors, []);
});

test('T3 연금개시 변경: 계약 카드 선택 검증, 계약을 바꾸면 고른 나이 초기화 (CH-05)', () => {
  login();
  window.App.openScreen('CH-05');
  click($('#next'));
  assert.equal($('#pickErr').textContent, '연금개시 나이를 바꿀 계약을 선택해 주세요.');
  assert.equal(window.document.activeElement, $('input[name="annuityPick"]'));
  const radios = window.document.querySelectorAll('input[name="annuityPick"]');
  click(radios[0]);
  assert.equal($('#pickErr').textContent, '');
  assert.ok(radios[0].closest('.annuity-card').classList.contains('on'));
  click($('#next'));
  setInput($('#age'), $('#age').options[2].value);
  click($('[data-action="step-prev"]'));
  click(window.document.querySelectorAll('input[name="annuityPick"]')[1]);
  click($('#next'));
  assert.equal($('#age').value, '');
  assert.deepEqual(errors, []);
});

test('T3 대출 신청금액에 맞춰 이율 낮은 계약부터 배정 (LN-02)', async () => {
  login();
  window.App.openScreen('LN-02');
  click($('#next'));
  assert.equal($('#e-loanAmount').textContent, '대출 신청금액을(를) 입력해 주세요.');
  setInput($('#loanAmount'), '15000000');
  assert.equal($('#e-loanAmount').textContent, '');
  assert.equal(window.document.querySelectorAll('.loan-card.on').length, 2);
  assert.match($('#loanPlan .sumline').textContent, /15,000,000원/);
  await wait(60);
  assert.match($('#liveRegion').textContent, /2개 계약에 배정, 배정 합계 15,000,000원/);
  click($('[data-add="max"]'));
  assert.match($('#loanPlan .sumline').textContent, /29,140,000원/);
  assert.deepEqual(errors, []);
});

test('T3 이전 단계로 돌아가도 입력값 유지 (CH-10)', () => {
  goToInput('CH-10');
  $('#nm').value = '홍서연'; $('#bd').value = '2010-03-04'; $('#tel').value = '010-9876-5432';
  checkAll('[data-agree]');
  click($('#next'));
  assert.equal(currentStepName(), '확인');
  click($('[data-action="step-prev"]'));
  assert.equal(currentStepName(), '입력');
  assert.equal($('#nm').value, '홍서연');
  assert.equal(window.document.activeElement, $('#currentStep'));
  assert.deepEqual(errors, []);
});

/* ---- 페이지: 메인 · 전체메뉴 · 로그인 · 업무 화면 틀 (#main 전체) ---- */
const keydown = (element, key) => element.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

test('페이지 기준 화면: 메인(비로그인·로그인) · 로그인(일반·이어서 열 화면) · 업무 화면 틀', () => {
  assertMatchesGolden('page-home-guest', '#main');
  window.App.navigate('login');
  assertMatchesGolden('page-login', '#main');
  window.App.openScreen('CT-01');
  assertMatchesGolden('page-login-pending', '#main');
  login();
  window.App.navigate('home');
  assertMatchesGolden('page-home-member', '#main');
  window.App.openScreen('PY-05');
  assertMatchesGolden('page-screen-PY-05', '#main');
  assert.deepEqual(errors, []);
});

test('메인 업무 검색: 추천·화살표 선택·Enter 이동, 결과 없음, 바깥 누르면 닫힘', async () => {
  const input = $('#q');
  setInput(input, '청구');
  assert.equal($('#sug').hidden, false);
  assert.equal(input.getAttribute('aria-expanded'), 'true');
  const options = texts('#sugList [role="option"] span');
  assert.ok(options.length >= 2, options.join());
  keydown(input, 'ArrowDown');
  keydown(input, 'ArrowDown');
  keydown(input, 'ArrowUp');
  assert.equal(input.getAttribute('aria-activedescendant'), 'sug-0');
  assert.equal($('#sug-0').getAttribute('aria-selected'), 'true');
  assert.ok($('#sug-0').classList.contains('on'));
  await wait(60);
  assert.match($('#liveRegion').textContent, /추천 업무 \d+건/);
  assertMatchesGolden('page-home-search', '#main');

  setInput(input, 'zzz');
  assert.equal($('#sug .empty').textContent, '“zzz”와 맞는 업무가 없습니다. 전체메뉴에서 찾아보세요.');
  assert.equal(input.getAttribute('aria-expanded'), 'false');
  keydown(input, 'Escape');
  assert.equal($('#sug').hidden, true);

  setInput(input, '청구');
  click($('#main h1'));
  assert.equal($('#sug').hidden, true);

  setInput(input, '청구');
  keydown(input, 'Enter');
  assert.equal(window.App.state.route.page, 'login', '로그인이 필요한 첫 추천 화면');
  assert.ok(window.App.state.pendingScreenId);
  assert.deepEqual(errors, []);
});

test('메인 찾기 버튼은 첫 추천 화면으로 이동', () => {
  login();
  window.App.navigate('home');
  setInput($('#q'), '주소');
  click($('#qbtn'));
  assert.equal(window.App.state.route.screenId, 'MY-01');
  assert.deepEqual(errors, []);
});

test('메인 공지사항: 고른 글이 펼쳐진 게시판, 다른 글을 누르면 하나만 펼침', () => {
  click($('[data-action="open-notices"][data-notice="n9"]'));
  assert.equal($('#nq-n9').getAttribute('aria-expanded'), 'true');
  assert.equal($('#na-n9').hidden, false);
  assert.equal(window.document.activeElement, $('#nq-n9'));
  click($('#nq-n8'));
  assert.equal($('#na-n9').hidden, true);
  assert.equal($('#na-n8').hidden, false);
  assert.deepEqual(errors, []);
});

test('전체메뉴: 2Depth 펼치기(초점 유지·상태 기억), 메뉴 검색', async () => {
  window.App.navigate('all');
  assertMatchesGolden('page-all-menu', '#main');
  const toggle = () => $('.am-col[data-group="대출"] .acc-h');
  toggle().focus();
  click(toggle());
  assert.equal(toggle().getAttribute('aria-expanded'), 'true');
  assert.equal(toggle().closest('.acc').classList.contains('open'), true);
  assert.equal(toggle().nextElementSibling.hidden, false);
  assert.equal(window.document.activeElement, toggle(), '초점 유지');
  window.App.navigate('home');
  window.App.navigate('all');
  assert.equal(toggle().getAttribute('aria-expanded'), 'true', '다시 열어도 펼친 상태');
  assertMatchesGolden('page-all-menu-open', '#main');

  setInput($('#amq'), '대출');
  assertMatchesGolden('page-all-menu-search', '#main');
  await wait(60);
  assert.match($('#liveRegion').textContent, /맞는 메뉴 \d+개/);
  setInput($('#amq'), 'zzzz');
  assert.equal($('#amNone').hidden, false);
  setInput($('#amq'), '');
  assert.equal($('#amNone').hidden, true);
  assert.equal(window.document.querySelectorAll('.acc.open').length, 1, '검색을 지우면 원래 펼침 상태');
  assert.deepEqual(errors, []);
});

test('로그인: 인증하면 이어서 열 화면으로', async () => {
  window.App.openScreen('CT-01');
  assert.match($('#main p').textContent, /계약종합현황 화면은 본인 확인 후 이용할 수 있습니다/);
  click($('[data-action="login"][data-method="간편인증"]'));
  await wait(1400);
  assert.equal(window.App.state.isLoggedIn, true);
  assert.equal(window.App.state.route.screenId, 'CT-01');
  assert.equal($('#main h1').textContent, '계약종합현황');
  assert.deepEqual(errors, []);
});

/* ---- 모달 (#layer): 내용 기준 화면 · 초점 관리 · 인증 · 바로가기 ---- */
const layerGolden = name => assertMatchesGolden(`modal-${name}`, '#layer');
const escape = () => window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
const stubDownload = () => {
  const saved = {};
  window.URL.createObjectURL = blob => { saved.blob = blob; return 'blob:test'; };
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = function () { saved.name = this.download; };
  return saved;
};

test('모달: 첫 버튼으로 초점, Esc 닫기 후 연 버튼으로 초점 복귀 (확인 창 · MY-02)', () => {
  login();
  window.App.openScreen('MY-02');
  const opener = $('#eConsent');
  opener.focus();
  click(opener);
  layerGolden('confirm');
  assert.equal($('#layer .dim').getAttribute('aria-labelledby'), 'modalTitle');
  assert.equal($('#modalTitle').textContent, '전자적방법 수신동의 해제');
  assert.equal(window.document.activeElement, $('#dlgX'));
  escape();
  assert.equal($('#layer .dim'), null);
  assert.equal(window.document.activeElement, opener);
  assert.deepEqual(errors, []);
});

test('모달: 서명 수단 → 인증 대기(Esc 무시) → 휴대폰 추가인증(오류·연장·재전송) → 완료 (PM-02)', async () => {
  login();
  window.App.openScreen('PM-02');
  $('#no').value = '12345678';
  click($('[data-agree="0"]'));
  click($('#next'));
  layerGolden('sign-A2');
  click($('#layer [data-auth="공동인증서"]'));
  layerGolden('auth-waiting');
  escape();
  assert.ok($('#layer .spin'), '인증 대기 중에는 Esc로 닫히지 않음');
  await wait(1400);
  layerGolden('otp');
  assert.equal(window.document.activeElement, $('#otp'));
  $('#otp').value = '12';
  click($('#otpOk'));
  assert.equal($('#otpErr').textContent, '인증번호 6자리를 정확히 입력해 주세요.');
  assert.equal($('#otp').getAttribute('aria-invalid'), 'true');
  click($('#otpExtend'));
  await wait(60);
  assert.match($('#liveRegion').textContent, /남은 시간을 3분으로 연장했습니다/);
  click($('#otpResend'));
  assert.equal($('#otpErr').textContent, '');
  assert.ok(toasts().includes('인증번호를 다시 보냈습니다.'));
  $('#otp').value = '123456';
  click($('#otpOk'));
  assert.equal($('#layer .dim'), null);
  assert.equal($('#sbody .donebox h2').textContent, '변경이 완료되었습니다');
  assert.deepEqual(errors, []);
});

test('모달: 우편번호 검색 · 신청 취소 · 펀드 진단 안내 내용', () => {
  login();
  window.App.openScreen('MY-01');
  click($('[data-zip="addrH"]'));
  layerGolden('zip');
  click($('#layer [data-action="close-modal"]'));
  window.App.openScreen('PY-06');
  click($('.cell-btn[data-index="0"]'));
  click($('[data-action="cancel-request"]'));
  layerGolden('cancel-request');
  click($('#layer [data-action="close-modal"]'));
  window.App.openScreen('CH-01');
  setInput($('#fd0'), '30');
  setInput($('#fd4'), '10');
  click($('#next'));
  layerGolden('suitability-required');
  click($('#layer [data-action="close-modal"]'));
  assert.equal($('#layer .dim'), null);
  assert.deepEqual(errors, []);
});

test('모달: 공지 게시판 · 바로가기 안내(기기 탭·파일 받기) · 로그인 인증 대기', async () => {
  click($('[data-action="open-notices"][data-notice="n9"]'));
  layerGolden('notice-board');
  click($('#layer [data-action="close-modal"]'));
  click($('[data-action="open-shortcut"]'));
  layerGolden('shortcut-pc');
  click($('[data-action="shortcut-tab"][data-tab="ios"]'));
  layerGolden('shortcut-ios');
  click($('[data-action="shortcut-tab"][data-tab="and"]'));
  assert.equal($('[data-action="shortcut-tab"].on').dataset.tab, 'and');
  click($('[data-action="shortcut-tab"][data-tab="pc"]'));
  const saved = stubDownload();
  click($('[data-action="download-shortcut"][data-kind="mac"]'));
  assert.equal(saved.name, 'iM라이프 사이버창구.webloc');
  assert.ok(toasts().includes('바로가기 파일을 내려받았습니다. 바탕화면으로 옮겨 주세요.'));
  click($('[data-action="download-shortcut"][data-kind="win"]'));
  assert.equal(saved.name, 'iM라이프 사이버창구.zip');   // 크롬·엣지가 .url 을 .download 로 바꾸므로 zip 에 담음
  assert.ok(toasts().includes('바로가기 압축 파일을 내려받았습니다. 압축 파일 안의 바로가기를 바탕화면으로 옮겨 주세요.'));
  assert.match(await saved.blob.text(), /iM라이프 사이버창구\.url\[InternetShortcut\]\r\nURL=https:\/\/example\.test\/\r\n/);   // 지금 보고 있는 사이버창구를 연다
  click($('#layer [data-action="close-modal"]'));
  click($('#main [data-action="login"][data-method="간편인증"]'));
  layerGolden('login-waiting');
  assert.deepEqual(errors, []);
});

test('복사 버튼: 가상계좌번호 복사 안내 (PM-01)', async () => {
  login();
  window.App.openScreen('PM-01');
  window.document.execCommand = () => true;
  click($('[data-action="pick"]'));
  click($('#next'));
  $('input[name="how"][value="가상계좌로 이체"]').click();
  click($('#next'));
  click($('#next'));
  click($('[data-auth="간편인증"]'));
  await wait(1400);
  click($('[data-action="copy-text"]'));
  await wait(10);
  assert.ok(toasts().includes('가상계좌번호를 복사했습니다.'));
  assert.deepEqual(errors, []);
});
