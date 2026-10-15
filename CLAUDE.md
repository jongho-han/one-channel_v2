# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

iM라이프 사이버창구 기획 검토용 프로토타입 (메뉴정의서 53개 화면). 프레임워크 없는 바닐라 JS(ES 모듈) + Vite. 데이터는 모두 샘플, 인증·거래는 시뮬레이션.

## 명령
- `npm run dev` 개발 서버 / `npm run build` → `dist/index.html` 단일 파일 (vite-plugin-singlefile, CSS·JS 인라인. 더블클릭으로 열려야 함)
- `npm run analyze` ESLint / `npm test` 빌드 후 `node --test` 실행
- 테스트 하나만: `npm run build && node --test --test-name-pattern="CT-02" tests/smoke.test.js`
- 테스트는 소스가 아닌 **빌드 결과 `dist/index.html`** 을 jsdom에 올려 검사하므로 소스 수정 후 반드시 재빌드. 테스트에서는 `window.App`(state·render·openScreen 등)으로 화면을 연다

## 아키텍처 (흐름)
- 진입 `src/main.js` → `controller/events.js` 전역 이벤트 바인딩 → `app/render.js` 가 셸 + `state.route.page`(home·all·login·screen)별 페이지 렌더
- 상태는 `state/store.js` 의 전역 `state` 객체 하나. 화면 이동 시 `state.screen` 은 `freshScreenState()` 로 초기화 (`flow`: T3~T5 진행, `list`: T2)
- 라우팅 `app/router.js`: `openScreen(id)` 는 `authLevel` 이 A0 가 아니고 미로그인이면 로그인으로 보낸 뒤 이어서 연다. 화면 전환 시 h1 초점 이동·문서 제목 갱신 (KWCAG)
- 렌더링은 HTML 문자열 → `innerHTML`. 사용자 표시값은 `core/dom.js` 의 `escapeHtml` 사용
- 클릭은 요소의 `data-action="이름"` + `data-*` 를 `controller/actions.js` 의 `ACTIONS` 맵 한 곳에서 처리. 새 버튼은 onclick 대신 여기에 액션 추가
- 화면 정의의 원천은 `src/data/menu-spec.json` (메뉴정의서 행: id·depth1~3·screenType·authLevel 등). `pages/screen.js` 가 `screenType`(T1 대시보드·T2 목록·T3 단계형·T4 단일폼·T5 발급)으로 `templates/*` 의 render/bind 를 고르고, 화면별 세부 설정은 `screens/*`(stepFlows·changeForms·certificates·listScreens)에서 화면 id 키로 조회
- 큰글씨 전환은 `refresh()` 로 입력값 저장(`saveScreenInputs`) 후 다시 그림. 입력 상태 유실 회귀 주의
- 화면 추가 순서: 메뉴정의서 → `menu-spec.json` → `screens/*` 설정 → 필요 시 `features/*` 모듈 → 테스트 (README 참조)

## 커뮤니케이션
- 사용자가 영어로 물어봐도 한국어로 대답
- /compact 후에는 반드시 이 지침을 명시적으로 리로드 해야 한다

## 실행 / Git
- app run 금지. 사용자가 직접 실행해야 함
- git add, commit, push 금지. 사용자가 지시할때만 수행
- remote push 할때 api key, id/pw, 휴대폰번호, 주민번호 포함 파일 push 절대 금지

## 코드 품질
- 변경후 analyze 실행하여 에러 없는지 확인 (`npm run analyze`, 테스트는 `npm test`)
- fix all major linting and avoid minor via analysis options
- avoid all the cSpell via settings json of .vscode
- 사용을 완료한 로그 및 디버그 코드는 가급적 제거. 재확인 가능성 높은 경우 주석처리

## 아키텍처
- clean architecture and widgetize the codebase
- 협업을 하기 좋은 코드구조 유지
- 기능을 구현하기 전에 리팩터링 까지 고려하여 설계
- 의존성 주입, 상태관리, 모듈화
- provider, repository, controller 분리 적극 권장

## 문서
- markdown 등 문서를 만들때 한글깨짐 유의하여 UTF-8로 작성
- markdown 에 소스코드는 넣지 말아라. 실제 소스와 중복이고 업데이트 안된다
- 모든 문서는 필수, 핵심만 간결하게 정리
- 완료된 항목이 있으면 @MILESTONE.md 마일스톤 업데이트
- 메뉴정의서 원본은 docs/메뉴정의서.xlsx. 화면·기능 변경 시 해당 행 비고와 개정이력도 함께 갱신하고 src/data/menu-spec.json 과 일치시킬 것

## Windows Batch (.bat)
- windows 용 .bat 파일 작성시 ANSI 인코딩 사용
- .bat 의 echo 에 ( ) 를 쓰면 오류 난다. ^( ^) 로 escape


## WORKLOG 규칙
매 작업완료 시마다 사용자 프롬프트와 작업완료 시간(연월일시분초까지. client device 시각 기준) 간략한 작업내용 기술
- 시각은 KST(Asia/Seoul) 기준. 웹/클라우드 세션은 `TZ=Asia/Seoul date` 로 확인

## 배포
- main 에 push 하면 GitHub Actions 가 analyze·test·build 후 GitHub Pages 로 자동 배포
- 확인 주소: https://jongho-han.github.io/one-channel_v2/