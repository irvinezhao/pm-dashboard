import type { FreezePeriodDraft, ProjectDraft, RequirementDraft, Stage, VersionDraft } from './types'

const getLocalDateKey = () => {
  const date = new Date()
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

export const today = getLocalDateKey()
export const storageKey = 'pm-dashboard-projects-v2'
export const freezePeriodStorageKey = 'pm-dashboard-freeze-periods-v1'
export const userStorageKey = 'pm-dashboard-users-v1'
export const sessionStorageKey = 'pm-dashboard-session-v1'
export const importedProjectIds: string[] = []
export const stages: Stage[] = ['development', 'uat', 'production']

export const emptyVersionDraft: VersionDraft = {
  name: '',
  startDate: today,
  endDate: today,
  stage: 'development',
}

export const emptyProjectDraft: ProjectDraft = {
  name: '',
  owner: '',
  productLine: '',
}

export const emptyRequirementDraft: RequirementDraft = {
  code: '',
  title: '',
  link: '',
  owner: '',
}

export const emptyFreezePeriodDraft: FreezePeriodDraft = {
  name: '',
  startDate: today,
  endDate: today,
}
