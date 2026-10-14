# iM라이프 사이버창구 프로토타입

사이버창구 Web 메뉴정의서(53개 화면) 기반 기획 검토용 프로토타입. 모든 고객·계약·금액은 샘플이며 실제 인증·거래는 일어나지 않는다.

구조·설계 원칙은 [ARCHITECTURE.md](ARCHITECTURE.md) 참조.

## 명령
| 목적 | 명령 |
|---|---|
| 개발 서버 | `npm run dev` |
| 배포용 단일 HTML 빌드 | `npm run build` → `dist/index.html` (더블클릭으로 열림) |
| 정적 분석 | `npm run analyze` |
| 빌드 + 스모크 테스트 | `npm test` |

## 폴더 구조 (src)
| 폴더 | 역할 |
|---|---|
| core | 설정, DOM·포맷 유틸, 저장소 |
| data | Repository: 메뉴정의서·고객·계약·공지·펀드 등 샘플 데이터 |
| state | 앱 상태(store) |
| app | 라우터, 화면 렌더링 |
| controller | 클릭 액션(data-action) 처리, 전역 이벤트 |
| services | 인증·전자서명 (시뮬레이션) |
| ui | 공통 위젯: 셸(헤더·탭바), 모달·토스트, 카드·표 부품, 아이콘 |
| pages | 메인·전체메뉴·로그인·업무 화면 틀 |
| templates | 화면유형 T1~T5 (대시보드·목록·단계형·단일폼·발급) |
| form | 폼 엔진 (필드 렌더링·검증·고정 규칙) |
| features | 업무별 기능: 대출·연금·펀드·안내장·가상계좌·큰글씨·바로가기 |
| screens | 화면별 설정: 목록·단계형·단일폼·증명서 |
| styles | 전체 스타일 |

## 화면 추가 순서
1. 메뉴정의서 `docs/메뉴정의서.xlsx`에 항목 추가 후 `src/data/menu-spec.json`에 같은 내용 반영 (메뉴정의서가 원본)
2. 화면유형에 맞는 `src/screens/*` 설정 추가
3. 전용 동작이 필요하면 `src/features`에 모듈 추가
4. `npm run analyze`, `npm test` 통과 확인
