/* T2 목록 + 상세: 조회 조건 → 목록(PC 표 · 모바일 카드) → 선택한 행 상세 → 이어서 할 일
   선택·조회기간·취소 등은 data-action → 목록 상태(state.screen.list) 변경 → 다시 그림 */
import { useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Icon } from '../../components/Icon';
import { InfoBox, LinkButtons, StatusChip, SummaryTiles } from '../../components/widgets';
import type { ListConfig, ListFilter } from '../listScreens';
import { claimScreenFor, followUpFor, isNumericColumn, isStatusColumn, visibleRows, type Row } from './listRules';

export type { ListConfig };

export interface ListState {
  period?: string;
  filters?: Record<string, string>;
  selectedRow?: number | null;
  uploadError?: string;   // 보완서류 제출 오류 (PY-02)
  contractIndex?: number; // 계약조회(CT-02)에서 상세를 연 계약 (없으면 카드 목록)
  variableDetail?: boolean; // 변액보험 조회(CT-03)에서 상세를 열었는지 (계약은 state.variableNo)
}

const PERIODS = ['1개월', '3개월', '6개월', '1년'];

interface ListScreenProps {
  screenId: string;
  title: string;                // 표 제목 (화면 이름)
  config: ListConfig;
  list: ListState;
  top?: ReactNode;              // 목록 위 추가 영역 (변액 계약 이름·목록 버튼)
  onFilterChange: (label: string, value: string) => void;
}

function Filters({ filters, period, values, onFilterChange }: { filters: readonly ListFilter[]; period: string; values: Record<string, string>; onFilterChange: ListScreenProps['onFilterChange'] }) {
  if (!filters.length) return null;
  return (
    <div className="filters">
      {filters.map(filter => (filter === 'period'
        ? <div className="f" key="period"><span className="lb" id="periodLabel">조회기간</span><div className="seg" role="group" aria-labelledby="periodLabel">
            {PERIODS.map(item => <button key={item} className={period === item ? 'on' : undefined} aria-pressed={period === item} data-action="set-period" data-period={item}>{item}</button>)}
          </div></div>
        : <div className="f" key={filter.label}><label htmlFor={`f-${filter.label}`}>{filter.label}</label>
            <select className="inp sm" id={`f-${filter.label}`} data-filter={filter.label} value={values[filter.label] ?? filter.options[0]}
                    onChange={event => onFilterChange(filter.label, event.currentTarget.value)}>
              {filter.options.map(option => <option key={option}>{option}</option>)}
            </select>
          </div>))}
      <div className="f end"><button className="btn sm navy" data-action="toast" data-message="조회했습니다."><Icon name="search" />조회</button></div>
    </div>
  );
}

function Cell({ column, value, cells }: { column: string; value: string; cells: Row }) {
  if (isStatusColumn(column)) return <StatusChip status={value} />;
  if (column === '신청') return <button className="btn sm pri" data-action="open" data-id={claimScreenFor(value)}>{value}</button>;
  if (column === '열람' || column === '파일') {
    return <button className="btn sm" data-action="toast" data-message="PDF 열람은 실제 서비스에서 제공됩니다." aria-label={`${cells[0]} ${cells[1]} ${value}`}><Icon name="doc" />{value}</button>;
  }
  return <>{value}</>;
}

