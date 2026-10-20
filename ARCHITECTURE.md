# ARCHITECTURE

iM라이프 사이버창구 기획 검토용 프로토타입의 구조와 설계 원칙. 명령·폴더 개요는 README, 작업 규칙은 CLAUDE.md 참조.

## 1. 전제와 제약
- React 19 + TypeScript + Vite. 모든 화면(셸·메인·전체메뉴·로그인·업무 화면 53개·하단)은 React(TSX). 라우터·액션·모달 등 일부 모듈은 아직 JS. 런타임 의존성은 React 뿐
- 배포물은 `dist/index.html` 한 파일 (CSS·JS 인라인). 서버 없이 더블클릭·GitHub Pages로 열림
- 데이터·인증·거래는 모두 샘플·시뮬레이션. 외부 API 호출 없음 (하단 회사 홈페이지 링크만 예외)
- 화면 정의의 원본은 `docs/메뉴정의서.xlsx`, 코드는 이를 옮긴 `src/data/menu-spec.json`을 따른다

## 2. 프로젝트 구조
```
one-channel/
├── index.html                  # 메인 진입점 (셸 마크업, src/main.js 로드)
├── package.json                # 스크립트(dev·build·analyze·test)·개발 의존성
├── vite.config.js              # Vite(React 플러그인) + singlefile 빌드, vitest 설정
├── tsconfig.json               # TypeScript 설정 (allowJs: JS·TS 공존)
├── eslint.config.js            # 정적 분석 규칙
├── README.md                   # 명령·폴더 개요·화면 추가 순서
├── ARCHITECTURE.md             # 구조·설계 원칙 (이 문서)
├── CLAUDE.md                   # 작업 지침
├── MILESTONE.md                # 완료·다음 후보
├── WORKLOG.md                  # 작업 이력
│
├── .github/workflows/
│   └── deploy.yml              # main push → analyze·test·build → GitHub Pages
├── .vscode/
│   └── settings.json           # cSpell 단어 목록
│
├── docs/
│   ├── 메뉴정의서.xlsx          # 화면 정의 원본 (개정이력 포함)
│   └── 사이버창구_이용안내_v3.7.docx  # 고객용 이용안내
│
├── tests/
│   ├── smoke.test.js           # 빌드본(dist) jsdom 스모크·회귀 테스트
│   ├── domShape.js             # DOM 구조 정규화 (golden 비교용)
│   ├── golden/                 # 전환 전 업무 화면 본문 구조 기준 (T1·T5·표준 T4 화면, 발급·완료 화면)
│   └── unit/                   # vitest 단위 테스트 (TS 모듈·React 컴포넌트)
│
└── src/
    ├── main.js                 # 부팅, 테스트용 window.App 노출
    │
    ├── components/             # React(TSX) 컴포넌트 — 점진 전환 대상
    │   ├── Icon.tsx            # SVG 선 아이콘 (경로는 ui/icons.js)
    │   ├── Footer.tsx          # 공통 하단 이용 안내·회사 정보
    │   ├── mountFooter.tsx     # #footer 에 React 루트 마운트
    │   ├── widgets.tsx         # 상태칩·안내 박스·완료 카드·계산 박스·필수 확인 목록 (React)
    │   ├── form/               # 폼 필드 (Field.tsx: 텍스트·전화·이메일·날짜·선택·계좌·라디오·주소 + 오류 표시, fieldSpec.ts: 필드 타입·자동완성)
    │   └── shell/              # 공통 셸
    │       ├── Header.tsx      # PC 헤더 (로고·주메뉴·큰글씨·로그인·전체메뉴)
    │       ├── MegaMenu.tsx    # 주메뉴 2Depth·3Depth 메가메뉴
    │       ├── AppBar.tsx      # 모바일 상단 앱바
    │       ├── TabBar.tsx      # 모바일 하단 탭바
    │       ├── common.tsx      # 로고·큰글씨·로그인 버튼
    │       ├── useAppState.ts  # store 구독 훅 (useSyncExternalStore)
    │       └── mountShell.tsx  # 셸 마운트·refreshShell·메가메뉴 열기/닫기
    │
    ├── core/                   # 기반 유틸 (다른 레이어에 의존하지 않음)
    │   ├── config.ts           # 버전·기준일·하단 링크(FooterLink 타입)·기능 플래그
    │   ├── dom.js              # 선택자·HTML 조각·이스케이프·초점
    │   ├── format.ts           # 금액·날짜·시간 포맷, 입력 패턴, 접수번호
    │   ├── storage.js          # 브라우저 저장소 래퍼
    │   ├── download.js         # 파일 내려받기
    │   └── pdf.js              # 한글 PDF 생성
    │
    ├── state/
    │   └── store.ts            # 전역 상태(타입)·화면 진행 상태 초기화·구독(subscribe/notify)
    │
    ├── data/                   # Repository: 샘플 데이터와 조회 함수
    │   ├── menu-spec.json      # 메뉴정의서 행 (화면 정의 원천)
    │   ├── menuRepository.js   # 메뉴 트리·id 색인·검색 키워드
    │   ├── menu.ts             # 메뉴 데이터 타입 정의 (TS 컴포넌트용)
    │   ├── customerRepository.ts   # 고객·계약·계좌 (InsuranceContract 타입)
    │   ├── contractDocumentRepository.js  # 계약별 약관·안내장
    │   ├── fundRepository.ts   # 투자성향·적합성진단 (Fund·InvestProfile 타입)
    │   ├── consentRepository.ts    # 안내장 수신·마케팅 동의 현황
    │   ├── noticeRepository.js # 공지사항
    │   ├── addressRepository.js    # 우편번호 검색 샘플
    │   └── homeContent.js      # 메인·화면 부제 문구
    │
    ├── services/
    │   └── auth.js             # 로그인·전자서명 (시뮬레이션)
    │
    ├── app/
    │   ├── router.js           # 페이지·화면 전환, 로그인 가드, 뒤로가기
    │   └── render.js           # 다시 그리기(redrawMain: 셸 갱신 + 본문 새로 마운트), 큰글씨 전환 시 입력 보존 후 다시 그리기
    │
    ├── controller/
    │   ├── events.js           # 전역 이벤트 위임
    │   └── actions.js          # data-action → 처리 함수 (ACTIONS)
    │
    ├── ui/                     # 재사용 UI 위젯
    │   ├── infoBoxHtml.ts      # 안내 박스 HTML (모달 내용용)
    │   ├── statusTone.ts       # 처리 상태 → 색 톤 (JS·React 공용)
    │   ├── overlay.js          # 모달·토스트·화면낭독기 안내
    │   ├── icons.js            # SVG 아이콘
    │   └── a11y.js             # 표 접근성 보정
    │
    ├── form/
    │   ├── fieldValues.ts      # 화면 입력칸에서 값 읽기 (비제어 폼·큰글씨 전환 보존)
    │   ├── display.ts          # 확인 단계 표시값·조건부 항목·처음 그려질 때의 값
    │   ├── locks.ts            # 고정 규칙 (해당없음·고정값·바뀐 항목 안내)
    │   ├── focus.ts            # 첫 오류 칸으로 초점
    │   ├── zipSearch.ts        # 우편번호 검색 창
    │   └── validation.ts       # 입력 검증 규칙
    │
    ├── pages/
    │   ├── Main.tsx            # #main React 루트: route 별 페이지 (pageKey 로 새로 마운트)
    │   ├── HomePage.tsx        # 메인 (검색·요약·할 일·자주 찾는 업무·이럴 땐 이렇게·공지)
    │   ├── HomeSearch.tsx      # 업무 검색 콤보박스 (추천·화살표·Enter)
    │   ├── AllMenuPage.tsx     # 전체메뉴 (2Depth 펼치기·메뉴 검색)
    │   ├── LoginPage.tsx       # 로그인
    │   ├── ScreenPage.tsx      # 업무 화면 틀 (LNB·경로·제목·배지) + 화면유형 본문
    │   ├── screen.ts           # redrawMain·rerenderScreen, 큰글씨 전환 시 입력 보존
    │   └── noticeBoard.js      # 공지사항 게시판 모달 (HTML)
    │
    ├── screens/                # 화면 id별 선언형 설정 + React 전환 템플릿
    │   ├── reactTemplates.tsx  # 화면유형(T1~T5) → 본문 React 요소
    │   ├── list/               # T2 목록·상세 (listRules.ts 규칙 · ListScreen.tsx · ContractDetail.tsx 계약조회 · ListDetailScreen.tsx 상태 연결 · listActions.ts 취소·보완서류)
    │   ├── dashboard/          # T1 계약종합현황 (Dashboard.tsx · contractSummary.ts)
    │   ├── issuance/           # T5 발급 (Issuance.tsx 화면 부품 · IssuanceScreen.tsx 상태 연결)
    │   ├── singleForm/         # T4 단일폼 (SingleForm 표준 · CustomForms 안내장·마케팅 · CustomFormScreen 전용 화면 · SingleFormScreen 서명·완료 · completeSingleForm)
    │   ├── stepFlow/           # T3 단계형 (stepRules.ts 규칙 · StepFlow.tsx 단계 부품 · LoanPick·AnnuityPick 맞춤 선택 · VirtualAccountInfo · StepFlowScreen 상태 연결 · stepFlowActions 단계 이동)
    │   ├── fund/               # 펀드변경 (fundRules.ts 규칙 · FundViews.tsx 편집·진단·결과·비교 · fundFlow.ts 단계 진행)
    │   ├── listScreens.ts      # T2 목록 열·필터·상세 (ListConfig 타입, 행 상태 변경)
    │   ├── stepFlows.tsx       # T3 선택·입력·계산·동의 (설정 타입 StepFlowConfig)
    │   ├── changeForms.ts      # T4 현재값·입력·안내 (설정 타입 ChangeFormConfig)
    │   └── certificates.tsx    # T5 증명서·서류 (설정 타입 CertificateConfig)
    │
    ├── features/               # 업무 전용 로직
    │   ├── loanRules.ts        # 보험계약대출 계약 배정 (이율 낮은 순)
    │   ├── annuity.ts          # 연금개시 나이·연금유형 고정 규칙·예상액
    │   ├── annuityConversion.ts    # 연금전환 사전신청 예상액
    │   ├── variableContract.ts # 변액 계약 선택 공유 (CT-03·CH-01)
    │   ├── virtualAccount.ts   # 가상계좌 발급
    │   ├── contractDocuments.js    # 약관·안내장 PDF 생성·내려받기
    │   ├── largeText.js        # 큰글씨모드
    │   └── shortcut.js         # 바탕화면·홈 화면 바로가기
    │
    └── styles/
        └── app.css             # 디자인 토큰·레이아웃·컴포넌트 스타일
```

