# WORKLOG

| 완료 시각 | 사용자 프롬프트 | 작업 내용 |
|---|---|---|
| 2026-10-10 08:14:08 | https://github.com/jongho-han/one-channel.git 에 올려줘 | git 초기화, .gitignore 추가, v3.6 HTML 커밋·push |
| 시각 미기록 | CLAUDE.md 에 (작업 지침) 내용 추가 | CLAUDE.md 생성, 지침 항목별 정리 |
| 2026-10-10 08:16:42 | push | CLAUDE.md 커밋·push |
| 시각 미기록 | 지침에 맞추어서 코드 다시 검토 | 전체 코드 검토, ESLint 분석, 구조·버그·정리 항목 보고 (코드 변경 없음) |
| 2026-10-10 08:27:54 | 3 (버그 수정 + 리팩터링 둘 다) | 모듈 분리·Vite 단일 파일 빌드, ESLint·cSpell·테스트 구성, 버그 4건 수정, README·MILESTONE 작성 |
| 2026-10-10 08:27:54 | WORKLOG.md 추가 | WORKLOG.md 생성, 이전 작업 기록 정리 |
| 2026-10-10 08:30:12 | push | v3.7 구조 개편·버그 수정 커밋(f5d38a8) 후 GitHub push |
| 2026-10-10 08:37:14 | push at all (Pages 배포 설정 · CLAUDE.md · WORKLOG) | GitHub Pages 자동 배포 워크플로 추가, CLAUDE.md에 KST·배포 규칙 추가, 커밋·push |
| 2026-10-10 08:41:24 | 다시 push, Pages 실행 안됨 | 배포 상태 확인: 첫 실행은 Pages 설정 전이라 실패, 재실행 성공. 배포본이 로컬 빌드와 동일함을 확인. WORKLOG push |
| 2026-10-10 08:49:16 | manual.xlsx 확인 후 업데이트 | 메뉴정의서 v3.7 갱신(버전·PY-02·CM-01·CM-06 비고, 개정이력 6건), 원본 백업. 프로토타입 menu-spec.json을 엑셀 기준으로 동기화(메뉴ID·1Depth·29개 항목), 기획정보에 비고 표시 |
| 2026-10-10 08:49:52 | 넣어줘 (메뉴정의서 저장소 추가) | manual.xlsx(업로드본)을 v3.7로 갱신, README·CLAUDE.md에 원본 위치·갱신 규칙 명시, v3.7 메뉴정의서 동기화 변경과 함께 커밋·push |
| 2026-10-10 08:50:46 | push | 변경 사항 없음 확인(원격과 동일), WORKLOG 기록만 push |
| 2026-10-10 08:53:09 | docs/메뉴정의서.xlsx로 넣어줘 | 루트 manual.xlsx를 docs/메뉴정의서.xlsx로 이동, README·CLAUDE.md 경로 수정, 커밋·push |
| 2026-10-10 09:15:13 | git pull | 원격 변경 없음(Already up to date) |
| 2026-10-10 09:22:42 | 계약조회 화면에서 각 계약별 약관, 안내장을 다운받을 수 있도록 해줘 | CT-02에 「약관·안내장」 카드 추가(약관·변액 분기 안내장·연간 계약안내장 PDF 다운로드), 서류 Repository·PDF 생성·공통 다운로드 모듈 분리, 메뉴정의서·menu-spec.json 갱신, 테스트 1건 추가 |
| 2026-10-10 09:23:38 | push | 계약조회 약관·안내장 다운로드 커밋(cba4ed2) 후 claude/blissful-fermat-8108x2 브랜치 push |
| 2026-10-10 09:28:21 | git pull | main 변경 없음. 원격 신규 브랜치 claude/blissful-fermat-8108x2 확인 |
| 2026-10-10 09:28:32 | push | WORKLOG 기록 커밋·push |
| 2026-10-10 09:29:40 | claude/blissful-fermat-8108x2 push | 브랜치를 main에 병합(WORKLOG 충돌 해결), analyze 오류 0·테스트 8건 통과 확인 후 main push |
| 2026-10-10 09:32:35 | 안내장은 계약시 해당 보험계약 안내장, 문구 수정 및 보험상품안내장 하나만 표시 | CT-02 서류를 약관·보험상품안내장(가입 당시 기준) 각 1건으로 변경, 안내장 PDF 본문을 가입 당시 계약 내용으로 수정, 안내 문구·테스트·menu-spec.json·메뉴정의서(비고·개정이력)·MILESTONE 갱신 |
| 2026-10-10 09:33:48 | push | 계약조회 보험상품안내장 변경 커밋·main push |
| 2026-10-12 10:36:18 | git pull | 원격 변경 없음(Already up to date) |
| 2026-10-12 10:41:00 | git pull | 원격 변경 없음(Already up to date) |
| 2026-10-12 11:19:11 | /init | CLAUDE.md 보완: 프로젝트 개요, 명령(단일 테스트 실행·테스트가 dist 빌드본 대상임), 아키텍처 흐름(렌더·상태·라우팅·data-action·menu-spec.json→템플릿) 추가 |
| 2026-10-12 11:19:34 | git pull | 원격 변경 없음(Already up to date) |
| 2026-10-12 11:19:51 | push | CLAUDE.md 보완·WORKLOG 커밋, main push |
| 2026-10-12 11:23:15 | 기획정보 보기는 불필요해 관련 토글 및 문구 없애줘 | 상단 「기획정보 보기」 스위치, 화면별 기획정보 패널, 전체메뉴 iM 대응수준 범례·배지, 펀드변경 시연용 진단일 선택 제거(planner.js 삭제, 관련 상태·액션·CSS·주석 정리). README·CLAUDE.md·MILESTONE·메뉴정의서 개정이력 갱신. analyze 0·테스트 8건 통과 |
| 2026-10-12 11:24:18 | push | 기획정보 보기 제거 커밋·main push |
| 2026-10-12 12:02:05 | CLAUDE.md 참고하여 재검토 | 지침 기준 점검: analyze 0·테스트 8건 통과, 기획정보 제거 잔존 참조 없음. 미사용 menu-spec 필드·적합성진단 3년 경과 시연 불가·인라인 핸들러 23곳·루트 v3.6 HTML 미추적 파일 보고 (코드 변경 없음) |
| 2026-10-12 12:04:37 | 1번 3년이 지난 날짜로 바꾸기, 4번은 .gitignore 넣어줘 | 샘플 적합성진단일 2024.02.20 → 2023.08.14(3년 경과, 펀드변경 시 재진단 시연 가능), 루트 v3.6 HTML .gitignore 추가. analyze 0·테스트 8건 통과 |
| 2026-10-12 15:13:39 | 업무메뉴얼을 word 파일로 만들어서 docs 폴더에 넣어줘 (이미지 첨부) | 고객용 이용안내 docs/사이버창구_이용안내_v3.7.docx 작성: 빌드본을 헤드리스 Chrome으로 캡처(사용자 허용)한 화면 28장, 시작하기·인증·업무 화면 이용법·메뉴별 안내(52개)·FAQ. MILESTONE 갱신 |
| 2026-10-12 15:15:11 | SEARCH_KEYWORDS의 PY-01에 "병원비"를 넣어줘 | 메인 검색 키워드 PY-01에 「병원비」 추가(예시 문구 「병원비」 단독 검색 시 결과 없던 문제). analyze 0·테스트 8건 통과 |
| 2026-10-12 15:15:39 | push | 이용안내 문서·적합성진단 샘플일·검색 키워드·.gitignore 커밋(a8a30b4) 후 main push |
| 2026-10-13 09:14:24 | <nav class="lnb"> 폭을 260px로 변경 | 좌측 메뉴(lnb) 열 폭 230px → 260px (.sub-layout 그리드 첫 열) |
| 2026-10-13 09:15:14 | push | 최신 main 병합(WORKLOG 충돌 해결), analyze 0·테스트 8건 통과 확인 후 claude/blissful-fermat-8108x2 push |
| 2026-10-13 09:15:51 | main에 병합하고 push 해줘 | claude/blissful-fermat-8108x2 (lnb 폭 260px) 를 main에 fast-forward 병합·push |
| 2026-10-13 09:19:45 | 좌측 메뉴 「보험료 자동대출납입 신청/취소」 강제 줄바꿈 → 한 줄 표시 | lnb 폭 260px 유지, 안쪽 여백(lnb·들여쓰기·버튼) 축소, 메뉴명 자간 -0.03em·줄바꿈 금지. 52개 메뉴 선택(굵게) 상태 모두 한 줄 확인, analyze 0·테스트 8건 통과 |
| 2026-10-13 09:20:41 | main에 병합하고 push | 좌측 메뉴 한 줄 표시 커밋 후 main fast-forward 병합·push |
| 2026-10-13 09:24:22 | lnb 260px -> 230으로 해도 한줄로 나올까? / 260px 유지 | 230px 측정 시 「보험계약대출 신청 현황 조회/취소」 약 15px 초과 확인, 260px 유지 결정 (코드 변경 없음) |
| 2026-10-13 09:28:34 | 바텀에 있는 개인정보처리방침에 https://www.imlifeins.co.kr/BE/BE_A030_2.do 링크 걸어줘 | 하단 「개인정보처리방침」을 새 창 링크로 변경(URL은 config.js APP.links, 화면낭독기 「새 창」 안내), 메뉴정의서 개정이력 추가, 테스트 1건 추가. analyze 0·테스트 9건 통과 |
| 2026-10-13 09:28:59 | main에 병합하고 push | 개인정보처리방침 링크 커밋 후 main fast-forward 병합·push |
| 2026-10-13 09:31:43 | 하단 신용정보활용체제(BE_A032)·고객권리안내(BE_A031) 링크 | 하단 이용 안내를 config.js footerLinks 목록으로 일원화(URL 있으면 새 창 링크, 개인정보처리방침만 강조), 두 항목 링크 연결, 테스트 갱신, 메뉴정의서 개정이력 추가. analyze 0·테스트 9건 통과 |
| 2026-10-13 09:32:39 | main에 병합하고 push | 하단 이용 안내 링크 커밋 후 main fast-forward 병합·push |
| 2026-10-13 09:38:22 | 신용정보활용체제, 고객권리안내 에 class="strong" 추가 | 하단 두 링크도 강조(class="strong", 굵은 남색) 표시 — config.js footerLinks 강조 여부 true. analyze 0·테스트 9건 통과 |
| 2026-10-13 09:38:45 | main에 병합하고 push | 하단 링크 강조 커밋 후 main fast-forward 병합·push |
| 2026-10-13 09:45:31 | 보험사기신고(BB_C020)·전자민원(BB_B010) 링크 + class="strong" | 하단 두 항목 새 창 링크 연결·굵게 강조(config.js footerLinks), 테스트 링크 확인 추가, 메뉴정의서 개정이력 추가. analyze 0·테스트 9건 통과 |
| 2026-10-13 09:46:51 | main에 병합하고 push | main 직접 수정본(footerLinks 대괄호 문법 오류) 병합 충돌을 올바른 형태로 해결, analyze 0·테스트 9건 통과 후 main push |
| 2026-10-13 10:04:18 | 보험계약관리 내 리스트 순서 변경 및 추가 (연금전환 사전신청 신규) | 보험계약관리 3Depth 11개 순서 변경, 명칭 「대리청구인 지정/등록」·「청약철회」, CH-11 연금전환 사전신청(T3: 종신보험 선택→전환 나이·연금 유형·지급 주기·계좌→예상 적립금·연금액 예시→동의→인증→접수, features/annuityConversion.js) 추가, 검색 키워드·menu-spec.json·메뉴정의서(행 순서·신규 행·화면 수·개정이력)·README·CLAUDE.md·MILESTONE 갱신, 테스트 1건 추가(전 화면 53). analyze 0·테스트 10건 통과 |
| 2026-10-13 10:05:29 | main에 병합하고 push | 보험계약관리 순서·연금전환 사전신청 커밋 후 main fast-forward 병합·push |
| 2026-10-14 15:22:47 | ARCHITECTURE.md 생성 | ARCHITECTURE.md 작성(전제·레이어 의존 방향·런타임 흐름·화면 정의 파이프라인·상태·폼 엔진·접근성·빌드/테스트/배포·확장 규칙·알려진 부채, 소스코드 미포함), README 참조 링크·MILESTONE 갱신 |
| 2026-10-14 15:25:16 | architecture.md 에 프로젝트 구조 작성 (예시 트리 형태) | ARCHITECTURE.md 2절 「프로젝트 구조」 추가: 루트·docs·tests·src 하위 전 파일 트리 + 역할 주석, 이후 절 번호 조정 |
| 2026-10-14 15:25:56 | main에 병합하고 push | ARCHITECTURE.md 커밋 후 main fast-forward 병합·push |
| 2026-10-14 15:27:29 | architecture.md에 Clean Architecture 원칙 적용 작성 (예시 박스 다이어그램 형태) | ARCHITECTURE.md 4절 추가: Presentation·Application·Business Logic·Data 4계층 다이어그램(폴더 매핑), 원칙별 적용 방식 표, 실제 import 분석으로 확인한 역방향 참조 예외·해소 방안. 3절 문구·알려진 부채 보완, 절 번호 조정 |
| 2026-10-14 15:28:01 | main에 병합하고 push | Clean Architecture 절 커밋 후 main fast-forward 병합·push |
| 2026-10-15 09:06:37 | https://jongho-han.github.io/one-channel_v2 동작하지 않음 | 업로드 시 누락된 GitHub Pages 배포 워크플로(.github/workflows/deploy.yml: analyze·test·build 후 dist 배포)와 .gitignore 추가, CLAUDE.md 확인 주소를 one-channel_v2로 수정. analyze 0·테스트 10건 통과 |
| 2026-10-15 09:11:17 | npx getdesign@latest add starbucks | Starbucks 영감 디자인 시스템 DESIGN.md 설치(색상·타이포·컴포넌트·레이아웃 가이드, 앱 코드 미적용) |
| 2026-10-15 09:12:57 | DESIGN.md Starbucks 스타일 앱 전체 적용 (3번) | app.css 토큰을 Starbucks 그린 4단계·웜 크림 배경·House Green 셸/푸터·골드 강조로 교체, 버튼 알약형(50px)·누름 scale(.95), 카드 12px+옅은 그림자, 헤더 3단 그림자, 모달 플로팅 그림자, 검색창 알약형. fund 차트·바로가기 아이콘·theme-color 색 갱신, CLAUDE.md 디자인 지침 추가. analyze 0·테스트 10건 통과 |
| 2026-10-15 09:13:32 | 변경 완료 배포 시작 | Starbucks 스타일 적용 커밋 main fast-forward 병합·push, GitHub Pages 배포 실행 |
| 2026-10-15 11:30:22 | 연금전환 사전신청 메뉴를 보험금청구/신청 내 연금 지급 신청 뒤로 이동 | CH-11 2Depth 보험계약관리→보험금청구/신청, PY-09 다음 배치(menu-spec.json·메뉴정의서 행 이동·비고·개정이력, 메뉴ID 유지), 테스트 메뉴 순서 검증 갱신. analyze 0·테스트 10건 통과 |
| 2026-10-15 11:30:56 | MAIN 병합 후 PUSH | 연금전환 사전신청 메뉴 이동 커밋 main fast-forward 병합·push, GitHub Pages 배포 실행 |
| 2026-10-20 08:51:35 | Claude.md 에 언어 타입 추가 (React + TypeScript 로 개발) | CLAUDE.md 「언어 / 기술 스택」 절 추가: React + TypeScript, .tsx/.ts 작성·타입 정의 원칙, 현 바닐라 JS에서 화면 단위 점진 전환, 단일 HTML 배포 유지 |
| 2026-10-20 08:56:33 | (React + TypeScript 전환) 진행하되 변경 시 테스트 우선 실행 TDD 방식으로 | 1단계: React 19·TS 6·vitest·Testing Library·typescript-eslint 도입(tsconfig allowJs, analyze=ESLint+tsc, test=단위→빌드→스모크). 테스트 선작성 후 core/format·config TS 전환, 공통 하단 Footer.tsx(React, flushSync 마운트) 전환, 스모크 1건 추가. CLAUDE.md TDD 절·ARCHITECTURE·MILESTONE 갱신. analyze 0·단위 8건·스모크 11건 통과 |
| 2026-10-20 09:34:51 | (React 전환) 이어서 진행 | 2단계: 셸 특성 스모크 테스트 5건·단위 테스트 16건 선작성(RED) 후 공통 셸(헤더·메가메뉴·앱바·탭바)을 React 컴포넌트로 전환, store.ts(타입·subscribe/notify)·useAppState 훅·menu.ts 타입, ui/shell.js 삭제. 메가메뉴 Esc 시 초점 복귀로 다시 열리던 기존 버그 수정. analyze 0·단위 24건·스모크 16건 통과, Chromium 동작 확인 |
| 2026-10-20 09:39:43 | (React 전환) 이어서 진행 | 3단계-1 T1 대시보드: 전환 전 화면 구조 golden 기준(tests/golden/CT-01.json, domShape.js) 생성, 단위 테스트 14건 선작성(RED) 후 상태칩·안내 박스(widgets.tsx)·계약 요약 로직(contractSummary.ts)·Dashboard.tsx 구현, #sbody React 마운트 기반(mountScreenBody·reactTemplates) 추가, templates/dashboard.js 삭제, formatWon 타입 오버로드. analyze 0·단위 38건·스모크 17건 통과, golden 차이 검출 확인, Chromium 동작 확인 |
| 2026-10-20 09:45:01 | (React 전환) 이어서 진행 | 3단계-2 T5 발급: golden 비교에 입력 상태(value·checked·selected) 반영, 전환 전 기준 9종(CF-01~06·CS-01~02·CF-02 발급완료)·동작 특성 테스트 4건 생성, 단위 테스트 9건 선작성(RED) 후 React 폼 필드(Field.tsx·fieldSpec.ts), 발급 화면(Issuance.tsx·IssuanceScreen.tsx), certificates.tsx 타입화, templates/issuance.js 삭제. analyze 0·단위 47건·스모크 29건 통과, Chromium 발급 흐름 확인 |
| 2026-10-20 09:52:50 | (React 전환) 이어서 진행 | 3단계-3 T4 표준 단일폼 8개(MY-01·PY-08·PM-02·PM-03·CH-08·CH-09·LN-05·LN-06): 전환 전 기준 9종·동작 특성 테스트 5건, 단위 테스트 27건 선작성(RED) 후 검증 규칙 TS 공용화(validation.ts), Field 유형 추가(전화·이메일·계좌·주소·오류 표시), DoneCard·CalcBox·Agreements, SingleForm·SingleFormScreen, changeForms.ts 타입화, 전용 화면은 기존 템플릿 유지(화면별 선택). analyze 0·단위 74건·스모크 42건 통과, Chromium 검증·서명·추가인증 흐름 확인 |
| 2026-10-20 10:05:22 | (React 전환) 이어서 진행 | 3단계-4 T4 전용 화면: golden style 비교를 해석된 값(cssText)으로 보강, 전환 전 기준 8종(MY-02·MY-03·CH-01 편집·진단·결과·불가·비교·완료)·동작 특성 테스트 6건, 단위 테스트 15건 선작성(RED) 후 펀드 규칙(fundRules.ts)·화면(FundViews.tsx)·단계 진행(fundFlow.ts), 안내장·마케팅(CustomForms.tsx), CustomFormScreen, completeSingleForm.ts 구현. 데이터(fundRepository·consentRepository)·variableContract TS 전환, store 진행 상태 갱신 함수 추가, 기존 T4 JS 4개 파일 삭제. analyze 0·단위 89건·스모크 51건 통과, Chromium 펀드변경·안내장 흐름 확인 |
| 2026-10-20 10:18:46 | (React 전환) 이어서 진행 | 3단계-5 T2 목록·상세 15개: 전환 전 기준 23종(첫 화면·행 선택·필터·탭)·동작 특성 테스트 6건(상세·보완서류 첨부/제출·신청 취소·보험금 찾기 이동·조회기간/필터·계약/변액 탭), 단위 테스트 10건 선작성(RED) 후 listRules.ts·ListScreen.tsx·ContractDetail.tsx·ListDetailScreen.tsx·listActions.ts·LinkButtons 구현. 보완서류 오류를 목록 상태로 관리, customerRepository·listScreens TS 전환, templates/listDetail.js 삭제. analyze 0·단위 99건·스모크 72건 통과, Chromium 첨부·필터·PDF·모바일 확인 |
| 2026-10-20 10:45:01 | (React 전환) 이어서 진행 / 다시 시도 | 3단계-6 T3 단계형 18개: 18개 화면을 끝까지 진행하며 단계별 기준 91종(가상계좌·고정 규칙 포함)·입력 동작 특성 테스트 8건, 단위 테스트 30건 선작성(RED) 후 Field 확장(금액·체크·파일·조건부·고정), form/display·locks·focus·fieldValues·zipSearch, loanRules·stepRules, StepFlow·LoanPick·AnnuityPick·VirtualAccountInfo·StepFlowScreen 구현, stepFlows·annuity·annuityConversion·virtualAccount TS 전환. 동의 체크는 제출 시 화면 기준으로 확인. formEngine.js·ui/widgets.js·templates/·features/loan.js 삭제 → 업무 화면 53개 전체 React. analyze 0·단위 123건·스모크 98건 통과, Chromium 청구·인출·고정 규칙·가상계좌·대출 흐름 확인 |
| 2026-10-20 10:46:01 | main 병합 후 배포 | React 전환(1~3단계) 커밋 main fast-forward 병합·push, GitHub Pages 배포 실행(#5) |
| 2026-10-20 10:55:44 | 4단계 진행 | 4단계 메인·전체메뉴·로그인·업무 화면 틀: 전환 전 페이지 기준 9종(#main)·동작 특성 테스트 6건, 단위 테스트 8건 선작성(RED) 후 HomePage·HomeSearch·AllMenuPage·LoginPage·ScreenPage·Main(#main 루트, pageKey 다시 마운트) 구현, render 파이프라인 redrawMain 으로 단순화, 전체메뉴 펼치기는 제자리 갱신(초점 유지), homeContent·noticeRepository TS 전환, pages/home·allMenu·login·screen.js·mountScreenBody 삭제 → 모든 화면 React. analyze 0·단위 131건·스모크 104건 통과, Chromium 검색·공지·전체메뉴·로그인 이어서 열기·큰글씨·모바일 확인 |
