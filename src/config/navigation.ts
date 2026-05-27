import {
  CalendarDays,
  CalendarRange,
  ChartGantt,
  CopyPlus,
  LayoutDashboard,
  ListChecks,
  Settings,
  UsersRound,
} from 'lucide-react'
import type { ViewKey } from '../types'

export const viewRoutes: Record<ViewKey, string> = {
  dashboard: '/dashboard',
  projects: '/projects',
  versions: '/versions',
  requirements: '/requirements',
  gantt: '/gantt',
  calendar: '/calendar',
  team: '/team',
  settings: '/settings',
}

export const loginRoute = '/login'

export const navigation: Array<{ key: ViewKey; icon: typeof LayoutDashboard; route: string }> = [
  { key: 'dashboard', icon: LayoutDashboard, route: viewRoutes.dashboard },
  { key: 'projects', icon: CopyPlus, route: viewRoutes.projects },
  { key: 'versions', icon: CalendarDays, route: viewRoutes.versions },
  { key: 'requirements', icon: ListChecks, route: viewRoutes.requirements },
  { key: 'gantt', icon: ChartGantt, route: viewRoutes.gantt },
  { key: 'calendar', icon: CalendarRange, route: viewRoutes.calendar },
  { key: 'team', icon: UsersRound, route: viewRoutes.team },
  { key: 'settings', icon: Settings, route: viewRoutes.settings },
]

export const getViewFromHash = (hash: string): ViewKey | null => {
  const normalizedRoute = hash.replace(/^#/, '') || viewRoutes.dashboard
  const routeEntry = Object.entries(viewRoutes).find(([, route]) => route === normalizedRoute || route.slice(1) === normalizedRoute)
  return routeEntry ? (routeEntry[0] as ViewKey) : null
}

export const getHashForView = (view: ViewKey) => `#${viewRoutes[view]}`