## 3. 레이어와 의존 방향
위 레이어가 아래 레이어만 참조하는 것이 원칙이다. 현재 허용 중인 예외는 4절 참조.

| 레이어 | 폴더 | 책임 |
|---|---|---|
| 진입 | `main.js` | 부팅(설정 클래스·큰글씨 복원·이벤트 바인딩·첫 렌더), 테스트용 `window.App` 노출 |
| 컨트롤러 | `controller` | 전역 이벤트 위임, `data-action` → 처리 함수 매핑(ACTIONS) |
| 앱 | `app` | 라우팅(페이지·화면 전환, 로그인 가드, 뒤로가기), 셸+페이지 렌더 |
| 페이지 | `pages` | 메인·전체메뉴·로그인·업무 화면 틀(LNB·제목·템플릿 선택) |
| 화면유형 | `screens/<유형>` · `components` | T1~T5 React 화면 부품·상태 연결, 공통 셸·위젯·폼 필드 |
| 화면 설정 | `screens` | 화면 id별 세부 정의(필드·계산·안내·동의) — 선언형 데이터 |
| 기능 | `features` | 특정 업무 전용 로직(대출 배정, 연금 규칙, 펀드 진단, 서류 PDF 등) |
| 공통 | `form` · `ui` · `services` | 폼 엔진, 위젯·모달·토스트·접근성, 인증·전자서명 시뮬레이션 |
| 데이터 | `data` | Repository: 메뉴정의서·고객·계약·펀드·공지 등 샘플과 조회 함수 |
| 기반 | `state` · `core` | 전역 상태, 설정·DOM·포맷·저장소·다운로드·PDF 유틸 |

