import type { IconName } from '../components/Icon';

type Link = readonly [label: string, screenId: string];

export interface HomeContent {
  popular: readonly Link[];
  quickTasks: readonly (readonly [screenId: string, label: string, icon: IconName])[];
  todos: readonly { id: string; tone: string; icon: IconName; title: string; desc: string }[];
  lifeGuides: readonly (readonly [title: string, desc: string, links: readonly Link[]])[];
}

export const HOME: HomeContent = {
  popular: [['실손 청구', 'PY-01'], ['약관대출', 'LN-02'], ['연말정산', 'CF-01'], ['자동이체 변경', 'PM-02'], ['해지환급금', 'CF-04']],
  quickTasks: [
    ['PY-01', '보험금 청구', 'claim'], ['CT-01', '내 계약 조회', 'shield'], ['PM-01', '보험료 납입', 'card'], ['LN-02', '보험계약대출', 'won'],
    ['CF-01', '연말정산 증명서', 'cert'], ['MY-01', '주소·연락처 변경', 'pin'], ['PY-03', '숨은 보험금 찾기', 'find'], ['PM-02', '자동이체 변경', 'swap'],
  ],
  todos: [
    { id: 'PY-02', tone: 'red',   icon: 'alert', title: '보완서류 1건 요청',           desc: '통원치료 청구(C2609-00871) · 진료비 세부내역서를 올려 주세요.' },
    { id: 'PM-04', tone: 'amber', icon: 'card',  title: '유니버설저축보험 납입유예 중', desc: '납입이 멈춘 동안 월대체보험료가 적립금에서 빠져나갑니다.' },
    { id: 'MY-07', tone: 'blue',  icon: 'mail',  title: '새 안내장 도착',             desc: '변액보험 3분기 운용보고서 (09.10 발송)' },
  ],
  lifeGuides: [
    ['병원에 다녀왔어요', '진료비 영수증과 세부내역서를 사진으로 찍어 바로 청구할 수 있습니다.', [['보험금 청구', 'PY-01'], ['청구서류 안내', 'CS-01']]],
    ['급하게 돈이 필요해요', '해지하면 보장이 사라지고 손해가 날 수 있어요. 대출이나 중도인출을 먼저 살펴보세요.', [['보험계약대출', 'LN-02'], ['중도인출', 'PY-05']]],
    ['연말정산 시즌이에요', '보장성·연금저축 공제 대상 납입액을 연도별로 바로 발급합니다.', [['소득·세액공제 증명서', 'CF-01']]],
    ['이사했어요', '주소를 바꾸면 모든 계약의 안내장이 새 주소로 갑니다.', [['주소·연락처 변경', 'MY-01'], ['안내장 수신설정', 'MY-02']]],
    ['연금을 받을 때가 됐어요', '예상 연금액을 유형별로 비교하고 지급을 신청하세요.', [['미래예상연금액', 'CT-07'], ['연금 지급 신청', 'PY-09']]],
  ],
};

/* 화면 부제 */
export const SCREEN_SUBTITLES: { byScreen: Record<string, string>; byBizType: Record<string, string> } = {
  byScreen: {
    'CH-04': '해지하시기 전에 받으실 금액과 잃게 되는 보장을 함께 확인하세요.',
    'PY-01': '사진 몇 장으로 청구가 끝납니다. 평균 처리기간은 3영업일입니다.',
    'CT-01': '가입하신 모든 계약을 한 화면에서 확인하세요.',
  },
  byBizType: {
    '조회': '확인하실 내용을 바로 보여드립니다.',
    '신청': '몇 단계만 거치면 신청이 완료됩니다.',
    '변경': '현재 등록된 내용을 확인하고 바꿀 수 있습니다.',
    '지급': '신청하신 금액은 본인 명의 계좌로 입금됩니다.',
    '입금': '납입할 금액을 확인하고 바로 처리합니다.',
    '발급': '필요한 증명서를 즉시 발급합니다.',
  },
};

export const RETENTION_OPTIONS: readonly (readonly [title: string, desc: string, screenId: string])[] = [
  ['목돈이 필요하다면 · 보험계약대출', '해지환급금 범위에서 바로 대출, 신용점수 영향 없음', 'LN-02'],
  ['보험료가 부담된다면 · 감액완납', '보장을 줄이고 더 이상 보험료를 내지 않음', 'CH-02'],
  ['잠시 납입이 어렵다면 · 자동대출납입', '대출로 보험료를 대신 내서 계약 유지', 'PM-03'],
];
