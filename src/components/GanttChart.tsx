import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type UIEvent } from 'react'
import type { AppCopy, Lang, VersionRecord } from '../types'

const dayMs = 24 * 60 * 60 * 1000

type GanttChartProps = {
  records: VersionRecord[]
  copy: Pick<AppCopy, 'nav' | 'ganttTitle' | 'ganttHint' | 'ganttEmpty' | 'subVersionOf' | 'stageMap' | 'todayLabel'>
  language: Lang
  onSelectVersion: (record: VersionRecord) => void
}

type GanttRow = {
  record: VersionRecord
  start: Date
  end: Date
  showProjectLabel: boolean
}

const parseDate = (value: string) => {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!matched) {
    return null
  }

  const [, year, month, day] = matched
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return Number.isNaN(date.getTime()) ? null : date
}

const diffDays = (start: Date, end: Date) => Math.round((end.getTime() - start.getTime()) / dayMs)

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * dayMs)

const formatDate = (date: Date, language: Lang) => {
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  return language === 'zh' ? `${month}月${day}日` : `${month}/${day}`
}

const getTodayDate = () => {
  const date = new Date()
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

export function GanttChart({ records, copy, language, onSelectVersion }: GanttChartProps) {
  const dragStateRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number } | null>(null)
  const timelineScrollRef = useRef<HTMLDivElement>(null)
  const [timelineScrollLeft, setTimelineScrollLeft] = useState(0)
  const projectOrder = new Map<string, number>()
  const recordOrder = new Map<string, number>()
  records.forEach((record, index) => {
    if (!projectOrder.has(record.projectId)) {
      projectOrder.set(record.projectId, projectOrder.size)
    }
    recordOrder.set(record.version.id, index)
  })

  const rows = records
    .map((record) => {
      const start = parseDate(record.version.startDate)
      const end = parseDate(record.version.endDate)
      if (!start || !end) {
        return null
      }

      return {
        record,
        start: start <= end ? start : end,
        end: end >= start ? end : start,
      }
    })
    .filter((row): row is Omit<GanttRow, 'showProjectLabel'> => row !== null)
    .sort(
      (left, right) =>
        (projectOrder.get(left.record.projectId) ?? 0) - (projectOrder.get(right.record.projectId) ?? 0) ||
        (recordOrder.get(left.record.version.id) ?? 0) - (recordOrder.get(right.record.version.id) ?? 0),
    )
    .map((row, index, allRows) => ({
      ...row,
      showProjectLabel: index === 0 || allRows[index - 1].record.projectId !== row.record.projectId,
    }))

  const hasRows = rows.length > 0
  const todayDate = getTodayDate()
  const minStart = hasRows ? rows.reduce((earliest, row) => (row.start < earliest ? row.start : earliest), rows[0].start) : todayDate
  const maxEnd = hasRows ? rows.reduce((latest, row) => (row.end > latest ? row.end : latest), rows[0].end) : todayDate
  const chartStart = addDays(minStart, -2)
  const chartEnd = addDays(maxEnd, 2)
  const dayCount = diffDays(chartStart, chartEnd) + 1
  const dayWidth = dayCount > 120 ? 18 : dayCount > 70 ? 22 : 28
  const timelineWidth = Math.max(720, dayCount * dayWidth)
  const tickStep = dayCount > 120 ? 30 : dayCount > 70 ? 14 : 7
  const ticks = Array.from({ length: Math.ceil(dayCount / tickStep) + 1 }, (_, index) => {
    const offset = Math.min(index * tickStep, dayCount - 1)
    return {
      date: addDays(chartStart, offset),
      left: offset * dayWidth,
    }
  })
  const showTodayMarker = todayDate >= chartStart && todayDate <= chartEnd
  const todayLeft = diffDays(chartStart, todayDate) * dayWidth

  useLayoutEffect(() => {
    const timeline = timelineScrollRef.current
    if (!timeline || !showTodayMarker) {
      return
    }

    const maxScrollLeft = Math.max(0, timeline.scrollWidth - timeline.clientWidth)
    const nextScrollLeft = Math.min(Math.max(0, todayLeft - timeline.clientWidth / 2), maxScrollLeft)
    timeline.scrollLeft = nextScrollLeft
    setTimelineScrollLeft(nextScrollLeft)
  }, [showTodayMarker, todayLeft, timelineWidth])

  if (!hasRows) {
    return (
      <section className="section-surface gantt-panel" aria-labelledby="gantt-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.nav.gantt}</p>
            <h2 id="gantt-title">{copy.ganttTitle}</h2>
          </div>
        </div>
        <p className="empty-state">{copy.ganttEmpty}</p>
      </section>
    )
  }

  const handleTimelineScroll = (event: UIEvent<HTMLDivElement>) => {
    setTimelineScrollLeft(event.currentTarget.scrollLeft)
  }

  const startTimelineDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveTimelineDrag = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    event.currentTarget.scrollLeft = dragState.startScrollLeft - (event.clientX - dragState.startX)
  }

  const stopTimelineDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const trackStyle = {
    width: timelineWidth,
    transform: `translateX(-${timelineScrollLeft}px)`,
  } as CSSProperties

  return (
    <section className="section-surface gantt-panel" aria-labelledby="gantt-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{copy.nav.gantt}</p>
          <h2 id="gantt-title">{copy.ganttTitle}</h2>
        </div>
      </div>
      <p className="section-note">{copy.ganttHint}</p>

      <div className="gantt-frame">
        <div className="gantt-table">
          <div className="gantt-left-header" />
          <div
            className="gantt-scroll"
            ref={timelineScrollRef}
            style={{ '--gantt-width': `${timelineWidth}px`, '--day-width': `${dayWidth}px` } as CSSProperties}
            onScroll={handleTimelineScroll}
            onPointerDown={startTimelineDrag}
            onPointerMove={moveTimelineDrag}
            onPointerUp={stopTimelineDrag}
            onPointerCancel={stopTimelineDrag}
          >
            <div className="gantt-axis" style={{ width: timelineWidth }}>
              {showTodayMarker && (
                <span className="gantt-today-axis" style={{ left: todayLeft }}>
                  {copy.todayLabel}
                </span>
              )}
              {ticks.map((tick) => (
                <span className="gantt-tick" style={{ left: tick.left }} key={tick.date.toISOString()}>
                  {formatDate(tick.date, language)}
                </span>
              ))}
            </div>
          </div>

          {rows.map((row) => {
            const offset = diffDays(chartStart, row.start)
            const duration = diffDays(row.start, row.end) + 1
            const barStyle = {
              '--bar-left': `${offset * dayWidth}px`,
              '--bar-width': `${Math.max(dayWidth, duration * dayWidth)}px`,
            } as CSSProperties

            return (
              <div className="gantt-row" key={row.record.version.id}>
                <div className="gantt-row-label">
                  <span>{row.showProjectLabel ? row.record.projectName : ''}</span>
                  <strong style={{ paddingLeft: row.record.depth * 14 }}>{row.record.version.name}</strong>
                  {row.record.parentName && <small>{copy.subVersionOf}: {row.record.parentName}</small>}
                </div>
                <div className="gantt-track-window">
                  <div className="gantt-track" style={trackStyle}>
                    {showTodayMarker && <span className="gantt-today-line" style={{ left: todayLeft }} />}
                    <button
                      className={`gantt-bar ${row.record.version.stage}`}
                      type="button"
                      style={barStyle}
                      aria-label={`${row.record.version.name} · ${copy.stageMap[row.record.version.stage]}`}
                      onClick={() => onSelectVersion(row.record)}
                    >
                      <span>{row.record.version.name}</span>
                      <small>
                        {formatDate(row.start, language)} - {formatDate(row.end, language)}
                      </small>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