/** PC는 표, 모바일은 카드 목록으로 같은 행을 보여줌 */
function Rows({ title, config, rows, selectedRow }: { title: string; config: ListConfig; rows: ReturnType<typeof visibleRows>; selectedRow: number | null }) {
  if (!rows.length) return <div className="card empty">조회 조건에 맞는 내역이 없습니다.</div>;
  const { columns } = config;
  const statusIndex = columns.findIndex(isStatusColumn);
  const numericIndex = columns.findIndex(isNumericColumn);
  const headline = (cells: Row) => (statusIndex >= 0 ? <StatusChip status={cells[statusIndex]} /> : numericIndex >= 0 ? <span className="num">{cells[numericIndex]}</span> : null);

  return (
    <>
      <div className="tbl-wrap has-m"><table className="tbl">
        <caption className="sr-only">{title} 목록 · 첫 칸을 누르면 아래에 상세 내용이 나옵니다</caption>
        <thead><tr>{columns.map(column => <th key={column} scope="col" className={config.headAlign === 'center' ? 'c' : isNumericColumn(column) ? 'r' : undefined}>{column}</th>)}</tr></thead>
        <tbody>
          {rows.map(({ cells, index }) => (
            <tr key={index} className={selectedRow === index ? 'clk sel' : 'clk'} data-action="select-row" data-index={index}>
              {cells.map((value, column) => (
                <td key={columns[column]} className={isNumericColumn(columns[column]) ? 'r num' : undefined}>
                  {column === 0
                    /* 행 전체를 눌러도 되지만, 키보드·화면낭독기 사용자는 첫 칸의 버튼으로 상세를 엶 */
                    ? <button className="cell-btn" data-action="select-row" data-index={index} aria-pressed={selectedRow === index}>{value}<span className="sr-only"> 상세 보기</span></button>
                    : <Cell column={columns[column]} value={value} cells={cells} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table></div>
      <div className="mlist">
        {rows.map(({ cells, index }) => (
          <button key={index} className={selectedRow === index ? 'mrow sel' : 'mrow'} data-action="select-row" data-index={index} aria-pressed={selectedRow === index}>
            <span className="t"><span>{cells[1]}</span>{headline(cells)}</span>
            <span className="s">{cells.map((value, column) => (column === 1 || column === statusIndex || column === numericIndex ? null : <span key={column}>{columns[column]} · {value}</span>))}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/** 보완서류 올리기 (PY-02): 고른 파일 이름을 칩으로 */
function UploadDocuments({ error }: { error: string }) {
  const [names, setNames] = useState<string[]>([]);
  return (
    <>
      <InfoBox tone="danger my-14" icon="alert"><b>보완서류가 필요합니다 (요청일 2026.09.26)</b>진료비 세부내역서 1부를 올려 주시면 심사를 이어서 진행합니다.</InfoBox>
      <label className="file-drop" htmlFor="upl"><Icon name="upload" /><b>보완서류 사진 찍기 또는 파일 선택</b><small>JPG·PNG·PDF, 1건당 10MB 이하</small>
        <input type="file" id="upl" multiple accept="image/*,.pdf" onChange={event => { const files = [...(event.currentTarget.files ?? [])]; flushSync(() => setNames(files.map(file => file.name))); }} />
      </label>
      <div className="files mt-8" id="fl-upl">{names.map(name => <span className="fchip" key={name}>{name}</span>)}</div>
      <span className="err" id="uplErr" role="alert">{error}</span>
      <button className="btn pri block mt-12" data-action="submit-documents">보완서류 제출</button>
    </>
  );
}

function FollowUp({ screenId, config, rowIndex, uploadError }: { screenId: string; config: ListConfig; rowIndex: number; uploadError: string }) {
  const cells = config.rows[rowIndex];
  const status = cells[config.columns.findIndex(isStatusColumn)] ?? '';
  switch (followUpFor(screenId, status)) {
    case 'upload':
      return <UploadDocuments error={uploadError} />;
    case 'review':
      return <InfoBox tone="ok mt-14" icon="check">지급 결정 내용에 이의가 있으시면 재심사를 요청할 수 있습니다. <button className="link" data-action="toast" data-message="재심사 요청은 실제 서비스에서 접수됩니다.">재심사 요청</button></InfoBox>;
    case 'cancel':
      return <>
        <InfoBox tone="warn mt-14" icon="info">처리 전인 신청은 지금 취소할 수 있습니다.</InfoBox>
        <button className="btn block danger mt-10" data-action="cancel-request" data-index={rowIndex}>신청 취소</button>
      </>;
    case 'claim': {
      const label = cells[config.columns.indexOf('신청')];
      return <button className="btn pri block mt-14" data-action="open" data-id={claimScreenFor(label)}>{label}</button>;
    }
    default:
      return null;
  }
}

function Detail({ screenId, config, rowIndex, uploadError }: { screenId: string; config: ListConfig; rowIndex: number; uploadError: string }) {
  const cells = config.rows[rowIndex];
  if (!cells) return null;
  return (
    <div className="card detail" id="rowDetail" role="region" aria-labelledby="rowDetailTitle">
      <h2 className="split center"><span id="rowDetailTitle">상세 내용</span><button className="icon-btn" data-action="close-row" aria-label="상세 내용 닫기"><Icon name="x" /></button></h2>
      <dl className="kv">{config.columns.map((column, index) => [
        <dt key={`${column}-t`}>{column}</dt>,
        <dd key={`${column}-d`} className="num">{isStatusColumn(column) ? <StatusChip status={cells[index]} /> : cells[index]}</dd>,
      ])}</dl>
      <FollowUp screenId={screenId} config={config} rowIndex={rowIndex} uploadError={uploadError} />
    </div>
  );
}

export function ListScreen({ screenId, title, config, list, top, onFilterChange }: ListScreenProps) {
  const filters = list.filters ?? {};
  const selectedRow = list.selectedRow ?? null;
  return (
    <>
      {config.info && <InfoBox tone="info mb-14" icon="info">{config.info}</InfoBox>}
      {top}
      {config.warn && <InfoBox tone="warn mb-14" icon="alert">{config.warn}</InfoBox>}
      {config.tiles && <SummaryTiles tiles={config.tiles} />}
      <Filters filters={config.filters} period={list.period ?? '3개월'} values={filters} onFilterChange={onFilterChange} />
      <Rows title={title} config={config} rows={visibleRows(config.rows, config.filterColumns, filters)} selectedRow={selectedRow} />
      {selectedRow !== null && <Detail screenId={screenId} config={config} rowIndex={selectedRow} uploadError={list.uploadError ?? ''} />}
      {config.links && <LinkButtons links={config.links} />}
    </>
  );
}
