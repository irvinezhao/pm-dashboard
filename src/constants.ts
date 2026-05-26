import type { ProjectDraft, RequirementDraft, Stage, VersionDraft } from './types'

export const today = '2026-05-26'
export const storageKey = 'pm-dashboard-projects-v1'
export const importedProjectIds = ['non-loan-current']
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
