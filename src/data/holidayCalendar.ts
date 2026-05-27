import type { HolidayEvent } from '../types'

type HolidayRange = {
  start: string
  end: string
  country: HolidayEvent['country']
  kind: HolidayEvent['kind']
  name: string
}

const dayMs = 24 * 60 * 60 * 1000

const parseDate = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10)

const expandRange = ({ start, end, country, kind, name }: HolidayRange): HolidayEvent[] => {
  const startDate = parseDate(start)
  const endDate = parseDate(end)
  const events: HolidayEvent[] = []

  for (let time = startDate.getTime(); time <= endDate.getTime(); time += dayMs) {
    events.push({
      date: formatDateKey(new Date(time)),
      country,
      kind,
      name,
    })
  }

  return events
}

const holidayRanges2026: HolidayRange[] = [
  { start: '2026-01-01', end: '2026-01-03', country: 'cn', kind: 'public', name: '元旦' },
  { start: '2026-02-15', end: '2026-02-23', country: 'cn', kind: 'public', name: '春节' },
  { start: '2026-04-04', end: '2026-04-06', country: 'cn', kind: 'public', name: '清明节' },
  { start: '2026-05-01', end: '2026-05-05', country: 'cn', kind: 'public', name: '劳动节' },
  { start: '2026-06-19', end: '2026-06-21', country: 'cn', kind: 'public', name: '端午节' },
  { start: '2026-09-25', end: '2026-09-27', country: 'cn', kind: 'public', name: '中秋节' },
  { start: '2026-10-01', end: '2026-10-07', country: 'cn', kind: 'public', name: '国庆节' },
  { start: '2026-01-01', end: '2026-01-01', country: 'id', kind: 'public', name: 'Tahun Baru Masehi' },
  { start: '2026-01-16', end: '2026-01-16', country: 'id', kind: 'public', name: "Isra Mikraj Nabi Muhammad SAW" },
  { start: '2026-02-16', end: '2026-02-16', country: 'id', kind: 'jointLeave', name: 'Cuti bersama Imlek' },
  { start: '2026-02-17', end: '2026-02-17', country: 'id', kind: 'public', name: 'Tahun Baru Imlek' },
  { start: '2026-03-18', end: '2026-03-18', country: 'id', kind: 'jointLeave', name: 'Cuti bersama Nyepi' },
  { start: '2026-03-19', end: '2026-03-19', country: 'id', kind: 'public', name: 'Hari Suci Nyepi' },
  { start: '2026-03-20', end: '2026-03-20', country: 'id', kind: 'jointLeave', name: 'Cuti bersama Idulfitri' },
  { start: '2026-03-21', end: '2026-03-22', country: 'id', kind: 'public', name: 'Idulfitri' },
  { start: '2026-03-23', end: '2026-03-24', country: 'id', kind: 'jointLeave', name: 'Cuti bersama Idulfitri' },
  { start: '2026-04-03', end: '2026-04-03', country: 'id', kind: 'public', name: 'Wafat Yesus Kristus' },
  { start: '2026-04-05', end: '2026-04-05', country: 'id', kind: 'public', name: 'Paskah' },
  { start: '2026-05-01', end: '2026-05-01', country: 'id', kind: 'public', name: 'Hari Buruh Internasional' },
  { start: '2026-05-14', end: '2026-05-14', country: 'id', kind: 'public', name: 'Kenaikan Yesus Kristus' },
  { start: '2026-05-15', end: '2026-05-15', country: 'id', kind: 'jointLeave', name: 'Cuti bersama Kenaikan Yesus Kristus' },
  { start: '2026-05-27', end: '2026-05-27', country: 'id', kind: 'public', name: 'Iduladha' },
  { start: '2026-05-28', end: '2026-05-28', country: 'id', kind: 'jointLeave', name: 'Cuti bersama Iduladha' },
  { start: '2026-05-31', end: '2026-05-31', country: 'id', kind: 'public', name: 'Waisak' },
  { start: '2026-06-01', end: '2026-06-01', country: 'id', kind: 'public', name: 'Hari Lahir Pancasila' },
  { start: '2026-06-16', end: '2026-06-16', country: 'id', kind: 'public', name: 'Tahun Baru Islam' },
  { start: '2026-08-17', end: '2026-08-17', country: 'id', kind: 'public', name: 'Hari Kemerdekaan Republik Indonesia' },
  { start: '2026-08-25', end: '2026-08-25', country: 'id', kind: 'public', name: 'Maulid Nabi Muhammad SAW' },
  { start: '2026-12-24', end: '2026-12-24', country: 'id', kind: 'jointLeave', name: 'Cuti bersama Natal' },
  { start: '2026-12-25', end: '2026-12-25', country: 'id', kind: 'public', name: 'Hari Raya Natal' },
]

const holidayEventsByYear: Record<number, HolidayEvent[]> = {
  2026: holidayRanges2026.flatMap(expandRange),
}

export const getHolidayEvents = (year: number) => holidayEventsByYear[year] ?? []
