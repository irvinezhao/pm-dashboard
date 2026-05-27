import {
  CalendarDays,
  ChartGantt,
  CopyPlus,
  LayoutDashboard,
  ListChecks,
  Settings,
  UsersRound,
} from 'lucide-react'
import type { ViewKey } from '../types'

export const navigation: Array<{ key: ViewKey; icon: typeof LayoutDashboard }> = [
  { key: 'dashboard', icon: LayoutDashboard },
  { key: 'projects', icon: CopyPlus },
  { key: 'versions', icon: CalendarDays },
  { key: 'requirements', icon: ListChecks },
  { key: 'gantt', icon: ChartGantt },
  { key: 'team', icon: UsersRound },
  { key: 'settings', icon: Settings },
]
