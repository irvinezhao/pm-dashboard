export type Lang = 'en' | 'zh'
export type Stage = 'versionStart' | 'development' | 'uat' | 'production'
export type ViewKey = 'dashboard' | 'projects' | 'versions' | 'requirements' | 'gantt' | 'calendar' | 'team' | 'settings'
export type HolidayCountry = 'cn' | 'id'
export type HolidayKind = 'public' | 'jointLeave'

export type Requirement = {
  id: string
  code: string
  title: string
  link: string
  owner: string
}

export type Version = {
  id: string
  name: string
  startDate: string
  endDate: string
  stage: Stage
  requirements: Requirement[]
  subVersions: Version[]
}

export type Project = {
  id: string
  name: string
  owner: string
  productLine: string
  versions: Version[]
}

export type ProjectDraft = {
  name: string
  owner: string
  productLine: string
}

export type VersionDraft = {
  name: string
  startDate: string
  endDate: string
  stage: Stage
}

export type RequirementDraft = {
  code: string
  title: string
  link: string
  owner: string
}

export type EditingRequirementTarget = {
  projectId: string
  versionId: string
  requirementId: string
}

export type VersionFormContext = {
  parentVersionId: string | null
}

export type VersionRecord = {
  projectId: string
  projectName: string
  version: Version
  parentVersionId: string
  parentName: string
  depth: number
}

export type RequirementRecord = VersionRecord & {
  requirement: Requirement
}

export type HolidayEvent = {
  date: string
  country: HolidayCountry
  kind: HolidayKind
  name: string
}

export type FreezePeriod = {
  id: string
  name: string
  startDate: string
  endDate: string
}

export type FreezePeriodDraft = {
  name: string
  startDate: string
  endDate: string
}

export type ProductionDateRecord = VersionRecord & {
  date: string
}

export type AppCopy = {
  nav: Record<ViewKey, string>
  subtitle: string
  searchPlaceholder: string
  searchLabel: string
  clearSearch: string
  language: string
  collapseSidebar: string
  expandSidebar: string
  heroEyebrow: string
  heroTitle: string
  heroCopy: string
  projectConfig: string
  projectConfigHint: string
  addProject: string
  editProject: string
  deleteProject: string
  saveProject: string
  updateProject: string
  projectName: string
  selected: string
  owner: string
  productLine: string
  versions: string
  requirements: string
  currentStage: string
  activeVersion: string
  addVersion: string
  editVersion: string
  deleteVersion: string
  addSubVersion: string
  saveVersion: string
  updateVersion: string
  cancel: string
  versionName: string
  startDate: string
  endDate: string
  stage: string
  demandList: string
  demandHint: string
  addDemand: string
  editDemand: string
  deleteDemand: string
  saveDemand: string
  updateDemand: string
  demandCode: string
  demandTitle: string
  demandLink: string
  devOwner: string
  openLink: string
  noVersions: string
  noDemands: string
  allStages: string
  dashboardView: string
  projectViewTitle: string
  projectViewCopy: string
  versionViewTitle: string
  versionViewCopy: string
  requirementViewTitle: string
  requirementViewCopy: string
  ganttViewTitle: string
  ganttViewCopy: string
  ganttTitle: string
  ganttHint: string
  ganttEmpty: string
  todayLabel: string
  calendarViewTitle: string
  calendarViewCopy: string
  holidayCalendarTitle: string
  holidayCalendarHint: string
  freezeConfig: string
  freezePeriod: string
  freezePeriodName: string
  freezeStart: string
  freezeEnd: string
  addFreezePeriod: string
  deleteFreezePeriod: string
  noFreezePeriods: string
  publicHoliday: string
  jointLeave: string
  chinaHoliday: string
  indonesiaHoliday: string
  productionDate: string
  plannedProductionDate: string
  productionConflict: string
  freezeUnavailable: string
  teamViewTitle: string
  teamViewCopy: string
  settingsViewTitle: string
  settingsViewCopy: string
  allProjects: string
  subVersionOf: string
  unassigned: string
  versionCount: string
  resetData: string
  resetDataHint: string
  storageMode: string
  localStorageMode: string
  localStorageHint: string
  requirementOverview: string
  selectToEdit: string
  metrics: Record<'projects' | 'versions' | 'requirements' | 'production', string>
  stageMap: Record<Stage, string>
}
