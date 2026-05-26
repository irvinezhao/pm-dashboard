import { stages } from '../constants'
import type { Project, Requirement, RequirementRecord, Stage, Version, VersionRecord } from '../types'

export const findVersionById = (versions: Version[], versionId: string): Version | null => {
  for (const version of versions) {
    if (version.id === versionId) {
      return version
    }

    const nested = findVersionById(version.subVersions, versionId)
    if (nested) {
      return nested
    }
  }

  return null
}

export const findVersionLocation = (
  projects: Project[],
  versionId: string,
): { projectId: string; version: Version | null } | null => {
  for (const project of projects) {
    const version = findVersionById(project.versions, versionId)
    if (version) {
      return { projectId: project.id, version }
    }
  }

  return null
}

export const findFirstVersion = (versions: Version[]): Version | null => {
  for (const version of versions) {
    return version
  }
  return null
}

export const updateVersionTree = (
  versions: Version[],
  versionId: string,
  updater: (version: Version) => Version,
): Version[] =>
  versions.map((version) => {
    if (version.id === versionId) {
      return updater(version)
    }

    return {
      ...version,
      subVersions: updateVersionTree(version.subVersions, versionId, updater),
    }
  })

export const deleteRequirementFromTree = (versions: Version[], versionId: string, requirementId: string): Version[] =>
  versions.map((version) => {
    if (version.id === versionId) {
      return {
        ...version,
        requirements: version.requirements.filter((requirement) => requirement.id !== requirementId),
      }
    }

    return {
      ...version,
      subVersions: deleteRequirementFromTree(version.subVersions, versionId, requirementId),
    }
  })

export const countRequirements = (versions: Version[]): number =>
  versions.reduce((sum, version) => sum + version.requirements.length + countRequirements(version.subVersions), 0)

export const countProductionVersions = (versions: Version[]): number =>
  versions.reduce(
    (sum, version) => sum + (version.stage === 'production' ? 1 : 0) + countProductionVersions(version.subVersions),
    0,
  )

export const collectVersionRecords = (
  projects: Project[],
  projectFilterId?: string,
): VersionRecord[] =>
  projects
    .filter((project) => !projectFilterId || project.id === projectFilterId)
    .flatMap((project) => {
      const walk = (versions: Version[], parentName = '', parentVersionId = '', depth = 0): VersionRecord[] =>
        versions.flatMap((version) => [
          {
            projectId: project.id,
            projectName: project.name,
            version,
            parentVersionId,
            parentName,
            depth,
          },
          ...walk(version.subVersions, version.name, version.id, depth + 1),
        ])

      return walk(project.versions)
    })

export const collectRequirementRecords = (
  projects: Project[],
  projectFilterId?: string,
): RequirementRecord[] =>
  collectVersionRecords(projects, projectFilterId).flatMap((record) =>
    record.version.requirements.map((requirement) => ({
      ...record,
      requirement,
    })),
  )

export const versionMatchesQuery = (version: Version, query: string): boolean => {
  const searchable = [
    version.name,
    version.startDate,
    version.endDate,
    ...version.requirements.flatMap((requirement) => [
      requirement.code,
      requirement.title,
      requirement.owner,
      requirement.link,
    ]),
  ]
    .join(' ')
    .toLowerCase()

  return searchable.includes(query) || version.subVersions.some((subVersion) => versionMatchesQuery(subVersion, query))
}

export const isStage = (value: unknown): value is Stage =>
  typeof value === 'string' && (value === 'versionStart' || stages.includes(value as Stage))

export const normalizeRequirement = (value: unknown): Requirement | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<Requirement>
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.code !== 'string' ||
    typeof candidate.title !== 'string'
  ) {
    return null
  }

  return {
    id: candidate.id,
    code: candidate.code,
    title: candidate.title,
    link: typeof candidate.link === 'string' ? candidate.link : '',
    owner: typeof candidate.owner === 'string' ? candidate.owner : '',
  }
}

export const normalizeVersion = (value: unknown, depth = 0): Version | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<Version>
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.startDate !== 'string' ||
    typeof candidate.endDate !== 'string' ||
    !isStage(candidate.stage)
  ) {
    return null
  }

  const requirements = Array.isArray(candidate.requirements)
    ? candidate.requirements.map(normalizeRequirement).filter((requirement): requirement is Requirement => requirement !== null)
    : []

  const subVersions =
    depth === 0 && Array.isArray(candidate.subVersions)
      ? candidate.subVersions.map((subVersion) => normalizeVersion(subVersion, 1)).filter((version): version is Version => version !== null)
      : []

  return {
    id: candidate.id,
    name: candidate.name,
    startDate: candidate.startDate,
    endDate: candidate.endDate,
    stage: candidate.stage,
    requirements,
    subVersions,
  }
}

export const normalizeProjects = (value: unknown): Project[] | null => {
  if (!Array.isArray(value)) {
    return null
  }

  const projects = value
    .map((project): Project | null => {
      if (!project || typeof project !== 'object') {
        return null
      }

      const candidate = project as Partial<Project>
      if (typeof candidate.id !== 'string' || typeof candidate.name !== 'string') {
        return null
      }

      return {
        id: candidate.id,
        name: candidate.name,
        owner: typeof candidate.owner === 'string' ? candidate.owner : '',
        productLine: typeof candidate.productLine === 'string' ? candidate.productLine : '',
        versions: Array.isArray(candidate.versions)
          ? candidate.versions.map(normalizeVersion).filter((version): version is Version => version !== null)
          : [],
      }
    })
    .filter((project): project is Project => project !== null)

  return projects.length > 0 ? projects : null
}
