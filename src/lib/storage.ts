import { importedProjectIds, storageKey } from '../constants'
import { initialProjects } from '../data/initialProjects'
import type { Project } from '../types'
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
