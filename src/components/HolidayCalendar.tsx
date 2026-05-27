import { useEffect, useState } from 'react'
import { Ban, Plus, Rocket, Settings2, Trash2, X } from 'lucide-react'
import type { AppCopy, FreezePeriod, FreezePeriodDraft, HolidayEvent, Lang, ProductionDateRecord, Requirement } from '../types'

type HolidayCalendarProps = {
  year: number
  holidays: HolidayEvent[]
  freezePeriods: FreezePeriod[]
  freezeDraft: FreezePeriodDraft
  copy: AppCopy
  language: Lang
  editable: boolean
  productionRecords: ProductionDateRecord[]
  plannedProductionRecords: ProductionDateRecord[]
  onFreezeDraftChange: (draft: FreezePeriodDraft) => void
  onAddFreezePeriod: () => void
  onDeleteFreezePeriod: (id: string) => void
  onSelectVersion: (record: ProductionDateRecord) => void
}

const monthIndexes = Array.from({ length: 12 }, (_, index) => index)
const zhWeekdays = ['日', '一', '二', '三', '四', '五', '六']
const enWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const formatDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const getTodayKey = () => {
  const date = new Date()
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

const isDateInPeriod = (dateKey: string, period: FreezePeriod) => dateKey >= period.startDate && dateKey <= period.endDate

const getMonthName = (year: number, month: number, language: Lang) =>
  new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'long' }).format(new Date(year, month, 1))

const getHolidayLabel = (holiday: HolidayEvent, copy: AppCopy) =>
  holiday.country === 'cn' ? copy.chinaHoliday : copy.indonesiaHoliday

const getVersionRequirements = (version: ProductionDateRecord['version']): Requirement[] => [
  ...version.requirements,
  ...version.subVersions.flatMap(getVersionRequirements),
]

const getProductionSummary = (record: ProductionDateRecord, copy: AppCopy) => [
  `${copy.productionDate}: ${record.projectName} · ${record.version.name}`,
  ...getVersionRequirements(record.version).map((requirement) => `${requirement.code} ${requirement.title}`),
]

const getPlannedProductionSummary = (record: ProductionDateRecord, copy: AppCopy) => [
  `${copy.plannedProductionDate}: ${record.projectName} · ${record.version.name}`,
  ...getVersionRequirements(record.version).map((requirement) => `${requirement.code} ${requirement.title}`),
]