## 4. Clean Architecture 원칙 적용
```
┌────────────────────────────────────────────────┐
│        Presentation Layer (UI)                 │
│  - index.html, styles/app.css                  │
│  - ui (셸·위젯·모달·아이콘·접근성)             │
│  - pages (메인·전체메뉴·로그인·업무 화면 틀)   │
│  - components·screens/<유형> (React 화면)      │
└────────┬───────────────────────────────────────┘
         │
┌────────▼───────────────────────────────────────┐
│        Application Layer                       │
│  - main.js (부팅·조립)                         │
│  - controller (이벤트 위임·ACTIONS)            │
│  - app (라우터·렌더 조정·로그인 가드)          │
│  - state (전역 상태)                           │
└────────┬───────────────────────────────────────┘
         │
┌────────▼───────────────────────────────────────┐
│        Business Logic Layer                    │
│  - screens (화면별 선언형 설정)                │
│  - features (대출·연금·펀드·서류 등 업무 규칙) │
│  - form (폼 엔진: 검증·고정 규칙·계산 표시)    │
│  - services (인증·전자서명, 시뮬레이션)        │
└────────┬───────────────────────────────────────┘
         │
┌────────▼───────────────────────────────────────┐
│        Data Layer                              │
│  - data (Repository: 메뉴정의서·고객·계약…)    │
│  - core (설정·포맷·DOM·저장소·PDF·다운로드)    │
└────────────────────────────────────────────────┘
```

