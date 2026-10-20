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

  click($('[data-action="contract-tab"][data-index="1"]'));   // 변액연금도 약관 · 보험상품안내장 각 1건
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
function assertMatchesGolden(name) {
  const file = new URL(`./golden/${name}.json`, import.meta.url);
  const shape = domShape($('#sbody'));
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