export function HolidayCalendar({
  year,
  holidays,
  freezePeriods,
  freezeDraft,
  copy,
  language,
  editable,
  productionRecords,
  plannedProductionRecords,
  onFreezeDraftChange,
  onAddFreezePeriod,
  onDeleteFreezePeriod,
  onSelectVersion,
}: HolidayCalendarProps) {
  const [isFreezeDialogOpen, setIsFreezeDialogOpen] = useState(false)
  const todayKey = getTodayKey()
  const holidaysByDate = new Map<string, HolidayEvent[]>()
  const productionByDate = new Map<string, ProductionDateRecord[]>()
  const plannedProductionByDate = new Map<string, ProductionDateRecord[]>()

  holidays.forEach((holiday) => {
    holidaysByDate.set(holiday.date, [...(holidaysByDate.get(holiday.date) ?? []), holiday])
  })

  productionRecords.forEach((record) => {
    productionByDate.set(record.date, [...(productionByDate.get(record.date) ?? []), record])
  })

  plannedProductionRecords.forEach((record) => {
    plannedProductionByDate.set(record.date, [...(plannedProductionByDate.get(record.date) ?? []), record])
  })

  const weekdays = language === 'zh' ? zhWeekdays : enWeekdays
  const canAddFreeze = Boolean(editable && freezeDraft.name.trim() && freezeDraft.startDate && freezeDraft.endDate)

  useEffect(() => {
    if (!isFreezeDialogOpen) {
      return undefined
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFreezeDialogOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isFreezeDialogOpen])

  const submitFreezePeriod = () => {
    if (!canAddFreeze) {
      return
    }

    onAddFreezePeriod()
    setIsFreezeDialogOpen(false)
  }

  return (
    <section className="calendar-view-grid">
      <section className="section-surface holiday-calendar-panel" aria-labelledby="holiday-calendar-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.nav.calendar}</p>
            <h2 id="holiday-calendar-title">{year} {copy.holidayCalendarTitle}</h2>
          </div>
          <button className="section-action" type="button" onClick={() => setIsFreezeDialogOpen(true)}>
            <Settings2 size={16} />
            {copy.freezeConfig}
            {freezePeriods.length > 0 && <span className="action-count">{freezePeriods.length}</span>}
          </button>
        </div>
        <p className="section-note">{copy.holidayCalendarHint}</p>

        <div className="calendar-legend" aria-label={copy.holidayCalendarTitle}>
          <span><i className="legend-dot cn" />{copy.chinaHoliday}</span>
          <span><i className="legend-dot id" />{copy.indonesiaHoliday}</span>
          <span><i className="legend-dot freeze" />{copy.freezeUnavailable}</span>
          <span><i className="legend-dot production" />{copy.productionDate}</span>
          <span><i className="legend-dot planned-production" />{copy.plannedProductionDate}</span>
        </div>

        <div className="year-calendar">
          {monthIndexes.map((month) => {
            const firstDay = new Date(year, month, 1).getDay()
            const daysInMonth = new Date(year, month + 1, 0).getDate()
            const cells = [
              ...Array.from({ length: firstDay }, () => null),
              ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
            ]

            return (
              <article className="month-card" key={month}>
                <h3>{getMonthName(year, month, language)}</h3>
                <div className="weekday-row">
                  {weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
                </div>
                <div className="month-grid">
                  {cells.map((day, index) => {
                    if (!day) {
                      return <span className="calendar-day blank" key={`blank-${index}`} />
                    }

                    const dateKey = formatDateKey(year, month, day)
                    const dayHolidays = holidaysByDate.get(dateKey) ?? []
                    const dayFreezes = freezePeriods.filter((period) => isDateInPeriod(dateKey, period))
                    const dayProductions = productionByDate.get(dateKey) ?? []
                    const dayPlannedProductions = plannedProductionByDate.get(dateKey) ?? []
                    const isFrozen = dayFreezes.length > 0
                    const isHoliday = dayHolidays.length > 0
                    const hasReleaseDate = dayProductions.length > 0 || dayPlannedProductions.length > 0
                    const hasEvents = isFrozen || isHoliday || hasReleaseDate
                    const hasConflict = hasReleaseDate && (isFrozen || isHoliday)
                    const eventSummary = [
                      dateKey,
                      ...dayFreezes.map((period) => `${copy.freezePeriod}: ${period.name}`),
                      ...dayHolidays.map((holiday) => `${getHolidayLabel(holiday, copy)}: ${holiday.name}`),
                      ...dayProductions.flatMap((record) => getProductionSummary(record, copy)),
                      ...dayPlannedProductions.flatMap((record) => getPlannedProductionSummary(record, copy)),
                    ].join('\n')

                    return (
                      <div
                        className={[
                          'calendar-day',
                          hasEvents ? 'has-events' : '',
                          dateKey === todayKey ? 'today' : '',
                          isFrozen ? 'frozen' : '',
                          hasConflict ? 'production-conflict' : '',
                        ].filter(Boolean).join(' ')}
                        tabIndex={hasEvents ? 0 : undefined}
                        aria-label={hasEvents ? eventSummary : undefined}
                        key={dateKey}
                      >
                        <span className="day-number">{day}</span>
                        <div className="day-events">
                          {dayFreezes.slice(0, 1).map((period) => (
                            <span className="calendar-event freeze" key={period.id}>
                              <Ban size={10} />
                              {period.name}
                            </span>
                          ))}
                          {dayHolidays.slice(0, 2).map((holiday) => (
                            <span className={`calendar-event holiday ${holiday.country}`} key={`${holiday.country}-${holiday.name}`}>
                              {holiday.name}
                            </span>
                          ))}
                          {dayProductions.slice(0, 2).map((record) => (
                            <button
                              className={hasConflict ? 'calendar-event production conflict' : 'calendar-event production'}
                              type="button"
                              key={record.version.id}
                              onClick={() => onSelectVersion(record)}
                              title={`${record.projectName} · ${record.version.name}`}
                            >
                              <Rocket size={10} />
                              {record.version.name}
                            </button>
                          ))}
                          {dayPlannedProductions.slice(0, 2).map((record) => (
                            <button
                              className={hasConflict ? 'calendar-event planned-production conflict' : 'calendar-event planned-production'}
                              type="button"
                              key={`planned-${record.version.id}`}
                              onClick={() => onSelectVersion(record)}
                              title={`${copy.plannedProductionDate} · ${record.projectName} · ${record.version.name}`}
                            >
                              <Rocket size={10} />
                              {record.version.name}
                            </button>
                          ))}
                        </div>
                        {hasEvents && (
                          <div className="calendar-day-tooltip" role="tooltip">
                            <strong>{dateKey}</strong>
                            {dayFreezes.map((period) => (
                              <span className="tooltip-row freeze" key={`tip-${period.id}`}>
                                <i />
                                <span>{copy.freezePeriod}</span>
                                <em>{period.name}</em>
                              </span>
                            ))}
                            {dayHolidays.map((holiday) => (
                              <span className={`tooltip-row ${holiday.country}`} key={`tip-${holiday.country}-${holiday.name}`}>
                                <i />
                                <span>{getHolidayLabel(holiday, copy)}</span>
                                <em>{holiday.name}</em>
                              </span>
                            ))}
                            {dayProductions.map((record) => (
                              <div className="tooltip-production" key={`tip-${record.version.id}`}>
                                <span className="tooltip-row production">
                                  <i />
                                  <span>{copy.productionDate}</span>
                                  <em>{record.projectName} · {record.version.name}</em>
                                </span>
                                {getVersionRequirements(record.version).length > 0 && (
                                  <div className="tooltip-requirements" aria-label={copy.requirements}>
                                    {getVersionRequirements(record.version).map((requirement) => (
                                      <span key={requirement.id}>
                                        <strong>{requirement.code}</strong>
                                        <em>{requirement.title}</em>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            {dayPlannedProductions.map((record) => (
                              <div className="tooltip-production" key={`planned-tip-${record.version.id}`}>
                                <span className="tooltip-row planned-production">
                                  <i />
                                  <span>{copy.plannedProductionDate}</span>
                                  <em>{record.projectName} · {record.version.name}</em>
                                </span>
                                {getVersionRequirements(record.version).length > 0 && (
                                  <div className="tooltip-requirements planned" aria-label={copy.requirements}>
                                    {getVersionRequirements(record.version).map((requirement) => (
                                      <span key={requirement.id}>
                                        <strong>{requirement.code}</strong>
                                        <em>{requirement.title}</em>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {isFreezeDialogOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsFreezeDialogOpen(false)
            }
          }}
        >
          <section className="modal-card freeze-dialog" role="dialog" aria-modal="true" aria-labelledby="freeze-title">
            <div className="modal-header">
              <div>
                <p className="eyebrow">{copy.freezeConfig}</p>
                <h2 id="freeze-title">{copy.freezePeriod}</h2>
              </div>
              <button className="icon-button" type="button" aria-label={copy.cancel} onClick={() => setIsFreezeDialogOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form
              className="freeze-form"
              onSubmit={(event) => {
                event.preventDefault()
                submitFreezePeriod()
              }}
            >
              <label>
                <span>{copy.freezePeriodName}</span>
                <input
                  value={freezeDraft.name}
                  onChange={(event) => onFreezeDraftChange({ ...freezeDraft, name: event.target.value })}
                  disabled={!editable}
                />
              </label>
              <label>
                <span>{copy.freezeStart}</span>
                <input
                  type="date"
                  value={freezeDraft.startDate}
                  onChange={(event) => onFreezeDraftChange({ ...freezeDraft, startDate: event.target.value })}
                  disabled={!editable}
                />
              </label>
              <label>
                <span>{copy.freezeEnd}</span>
                <input
                  type="date"
                  value={freezeDraft.endDate}
                  onChange={(event) => onFreezeDraftChange({ ...freezeDraft, endDate: event.target.value })}
                  disabled={!editable}
                />
              </label>
              <div className="form-actions">
                <button className="primary-action" type="submit" disabled={!canAddFreeze}>
                  <Plus size={16} />
                  {copy.addFreezePeriod}
                </button>
                <button className="secondary-action" type="button" onClick={() => setIsFreezeDialogOpen(false)}>
                  {copy.cancel}
                </button>
              </div>
            </form>

            <div className="freeze-list">
              {freezePeriods.length === 0 && <p className="empty-state">{copy.noFreezePeriods}</p>}
              {freezePeriods.map((period) => (
                <article className="freeze-row" key={period.id}>
                  <div>
                    <strong>{period.name}</strong>
                    <span>{period.startDate} → {period.endDate}</span>
                  </div>
                  <button type="button" aria-label={copy.deleteFreezePeriod} onClick={() => onDeleteFreezePeriod(period.id)} disabled={!editable}>
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