| 원칙 | 적용 방식 |
|---|---|
| 의존성 규칙 | 바깥(UI) → 안쪽(데이터) 한 방향. `core`·`state`·`data`는 다른 레이어를 참조하지 않는다 |
| 단일 책임 | 화면유형 공통 동작은 screens/<유형> 컴포넌트, 화면별 차이는 screens 설정, 업무 규칙은 features·*Rules.ts 순수 로직으로 분리 |
| 선언형 설정 | 화면 추가는 menu-spec.json 행 + screens 설정 추가가 기본. 템플릿 코드는 수정하지 않는다 |
| 데이터 접근 분리 | 샘플 데이터 조회·가공은 data의 Repository 함수로만. 운영 전환 시 data만 API 연동으로 교체 |
| 외부 연동 격리 | 인증·전자서명은 services, URL·기능 플래그는 core/config에 모아 교체 지점을 한정 |
| 이벤트 단일 진입 | 클릭은 data-action으로 controller 한 곳에서 처리. UI는 동작을 직접 소유하지 않는다 |

허용 중인 역방향 참조 (정리 대상)
- screens·features → `pages/screen`의 화면 다시 그리기, features → `app/render`의 전체 다시 그리기, services → `app/router`의 로그인 후 화면 이동: 상태 변경 후 갱신 요청. 화면 틀까지 React로 옮기고 store 구독으로 바꾸면 해소

