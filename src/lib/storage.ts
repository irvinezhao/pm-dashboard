import { freezePeriodStorageKey, importedProjectIds, storageKey } from '../constants'
import { initialProjects } from '../data/initialProjects'
import type { FreezePeriod, Project } from '../types'
import { normalizeProjects } from './projectTree'

export const loadStoredProjects = (): Project[] => {
  if (typeof window === 'undefined') {
    return initialProjects
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey)
    if (!storedValue) {
      return initialProjects
    }

    const storedProjects = normalizeProjects(JSON.parse(storedValue))
    if (!storedProjects) {
      return initialProjects
    }

    const importedProjectMap = new Map(
      initialProjects
        .filter((project) => importedProjectIds.includes(project.id))
        .map((project) => [project.id, project] as const),
    )

    const replacedProjects = storedProjects.map((project) => importedProjectMap.get(project.id) ?? project)
    const missingImportedProjects = initialProjects.filter(
      (project) => importedProjectIds.includes(project.id) && !storedProjects.some((storedProject) => storedProject.id === project.id),
    )

    return [...missingImportedProjects, ...replacedProjects]
  } catch {
    return initialProjects
  }
}

export const saveProjects = (projects: Project[]) => {
  window.localStorage.setItem(storageKey, JSON.stringify(projects))
}

const normalizeFreezePeriod = (value: unknown): FreezePeriod | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<FreezePeriod>
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.startDate !== 'string' ||
    typeof candidate.endDate !== 'string'
  ) {
    return null
  }

  return {
    id: candidate.id,
    name: candidate.name,
    startDate: candidate.startDate <= candidate.endDate ? candidate.startDate : candidate.endDate,
    endDate: candidate.endDate >= candidate.startDate ? candidate.endDate : candidate.startDate,
  }
}

export const loadStoredFreezePeriods = (): FreezePeriod[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedValue = window.localStorage.getItem(freezePeriodStorageKey)
    if (!storedValue) {
      return []
    }

    const parsedValue = JSON.parse(storedValue)
    return Array.isArray(parsedValue)
      ? parsedValue.map(normalizeFreezePeriod).filter((period): period is FreezePeriod => period !== null)
      : []
  } catch {
    return []
  }
}

export const saveFreezePeriods = (freezePeriods: FreezePeriod[]) => {
  window.localStorage.setItem(freezePeriodStorageKey, JSON.stringify(freezePeriods))
}