## 5. 런타임 흐름
- **렌더링**: 화면 전체가 React — 셸(헤더·앱바·탭바)·본문(#main)·하단 루트가 store 를 구독하고 `refreshShell()`(flushSync + notify)로 동기 갱신. 화면 이동·다시 그리기는 `pageKey` 를 올려 본문 페이지를 새로 마운트, 제자리 갱신(전체메뉴 펼치기)은 마운트 없이 갱신. 모달 내용만 HTML 문자열(출력 시 이스케이프)
- **페이지 전환**: `state.route.page`(home·all·login·screen)에 따라 `app/render`가 페이지를 고름. 업무 화면 이동 시 h1 초점 이동·문서 제목 갱신(KWCAG)
- **로그인 가드**: 인증수준이 A0가 아닌 화면을 미로그인 상태로 열면 로그인으로 보낸 뒤, 로그인 완료 시 원래 화면을 이어서 연다
- **클릭 처리**: 모든 버튼은 `data-action` + `data-*` 속성만 갖고, 처리는 `controller/actions`의 ACTIONS 한 곳에 모은다
- **부분 갱신**: 업무 화면 안의 변화는 `rerenderScreen`으로 해당 화면만 다시 그린다. 큰글씨 전환은 입력값을 상태에 저장한 뒤 전체를 다시 그린다

## 6. 화면 정의 파이프라인
1. `menu-spec.json` 한 행 = 한 화면 (id, 1~3Depth, 화면유형, 인증수준, 표시·입력·결과 정보 등). 배열 순서가 메뉴 표시 순서
2. `data/menuRepository`가 이를 1Depth → 2Depth → 3Depth 트리, id 색인, 검색 키워드로 가공 → GNB·전체메뉴·LNB·메인 검색이 공유
3. `pages/ScreenPage`가 화면유형으로 `screens/reactTemplates`의 React 화면을 고른다

| 화면유형 | React 화면 | 화면별 설정 |
|---|---|---|
| T1 대시보드 | screens/dashboard | - |
| T2 목록+상세 | screens/list | `screens/listScreens` |
| T3 단계형 신청 | screens/stepFlow | `screens/stepFlows` |
| T4 단일폼 변경 | screens/singleForm · screens/fund | `screens/changeForms` |
| T5 발급 | screens/issuance | `screens/certificates` |

4. 설정만으로 표현이 안 되는 동작은 설정이 맞춤 선택 단계(`pick.custom`), React 요약(`describe`·`summary`·`doneExtra`), `features/*` 규칙(계산·고정 규칙 등)을 참조해 확장한다

## 7. 상태 모델
- 전역 `state` 객체 하나. 라우트·이력·로그인 여부·UI 설정·현재 화면 진행 상태로 구성
- 화면 이동 시 화면 진행 상태(`flow`: T3~T5 단계·선택·입력·동의, `list`: T2 기간·필터·선택 행)는 새로 초기화
- 화면을 넘나들며 유지할 값(예: 선택한 변액 계약)만 별도 필드로 둔다
- 브라우저 저장소는 큰글씨 설정 한 가지만 사용

## 8. 폼 엔진
- 필드 정의(유형·라벨·옵션·필수·도움말)로 입력 UI 생성, 값 수집, 검증, 오류 표시를 일괄 처리
- 유형: 텍스트·전화·날짜·선택·라디오·체크·금액·계좌·주소·파일 등
- 고정 규칙(lockRules)으로 다른 선택값에 따라 항목을 고정값으로 잠근다 (연금개시유형 등)
- 계산(calc)은 입력값을 받아 요약 행 목록을 돌려주고, 템플릿이 금액 카드로 표시

## 9. 접근성 (KWCAG)
- 본문 바로가기, 화면별 문서 제목, h1→h2→h3 순서, 키보드 초점 표시, 명도 대비 4.5:1 이상
- 상태는 색 외에 텍스트·aria 속성으로도 표시(현재 메뉴, 단계, 필수 항목), 표 열 제목 scope 지정, 가로 스크롤 표는 키보드 스크롤·이름 제공
- 새 창 링크·다운로드 버튼에는 화면낭독기용 보조 문구를 둔다

## 10. 빌드·테스트·배포
- 빌드: Vite + singlefile 플러그인 → 단일 HTML
- 정적 분석: ESLint (`npm run analyze`), 철자: `.vscode/settings.json`의 cSpell 단어 목록
- 테스트: 소스가 아닌 빌드 결과를 jsdom에 올려 검사(스모크). 전 화면 열림, 회귀 버그, 주요 기능(다운로드·계산·메뉴 순서)
- 배포: main push → GitHub Actions(analyze·test·build) → GitHub Pages. 검사 실패 시 배포되지 않는다

## 11. 확장 규칙
- 화면 추가·변경: 메뉴정의서 → `menu-spec.json` → `screens/*` 설정 → 필요 시 `features/*` → 테스트, 메뉴정의서 비고·개정이력 갱신
- 새 클릭 동작은 onclick 대신 ACTIONS에 추가
- 샘플 데이터 조회·가공은 `data`의 Repository 함수로, 업무 규칙은 `features`로 분리해 화면 설정은 선언형으로 유지
- 운영 전환 시 교체 지점: `data`(API 연동), `services`(실제 인증·전자서명), `core/config`(URL·기능 플래그)

## 12. 알려진 부채
- 일부 모달·폼 내부에 onclick 직접 바인딩이 남아 있음 → ACTIONS로 통일 예정
- 샘플 데이터 변경(취소·제출)이 템플릿에 흩어져 있음 → Repository 함수로 일원화 예정
- T3 전 과정(인증·완료까지) 테스트 범위가 좁음
- 화면 다시 그리기 요청 등 일부 역방향 참조 (4절) → 콜백 주입·이벤트 방식으로 정리 예정
