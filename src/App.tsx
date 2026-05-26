import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Command,
  CopyPlus,
  Edit3,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Languages,
  Link2,
  ListChecks,
  PanelLeft,
  Plus,
  Rocket,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { InfoLine } from './components/InfoLine'
import { MetricCard } from './components/MetricCard'
import { navigation } from './config/navigation'
import { emptyProjectDraft, emptyRequirementDraft, emptyVersionDraft, stages, today } from './constants'
import { initialProjects } from './data/initialProjects'
import { copy } from './i18n/copy'
import { makeId } from './lib/id'
import { canEdit, type UserRole } from './lib/permissions'
import {
  collectRequirementRecords,
  collectVersionRecords,
  countProductionVersions,
  countRequirements,
  deleteRequirementFromTree,
  findFirstVersion,
  findVersionLocation,
  updateVersionTree,
  versionMatchesQuery,
} from './lib/projectTree'
import { loadStoredProjects, saveProjects } from './lib/storage'
import type {
  EditingRequirementTarget,
  Lang,
  Project,
  ProjectDraft,
  Requirement,
  RequirementDraft,
  RequirementRecord,
  Stage,
  Version,
  VersionDraft,
  VersionFormContext,
  VersionRecord,
  ViewKey,
} from './types'
import './App.css'

const initialStoredProjects = loadStoredProjects()

function App() {
  const [language, setLanguage] = useState<Lang>('zh')
  const [activeView, setActiveView] = useState<ViewKey>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userRole] = useState<UserRole>('owner')
  const [projects, setProjects] = useState<Project[]>(initialStoredProjects)
  const [selectedProjectId, setSelectedProjectId] = useState(initialStoredProjects[0].id)
  const [selectedVersionId, setSelectedVersionId] = useState(initialStoredProjects[0].versions[0]?.id ?? '')
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all')
  const [query, setQuery] = useState('')
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(emptyProjectDraft)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false)
  const [versionDraft, setVersionDraft] = useState<VersionDraft>(emptyVersionDraft)
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null)
  const [isVersionFormOpen, setIsVersionFormOpen] = useState(false)
  const [requirementDraft, setRequirementDraft] = useState<RequirementDraft>(emptyRequirementDraft)
  const [editingRequirementTarget, setEditingRequirementTarget] = useState<EditingRequirementTarget | null>(null)
  const [isRequirementFormOpen, setIsRequirementFormOpen] = useState(false)
  const [expandedVersionIds, setExpandedVersionIds] = useState<Set<string>>(new Set())
  const [versionFormContext, setVersionFormContext] = useState<VersionFormContext>({ parentVersionId: null })
  const projectNameInputRef = useRef<HTMLInputElement>(null)
  const versionNameInputRef = useRef<HTMLInputElement>(null)
  const requirementCodeInputRef = useRef<HTMLInputElement>(null)
  const requirementPanelRef = useRef<HTMLElement>(null)

  const t = copy[language]
  const editable = canEdit(userRole)
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0]
  const selectedVersionLocation =
    findVersionLocation(projects, selectedVersionId) ??
    (selectedProject.versions[0] ? { projectId: selectedProject.id, version: selectedProject.versions[0] } : null)
  const selectedVersion = selectedVersionLocation?.version ?? null

  useEffect(() => {
    saveProjects(projects)
  }, [projects])

  const portfolioStats = useMemo(() => {
    const countVersions = (versions: Version[]): number =>
      versions.reduce((sum, version) => sum + 1 + countVersions(version.subVersions), 0)
    const versionCount = projects.reduce((sum, project) => sum + countVersions(project.versions), 0)
    const requirementCount = projects.reduce(
      (sum, project) =>
        sum +
        project.versions.reduce((versionSum, version) => versionSum + version.requirements.length + countRequirements(version.subVersions), 0),
      0,
    )
    const productionCount = projects.reduce(
      (sum, project) => sum + countProductionVersions(project.versions),
      0,
    )

    return { versionCount, requirementCount, productionCount }
  }, [projects])

  const allVersionRecords = useMemo(() => collectVersionRecords(projects), [projects])
  const selectedProjectVersionRecords = useMemo(() => collectVersionRecords(projects, selectedProject.id), [projects, selectedProject.id])
  const allRequirementRecords = useMemo(() => collectRequirementRecords(projects), [projects])
  const selectedProjectRequirementRecords = useMemo(
    () => collectRequirementRecords(projects, selectedProject.id),
    [projects, selectedProject.id],
  )

  const visibleRequirementRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return allRequirementRecords.filter((record) => {
      if (normalizedQuery.length === 0) {
        return true
      }

      const searchable = [
        record.projectName,
        record.parentName,
        record.version.name,
        record.version.startDate,
        record.version.endDate,
        record.requirement.code,
        record.requirement.title,
        record.requirement.owner,
        record.requirement.link,
      ]
        .join(' ')
        .toLowerCase()

      return searchable.includes(normalizedQuery)
    })
  }, [allRequirementRecords, query])

  const teamLoads = useMemo(() => {
    const grouped = new Map<string, RequirementRecord[]>()

    allRequirementRecords.forEach((record) => {
      const owner = record.requirement.owner.trim() || t.unassigned
      grouped.set(owner, [...(grouped.get(owner) ?? []), record])
    })

    return [...grouped.entries()]
      .map(([owner, records]) => ({ owner, records }))
      .sort((left, right) => right.records.length - left.records.length || left.owner.localeCompare(right.owner))
  }, [allRequirementRecords, t.unassigned])

  const filteredVersions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return selectedProject.versions.filter((version) => {
      const matchesStage = stageFilter === 'all' || version.stage === stageFilter
      return matchesStage && (normalizedQuery.length === 0 || versionMatchesQuery(version, normalizedQuery))
    })
  }, [query, selectedProject, stageFilter])

  const selectProject = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId)
    setSelectedProjectId(projectId)
    setSelectedVersionId(findFirstVersion(project?.versions ?? [])?.id ?? '')
    setEditingProjectId(null)
    setEditingVersionId(null)
    setEditingRequirementTarget(null)
    setProjectDraft(emptyProjectDraft)
    setVersionDraft(emptyVersionDraft)
    setRequirementDraft(emptyRequirementDraft)
    setIsProjectFormOpen(false)
    setIsVersionFormOpen(false)
    setIsRequirementFormOpen(false)
    setExpandedVersionIds(new Set())
  }

  const selectVersionRecord = (record: VersionRecord, view: ViewKey = 'dashboard') => {
    setSelectedProjectId(record.projectId)
    setSelectedVersionId(record.version.id)
    if (record.parentVersionId) {
      setExpandedVersionIds((current) => new Set(current).add(record.parentVersionId))
    }
    setActiveView(view)
  }

  const resetLocalData = () => {
    if (!editable) {
      return
    }
    setProjects(initialProjects)
    setSelectedProjectId(initialProjects[0].id)
    setSelectedVersionId(initialProjects[0].versions[0]?.id ?? '')
    setStageFilter('all')
    setQuery('')
    setExpandedVersionIds(new Set())
    resetProjectDraft()
    resetVersionDraft()
    resetRequirementDraft()
  }

  const updateSelectedProject = (updater: (project: Project) => Project) => {
    setProjects((currentProjects) =>
      currentProjects.map((project) => (project.id === selectedProject.id ? updater(project) : project)),
    )
  }

  const mapVersions = (versions: Version[], mapper: (version: Version) => Version | null): Version[] =>
    versions
      .map((version) => {
        const nextVersion = mapper(version)
        if (!nextVersion) {
          return null
        }

        return {
          ...nextVersion,
          subVersions: mapVersions(nextVersion.subVersions, mapper),
        }
      })
      .filter((version): version is Version => version !== null)

  const deleteVersionFromTree = (versions: Version[], versionId: string): Version[] => {
    const nextVersions: Version[] = []

    for (const version of versions) {
      if (version.id === versionId) {
        continue
      }

      nextVersions.push({
        ...version,
        subVersions: deleteVersionFromTree(version.subVersions, versionId),
      })
    }

    return nextVersions
  }

  const resetProjectDraft = () => {
    setProjectDraft(emptyProjectDraft)
    setEditingProjectId(null)
    setIsProjectFormOpen(false)
  }

  const openProjectForm = () => {
    if (!editable) {
      return
    }
    setProjectDraft(emptyProjectDraft)
    setEditingProjectId(null)
    setIsProjectFormOpen(true)
    requestAnimationFrame(() => projectNameInputRef.current?.focus())
  }

  const submitProject = () => {
    if (!editable) {
      return
    }
    if (!projectDraft.name.trim()) {
      return
    }

    if (editingProjectId) {
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === editingProjectId
            ? {
                ...project,
                name: projectDraft.name.trim(),
                owner: projectDraft.owner.trim(),
                productLine: projectDraft.productLine.trim(),
              }
            : project,
        ),
      )
      resetProjectDraft()
      return
    }

    const nextProject: Project = {
      id: makeId('project'),
      name: projectDraft.name.trim(),
      owner: projectDraft.owner.trim(),
      productLine: projectDraft.productLine.trim(),
      versions: [],
    }

    setProjects((currentProjects) => [nextProject, ...currentProjects])
    setSelectedProjectId(nextProject.id)
    setSelectedVersionId('')
    resetProjectDraft()
    resetVersionDraft()
    resetRequirementDraft()
  }

  const editProject = (project: Project) => {
    if (!editable) {
      return
    }
    setEditingProjectId(project.id)
    setProjectDraft({
      name: project.name,
      owner: project.owner,
      productLine: project.productLine,
    })
    setIsProjectFormOpen(true)
    requestAnimationFrame(() => projectNameInputRef.current?.focus())
  }

  const deleteProject = (projectId: string) => {
    if (!editable) {
      return
    }
    setProjects((currentProjects) => {
      if (currentProjects.length <= 1) {
        return currentProjects
      }

      const remainingProjects = currentProjects.filter((project) => project.id !== projectId)

      if (selectedProjectId === projectId) {
        const nextProject = remainingProjects[0]
        setSelectedProjectId(nextProject?.id ?? '')
        setSelectedVersionId(nextProject?.versions[0]?.id ?? '')
      }

      return remainingProjects
    })

    if (editingProjectId === projectId) {
      resetProjectDraft()
    }
  }

  const resetVersionDraft = () => {
    setVersionDraft(emptyVersionDraft)
    setEditingVersionId(null)
    setIsVersionFormOpen(false)
    setVersionFormContext({ parentVersionId: null })
  }

  const openVersionForm = (parentVersionId: string | null = null) => {
    if (!editable) {
      return
    }
    setVersionDraft({ ...emptyVersionDraft, startDate: today, endDate: today })
    setEditingVersionId(null)
    setVersionFormContext({ parentVersionId })
    setIsVersionFormOpen(true)
    requestAnimationFrame(() => versionNameInputRef.current?.focus())
  }

  const submitVersion = () => {
    if (!editable) {
      return
    }
    if (!versionDraft.name.trim()) {
      return
    }

    if (editingVersionId) {
      updateSelectedProject((project) => ({
        ...project,
        versions: mapVersions(project.versions, (version) =>
          version.id === editingVersionId ? { ...version, ...versionDraft, name: versionDraft.name.trim() } : version,
        ),
      }))
      resetVersionDraft()
      return
    }

    const nextVersion: Version = {
      id: makeId('version'),
      name: versionDraft.name.trim(),
      startDate: versionDraft.startDate,
      endDate: versionDraft.endDate,
      stage: versionDraft.stage,
      requirements: [],
      subVersions: [],
    }

    if (versionFormContext.parentVersionId) {
      updateSelectedProject((project) => ({
        ...project,
        versions: mapVersions(project.versions, (version) =>
          version.id === versionFormContext.parentVersionId
            ? { ...version, subVersions: [nextVersion, ...version.subVersions] }
            : version,
        ),
      }))
      setExpandedVersionIds((current) => new Set(current).add(versionFormContext.parentVersionId as string))
    } else {
      updateSelectedProject((project) => ({ ...project, versions: [nextVersion, ...project.versions] }))
    }
    setSelectedVersionId(nextVersion.id)
    resetVersionDraft()
  }

  const editVersion = (version: Version) => {
    if (!editable) {
      return
    }
    setEditingVersionId(version.id)
    setVersionDraft({
      name: version.name,
      startDate: version.startDate,
      endDate: version.endDate,
      stage: stages.includes(version.stage) ? version.stage : 'development',
    })
    setIsVersionFormOpen(true)
    requestAnimationFrame(() => versionNameInputRef.current?.focus())
  }

  const deleteVersion = (versionId: string) => {
    if (!editable) {
      return
    }
    updateSelectedProject((project) => {
      const remainingVersions = deleteVersionFromTree(project.versions, versionId)
      if (selectedVersionId === versionId) {
        const fallback = remainingVersions[0] ?? null
        setSelectedVersionId(fallback?.id ?? '')
      }
      return { ...project, versions: remainingVersions }
    })
    if (editingVersionId === versionId) {
      resetVersionDraft()
    }
    if (editingRequirementTarget?.versionId === versionId) {
      resetRequirementDraft()
    }
    setExpandedVersionIds((current) => {
      const next = new Set(current)
      next.delete(versionId)
      return next
    })
  }

  const resetRequirementDraft = () => {
    setRequirementDraft(emptyRequirementDraft)
    setEditingRequirementTarget(null)
    setIsRequirementFormOpen(false)
  }

  const openRequirementForm = () => {
    if (!editable) {
      return
    }
    setRequirementDraft(emptyRequirementDraft)
    setEditingRequirementTarget(null)
    setIsRequirementFormOpen(true)
    requestAnimationFrame(() => requirementCodeInputRef.current?.focus())
  }

  const submitRequirement = () => {
    if (!editable) {
      return
    }
    if (!requirementDraft.code.trim() || !requirementDraft.title.trim()) {
      return
    }

    const targetProjectId = editingRequirementTarget?.projectId ?? selectedProject.id
    const targetVersionId = editingRequirementTarget?.versionId ?? selectedVersion?.id

    if (!targetVersionId) {
      return
    }

    const nextRequirement = {
      code: requirementDraft.code.trim(),
      title: requirementDraft.title.trim(),
      link: requirementDraft.link.trim(),
      owner: requirementDraft.owner.trim(),
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === targetProjectId
          ? {
              ...project,
              versions: updateVersionTree(project.versions, targetVersionId, (version) => {
                const existingRequirement = version.requirements.find(
                  (requirement) =>
                    requirement.id === editingRequirementTarget?.requirementId ||
                    requirement.code === nextRequirement.code,
                )

                if (existingRequirement) {
                  return {
                    ...version,
                    requirements: version.requirements.map((requirement) =>
                      requirement.id === existingRequirement.id ? { ...requirement, ...nextRequirement } : requirement,
                    ),
                  }
                }

                return {
                  ...version,
                  requirements: [{ id: makeId('requirement'), ...nextRequirement }, ...version.requirements],
                }
              }),
            }
          : project,
      ),
    )
    resetRequirementDraft()
  }

  const editRequirement = (requirement: Requirement) => {
    if (!editable) {
      return
    }
    if (!selectedVersion) {
      return
    }

    setEditingRequirementTarget({
      projectId: selectedProject.id,
      versionId: selectedVersion.id,
      requirementId: requirement.id,
    })
    setSelectedProjectId(selectedProject.id)
    setSelectedVersionId(selectedVersion.id)
    setRequirementDraft({
      code: requirement.code,
      title: requirement.title,
      link: requirement.link,
      owner: requirement.owner,
    })
    setIsRequirementFormOpen(true)
    requestAnimationFrame(() => requirementCodeInputRef.current?.focus())
  }

  const deleteRequirement = (requirementId: string) => {
    if (!editable) {
      return
    }
    if (!selectedVersion) {
      return
    }

    updateSelectedProject((project) => ({
      ...project,
      versions: deleteRequirementFromTree(project.versions, selectedVersion.id, requirementId),
    }))
    if (editingRequirementTarget?.requirementId === requirementId) {
      resetRequirementDraft()
    }
  }

  const renderVersionTree = (versions: Version[], depth = 0): React.ReactNode =>
    versions.map((version) => {
      const hasChildren = version.subVersions.length > 0
      const isExpanded = expandedVersionIds.has(version.id)
      const isSelected = version.id === selectedVersion?.id
      const showRequirementCount = version.subVersions.length === 0
      const canCreateSubVersion = depth === 0

      return (
        <article className={isSelected ? 'version-card selected' : 'version-card'} key={version.id}>
          <button
            className="version-main"
            type="button"
            onClick={() => {
              setSelectedVersionId(version.id)
              if (hasChildren) {
                setExpandedVersionIds((current) => {
                  const next = new Set(current)
                  if (next.has(version.id)) {
                    next.delete(version.id)
                  } else {
                    next.add(version.id)
                  }
                  return next
                })
              }
            }}
          >
            <div className="version-main-copy">
              <span className="version-tree-toggle" aria-hidden="true">
                {hasChildren ? (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : null}
              </span>
              <div>
                <strong>{version.name}</strong>
                <span>{version.startDate} → {version.endDate}</span>
              </div>
            </div>
            <div className="version-inline-actions">
              <span className={`stage-pill ${version.stage}`}>{t.stageMap[version.stage]}</span>
              {canCreateSubVersion && (
              <span
                role="button"
                tabIndex={0}
                aria-label={t.addSubVersion}
                aria-disabled={!editable}
                onClick={(event) => {
                  event.stopPropagation()
                  openVersionForm(version.id)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      event.stopPropagation()
                      openVersionForm(version.id)
                    }
                  }}
                >
                  <Plus size={16} />
                </span>
              )}
              <span
                role="button"
                tabIndex={0}
                aria-label={t.editVersion}
                aria-disabled={!editable}
                onClick={(event) => {
                  event.stopPropagation()
                  editVersion(version)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    editVersion(version)
                  }
                }}
              >
                <Edit3 size={16} />
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label={t.deleteVersion}
                aria-disabled={!editable}
                onClick={(event) => {
                  event.stopPropagation()
                  deleteVersion(version.id)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    deleteVersion(version.id)
                  }
                }}
              >
                <Trash2 size={16} />
              </span>
            </div>
          </button>
          <div className="version-meta">
            <span>{showRequirementCount ? `${version.requirements.length} ${t.requirements}` : '\u00a0'}</span>
          </div>
          {hasChildren && isExpanded && <div className="version-children">{renderVersionTree(version.subVersions, depth + 1)}</div>}
        </article>
      )
    })

  const metricsSection = (
    <section className="metric-grid" aria-label="PM metrics">
      <MetricCard label={t.metrics.projects} value={projects.length.toString()} icon={CopyPlus} />
      <MetricCard label={t.metrics.versions} value={portfolioStats.versionCount.toString()} icon={CalendarDays} />
      <MetricCard label={t.metrics.requirements} value={portfolioStats.requirementCount.toString()} icon={ListChecks} />
      <MetricCard label={t.metrics.production} value={portfolioStats.productionCount.toString()} icon={Rocket} />
    </section>
  )

  const projectPanel = (
    <section className="section-surface project-board" aria-labelledby="project-config-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.projectConfig}</p>
          <h2 id="project-config-title">{selectedProject.name}</h2>
        </div>
        <button className="section-action" type="button" onClick={openProjectForm} disabled={!editable}>
          <Plus size={16} />
          {t.addProject}
        </button>
      </div>
      <p className="section-note">{t.projectConfigHint}</p>

      {isProjectFormOpen && (
        <div className="project-form">
          <label>
            <span>{t.projectName}</span>
            <input
              ref={projectNameInputRef}
              value={projectDraft.name}
              onChange={(event) => setProjectDraft({ ...projectDraft, name: event.target.value })}
            />
          </label>
          <label>
            <span>{t.productLine}</span>
            <input
              value={projectDraft.productLine}
              onChange={(event) => setProjectDraft({ ...projectDraft, productLine: event.target.value })}
            />
          </label>
          <label>
            <span>{t.owner}</span>
            <input
              value={projectDraft.owner}
              onChange={(event) => setProjectDraft({ ...projectDraft, owner: event.target.value })}
            />
          </label>
          <div className="form-actions">
            <button className="primary-action" type="button" onClick={submitProject} disabled={!editable}>
              <Plus size={16} />
              {editingProjectId ? t.updateProject : t.saveProject}
            </button>
            <button className="secondary-action" type="button" onClick={resetProjectDraft}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      <div className="project-list">
        {projects.map((project) => (
          <article
            className={project.id === selectedProject.id ? 'project-manage-row selected' : 'project-manage-row'}
            key={project.id}
          >
            <button className="project-row-main" type="button" onClick={() => selectProject(project.id)}>
              <span className="project-initial">{project.name.slice(0, 3)}</span>
              <span className="project-copy">
                <strong>{project.name}</strong>
                <span>{project.productLine} · {project.owner}</span>
              </span>
              {project.id === selectedProject.id && <span className="status-pill good">{t.selected}</span>}
            </button>
            <div className="row-actions">
              <button type="button" aria-label={t.editProject} onClick={() => editProject(project)} disabled={!editable}>
                <Edit3 size={16} />
              </button>
              <button
                type="button"
                aria-label={t.deleteProject}
                onClick={() => deleteProject(project.id)}
                disabled={!editable || projects.length <= 1}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="project-summary">
        <InfoLine label={t.owner} value={selectedProject.owner} />
        <InfoLine label={t.productLine} value={selectedProject.productLine} />
        <InfoLine label={t.versions} value={selectedProjectVersionRecords.length.toString()} />
        <InfoLine label={t.requirements} value={selectedProjectRequirementRecords.length.toString()} />
      </div>
    </section>
  )

  const versionPanel = (
    <section className="section-surface version-panel" aria-labelledby="version-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.versions}</p>
          <h2 id="version-title">{t.activeVersion}</h2>
        </div>
        <div className="section-heading-actions">
          <button className="section-action" type="button" onClick={() => openVersionForm()} disabled={!editable}>
            <Plus size={16} />
            {t.addVersion}
          </button>
          <div className="segmented-control" aria-label={t.stage}>
            <button className={stageFilter === 'all' ? 'selected' : ''} type="button" onClick={() => setStageFilter('all')}>
              {t.allStages}
            </button>
            {stages.map((stage) => (
              <button
                className={stageFilter === stage ? 'selected' : ''}
                type="button"
                key={stage}
                onClick={() => setStageFilter(stage)}
              >
                {t.stageMap[stage]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isVersionFormOpen && (
        <div className="version-form" data-testid="version-form">
          <label>
            <span>{t.versionName}</span>
            <input
              ref={versionNameInputRef}
              value={versionDraft.name}
              onChange={(event) => setVersionDraft({ ...versionDraft, name: event.target.value })}
            />
          </label>
          <label>
            <span>{t.startDate}</span>
            <input
              type="date"
              value={versionDraft.startDate}
              onChange={(event) => setVersionDraft({ ...versionDraft, startDate: event.target.value })}
            />
          </label>
          <label>
            <span>{t.endDate}</span>
            <input
              type="date"
              value={versionDraft.endDate}
              onChange={(event) => setVersionDraft({ ...versionDraft, endDate: event.target.value })}
            />
          </label>
          <label>
            <span>{t.stage}</span>
            <select value={versionDraft.stage} onChange={(event) => setVersionDraft({ ...versionDraft, stage: event.target.value as Stage })}>
              {stages.map((stage) => (
                <option value={stage} key={stage}>
                  {t.stageMap[stage]}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions">
            <button className="primary-action" type="button" onClick={submitVersion} disabled={!editable}>
              <CheckCircle2 size={16} />
              {editingVersionId ? t.updateVersion : t.saveVersion}
            </button>
            <button className="secondary-action" type="button" onClick={resetVersionDraft}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      <div className="version-list">
        {filteredVersions.length === 0 && <p className="empty-state">{t.noVersions}</p>}
        {renderVersionTree(filteredVersions)}
      </div>
    </section>
  )

  const requirementPanel = (
    <section
      className="section-surface requirement-panel"
      aria-labelledby="requirement-title"
      ref={requirementPanelRef}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.requirements}</p>
          <h2 id="requirement-title">{selectedVersion ? `${selectedVersion.name} · ${t.demandList}` : t.demandList}</h2>
        </div>
        <button className="section-action" type="button" onClick={openRequirementForm} disabled={!editable || !selectedVersion}>
          <Plus size={16} />
          {t.addDemand}
        </button>
      </div>
      <p className="section-note">{t.demandHint}</p>

      {isRequirementFormOpen && (
        <div className="requirement-form" data-testid="requirement-form">
          <label>
            <span>{t.demandCode}</span>
            <input
              ref={requirementCodeInputRef}
              value={requirementDraft.code}
              onChange={(event) => setRequirementDraft({ ...requirementDraft, code: event.target.value })}
            />
          </label>
          <label>
            <span>{t.demandTitle}</span>
            <input
              value={requirementDraft.title}
              onChange={(event) => setRequirementDraft({ ...requirementDraft, title: event.target.value })}
            />
          </label>
          <label>
            <span>{t.demandLink}</span>
            <input
              value={requirementDraft.link}
              onChange={(event) => setRequirementDraft({ ...requirementDraft, link: event.target.value })}
            />
          </label>
          <label>
            <span>{t.devOwner}</span>
            <input
              value={requirementDraft.owner}
              onChange={(event) => setRequirementDraft({ ...requirementDraft, owner: event.target.value })}
            />
          </label>
          <div className="form-actions">
            <button className="primary-action" type="button" onClick={submitRequirement} disabled={!editable || !selectedVersion}>
              <Plus size={16} />
              {editingRequirementTarget ? t.updateDemand : t.saveDemand}
            </button>
            <button className="secondary-action" type="button" onClick={resetRequirementDraft}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      <div className="requirement-list">
        {!selectedVersion && <p className="empty-state">{t.noVersions}</p>}
        {selectedVersion?.requirements.length === 0 && <p className="empty-state">{t.noDemands}</p>}
        {selectedVersion?.requirements.map((requirement) => (
          <article className="requirement-row" data-requirement-id={requirement.id} key={requirement.id}>
            <div className="requirement-code">{requirement.code}</div>
            <div className="requirement-copy">
              <strong>{requirement.title}</strong>
              <span>{t.devOwner}: {requirement.owner || '-'}</span>
              {requirement.link && (
                <a href={requirement.link} target="_blank" rel="noreferrer">
                  <Link2 size={14} />
                  {requirement.link}
                </a>
              )}
            </div>
            <div className="row-actions">
              {requirement.link && (
                <a href={requirement.link} target="_blank" rel="noreferrer" aria-label={t.openLink}>
                  <ExternalLink size={16} />
                </a>
              )}
              <button type="button" aria-label={t.editDemand} onClick={() => editRequirement(requirement)} disabled={!editable}>
                <Edit3 size={16} />
              </button>
              <button type="button" aria-label={t.deleteDemand} onClick={() => deleteRequirement(requirement.id)} disabled={!editable}>
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )

  const requirementOverviewPanel = (
    <section className="section-surface view-panel wide-panel" aria-labelledby="requirement-overview-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.requirementOverview}</p>
          <h2 id="requirement-overview-title">{t.allProjects}</h2>
        </div>
      </div>
      <div className="overview-list">
        {visibleRequirementRecords.length === 0 && <p className="empty-state">{t.noDemands}</p>}
        {visibleRequirementRecords.map((record) => (
          <article className="overview-row" key={`${record.version.id}-${record.requirement.id}`}>
            <div className="overview-main">
              <span className="requirement-code">{record.requirement.code}</span>
              <div className="overview-copy">
                <strong>{record.requirement.title}</strong>
                <span>{record.projectName} · {record.version.name}</span>
                <span>{t.devOwner}: {record.requirement.owner || t.unassigned}</span>
              </div>
            </div>
            <div className="overview-meta">
              <span className={`stage-pill ${record.version.stage}`}>{t.stageMap[record.version.stage]}</span>
              <button className="section-action" type="button" onClick={() => selectVersionRecord(record)}>
                {t.selectToEdit}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )

  const teamPanel = (
    <section className="section-surface view-panel wide-panel" aria-labelledby="team-view-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.nav.team}</p>
          <h2 id="team-view-title">{t.teamViewTitle}</h2>
        </div>
      </div>
      <div className="team-grid">
        {teamLoads.map((load) => (
          <article className="team-card" key={load.owner}>
            <div>
              <strong>{load.owner}</strong>
              <span>{load.records.length} {t.requirements}</span>
            </div>
            <div className="team-list">
              {load.records.slice(0, 4).map((record) => (
                <button type="button" key={`${record.version.id}-${record.requirement.id}`} onClick={() => selectVersionRecord(record)}>
                  <span>{record.requirement.code}</span>
                  <small>{record.projectName}</small>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )

  const settingsPanel = (
    <section className="section-surface view-panel wide-panel" aria-labelledby="settings-view-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.nav.settings}</p>
          <h2 id="settings-view-title">{t.settingsViewTitle}</h2>
        </div>
      </div>
      <div className="settings-grid">
        <article className="settings-card">
          <strong>{t.storageMode}</strong>
          <span>{t.localStorageMode}</span>
          <p>{t.localStorageHint}</p>
        </article>
        <article className="settings-card">
          <strong>{t.resetData}</strong>
          <p>{t.resetDataHint}</p>
          <button className="secondary-action" type="button" onClick={resetLocalData} disabled={!editable}>
            <Trash2 size={16} />
            {t.resetData}
          </button>
        </article>
      </div>
    </section>
  )

  const viewIntroMap: Record<ViewKey, { eyebrow: string; title: string; copy: string }> = {
    dashboard: { eyebrow: t.heroEyebrow, title: t.heroTitle, copy: t.heroCopy },
    projects: { eyebrow: t.nav.projects, title: t.projectViewTitle, copy: t.projectViewCopy },
    versions: { eyebrow: t.nav.versions, title: t.versionViewTitle, copy: t.versionViewCopy },
    requirements: { eyebrow: t.nav.requirements, title: t.requirementViewTitle, copy: t.requirementViewCopy },
    team: { eyebrow: t.nav.team, title: t.teamViewTitle, copy: t.teamViewCopy },
    settings: { eyebrow: t.nav.settings, title: t.settingsViewTitle, copy: t.settingsViewCopy },
  }

  const activeIntro = viewIntroMap[activeView]

  const activeViewContent = {
    dashboard: (
      <>
        {metricsSection}
        <section className="pm-grid">
          {projectPanel}
          {versionPanel}
          {requirementPanel}
        </section>
      </>
    ),
    projects: (
      <section className="single-view-grid">
        {projectPanel}
        <section className="section-surface view-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t.requirementOverview}</p>
              <h2>{selectedProject.name}</h2>
            </div>
          </div>
          <div className="project-summary roomy">
            <InfoLine label={t.versionCount} value={selectedProjectVersionRecords.length.toString()} />
            <InfoLine label={t.requirements} value={selectedProjectRequirementRecords.length.toString()} />
            <InfoLine label={t.currentStage} value={selectedVersion ? t.stageMap[selectedVersion.stage] : '-'} />
          </div>
        </section>
      </section>
    ),
    versions: (
      <section className="two-view-grid">
        {versionPanel}
        {requirementPanel}
      </section>
    ),
    requirements: (
      <section className="two-view-grid requirement-view-grid">
        {requirementOverviewPanel}
        {requirementPanel}
      </section>
    ),
    team: teamPanel,
    settings: settingsPanel,
  } satisfies Record<ViewKey, React.ReactNode>

  return (
    <main className={isSidebarOpen ? 'dashboard-shell sidebar-open' : 'dashboard-shell'} lang={language === 'zh' ? 'zh-CN' : 'en'}>
      <aside className={isSidebarOpen ? 'sidebar open' : 'sidebar'} aria-label="Main navigation">
        <div className="brand-mark">
          <div className="brand-icon">
            <Command size={18} />
          </div>
          <div>
            <strong>PM dashboard</strong>
            <span>{t.subtitle}</span>
          </div>
        </div>

        <nav className="nav-stack">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                className={item.key === activeView ? 'active nav-item' : 'nav-item'}
                type="button"
                key={item.key}
                onClick={() => {
                  setActiveView(item.key)
                  setIsSidebarOpen(false)
                }}
                aria-label={t.nav[item.key]}
                aria-current={item.key === activeView ? 'page' : undefined}
                title={t.nav[item.key]}
              >
                <Icon size={18} />
                <span>{t.nav[item.key]}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-panel">
          <div className="panel-header">
            <Rocket size={16} />
            <span>{t.currentStage}</span>
          </div>
          <p>{selectedVersion ? `${selectedVersion.name} · ${t.stageMap[selectedVersion.stage]}` : t.noVersions}</p>
          <button
            type="button"
            onClick={() => {
              setStageFilter(selectedVersion && stages.includes(selectedVersion.stage) ? selectedVersion.stage : 'all')
              setActiveView('versions')
            }}
          >
            {t.activeVersion}
            <Clock3 size={15} />
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            type="button"
            aria-label="Open navigation"
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen((current) => !current)}
          >
            <PanelLeft size={19} />
          </button>
          <div className="search-box">
            <Search size={18} />
            <input
              aria-label={t.searchLabel}
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query.length > 0 && (
              <button type="button" aria-label={t.clearSearch} onClick={() => setQuery('')}>
                <X size={15} />
              </button>
            )}
          </div>
          <div className="topbar-actions">
            <div className="language-toggle" aria-label={t.language}>
              <Languages size={16} />
              <button className={language === 'en' ? 'selected' : ''} type="button" onClick={() => setLanguage('en')}>
                EN
              </button>
              <button className={language === 'zh' ? 'selected' : ''} type="button" onClick={() => setLanguage('zh')}>
                中文
              </button>
            </div>
          </div>
        </header>

        <section className="hero-row" aria-labelledby="view-title">
          <div>
            <p className="eyebrow">{activeIntro.eyebrow}</p>
            <h1 id="view-title">{activeIntro.title}</h1>
            <p className="hero-copy">{activeIntro.copy}</p>
          </div>
          <div className="hero-actions">
            <button
              className="secondary-action"
              type="button"
              onClick={() => {
                setStageFilter('all')
                setActiveView('versions')
              }}
            >
              <ListChecks size={17} />
              {t.allStages}
            </button>
          </div>
        </section>

        {activeView === 'dashboard' ? (
          <>
        <section className="metric-grid" aria-label="PM metrics">
          <MetricCard label={t.metrics.projects} value={projects.length.toString()} icon={CopyPlus} />
          <MetricCard label={t.metrics.versions} value={allVersionRecords.length.toString()} icon={CalendarDays} />
          <MetricCard label={t.metrics.requirements} value={portfolioStats.requirementCount.toString()} icon={ListChecks} />
          <MetricCard label={t.metrics.production} value={portfolioStats.productionCount.toString()} icon={Rocket} />
        </section>

        <section className="pm-grid">
          <section className="section-surface project-board" aria-labelledby="project-config-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t.projectConfig}</p>
                <h2 id="project-config-title">{selectedProject.name}</h2>
              </div>
              <button className="section-action" type="button" onClick={openProjectForm} disabled={!editable}>
                <Plus size={16} />
                {t.addProject}
              </button>
            </div>
            <p className="section-note">{t.projectConfigHint}</p>

            {isProjectFormOpen && (
              <div className="project-form">
                <label>
                  <span>{t.projectName}</span>
                  <input
                    ref={projectNameInputRef}
                    value={projectDraft.name}
                    onChange={(event) => setProjectDraft({ ...projectDraft, name: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t.productLine}</span>
                  <input
                    value={projectDraft.productLine}
                    onChange={(event) => setProjectDraft({ ...projectDraft, productLine: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t.owner}</span>
                  <input
                    value={projectDraft.owner}
                    onChange={(event) => setProjectDraft({ ...projectDraft, owner: event.target.value })}
                  />
                </label>
                <div className="form-actions">
                  <button className="primary-action" type="button" onClick={submitProject} disabled={!editable}>
                    <Plus size={16} />
                    {editingProjectId ? t.updateProject : t.saveProject}
                  </button>
                  <button className="secondary-action" type="button" onClick={resetProjectDraft}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}

            <div className="project-list">
              {projects.map((project) => (
                <article
                  className={project.id === selectedProject.id ? 'project-manage-row selected' : 'project-manage-row'}
                  key={project.id}
                >
                  <button className="project-row-main" type="button" onClick={() => selectProject(project.id)}>
                    <span className="project-initial">{project.name.slice(0, 3)}</span>
                    <span className="project-copy">
                      <strong>{project.name}</strong>
                      <span>{project.productLine} · {project.owner}</span>
                    </span>
                    {project.id === selectedProject.id && <span className="status-pill good">{t.selected}</span>}
                  </button>
                  <div className="row-actions">
                    <button type="button" aria-label={t.editProject} onClick={() => editProject(project)} disabled={!editable}>
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={t.deleteProject}
                      onClick={() => deleteProject(project.id)}
                      disabled={!editable || projects.length <= 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="project-summary">
              <InfoLine label={t.owner} value={selectedProject.owner} />
              <InfoLine label={t.productLine} value={selectedProject.productLine} />
              <InfoLine label={t.versions} value={selectedProjectVersionRecords.length.toString()} />
              <InfoLine label={t.requirements} value={selectedProjectRequirementRecords.length.toString()} />
            </div>
          </section>

          <section className="section-surface version-panel" aria-labelledby="version-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t.versions}</p>
                <h2 id="version-title">{t.activeVersion}</h2>
              </div>
              <div className="section-heading-actions">
                <button className="section-action" type="button" onClick={() => openVersionForm()} disabled={!editable}>
                  <Plus size={16} />
                  {t.addVersion}
                </button>
                <div className="segmented-control" aria-label={t.stage}>
                  <button className={stageFilter === 'all' ? 'selected' : ''} type="button" onClick={() => setStageFilter('all')}>
                    {t.allStages}
                  </button>
                  {stages.map((stage) => (
                    <button
                      className={stageFilter === stage ? 'selected' : ''}
                      type="button"
                      key={stage}
                      onClick={() => setStageFilter(stage)}
                    >
                      {t.stageMap[stage]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isVersionFormOpen && (
              <div className="version-form" data-testid="version-form">
                <label>
                  <span>{t.versionName}</span>
                  <input
                    ref={versionNameInputRef}
                    value={versionDraft.name}
                    onChange={(event) => setVersionDraft({ ...versionDraft, name: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t.startDate}</span>
                  <input
                    type="date"
                    value={versionDraft.startDate}
                    onChange={(event) => setVersionDraft({ ...versionDraft, startDate: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t.endDate}</span>
                  <input
                    type="date"
                    value={versionDraft.endDate}
                    onChange={(event) => setVersionDraft({ ...versionDraft, endDate: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t.stage}</span>
                  <select value={versionDraft.stage} onChange={(event) => setVersionDraft({ ...versionDraft, stage: event.target.value as Stage })}>
                    {stages.map((stage) => (
                      <option value={stage} key={stage}>
                        {t.stageMap[stage]}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="form-actions">
                  <button className="primary-action" type="button" onClick={submitVersion} disabled={!editable}>
                    <CheckCircle2 size={16} />
                    {editingVersionId ? t.updateVersion : t.saveVersion}
                  </button>
                  <button className="secondary-action" type="button" onClick={resetVersionDraft}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}

            <div className="version-list">
              {filteredVersions.length === 0 && <p className="empty-state">{t.noVersions}</p>}
              {renderVersionTree(filteredVersions)}
            </div>
          </section>

          <section
            className="section-surface requirement-panel"
            aria-labelledby="requirement-title"
            ref={requirementPanelRef}
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t.requirements}</p>
                <h2 id="requirement-title">{selectedVersion ? `${selectedVersion.name} · ${t.demandList}` : t.demandList}</h2>
              </div>
              <button className="section-action" type="button" onClick={openRequirementForm} disabled={!editable || !selectedVersion}>
                <Plus size={16} />
                {t.addDemand}
              </button>
            </div>
            <p className="section-note">{t.demandHint}</p>

            {isRequirementFormOpen && (
              <div className="requirement-form" data-testid="requirement-form">
                <label>
                  <span>{t.demandCode}</span>
                  <input
                    ref={requirementCodeInputRef}
                    value={requirementDraft.code}
                    onChange={(event) => setRequirementDraft({ ...requirementDraft, code: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t.demandTitle}</span>
                  <input
                    value={requirementDraft.title}
                    onChange={(event) => setRequirementDraft({ ...requirementDraft, title: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t.demandLink}</span>
                  <input
                    value={requirementDraft.link}
                    onChange={(event) => setRequirementDraft({ ...requirementDraft, link: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t.devOwner}</span>
                  <input
                    value={requirementDraft.owner}
                    onChange={(event) => setRequirementDraft({ ...requirementDraft, owner: event.target.value })}
                  />
                </label>
                <div className="form-actions">
                  <button className="primary-action" type="button" onClick={submitRequirement} disabled={!editable || !selectedVersion}>
                    <Plus size={16} />
                    {editingRequirementTarget ? t.updateDemand : t.saveDemand}
                  </button>
                  <button className="secondary-action" type="button" onClick={resetRequirementDraft}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}

            <div className="requirement-list">
              {!selectedVersion && <p className="empty-state">{t.noVersions}</p>}
              {selectedVersion?.requirements.length === 0 && <p className="empty-state">{t.noDemands}</p>}
              {selectedVersion?.requirements.map((requirement) => (
                <article className="requirement-row" data-requirement-id={requirement.id} key={requirement.id}>
                  <div className="requirement-code">{requirement.code}</div>
                  <div className="requirement-copy">
                    <strong>{requirement.title}</strong>
                    <span>{t.devOwner}: {requirement.owner || '-'}</span>
                    {requirement.link && (
                      <a href={requirement.link} target="_blank" rel="noreferrer">
                        <Link2 size={14} />
                        {requirement.link}
                      </a>
                    )}
                  </div>
                  <div className="row-actions">
                    {requirement.link && (
                      <a href={requirement.link} target="_blank" rel="noreferrer" aria-label={t.openLink}>
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button type="button" aria-label={t.editDemand} onClick={() => editRequirement(requirement)} disabled={!editable}>
                      <Edit3 size={16} />
                    </button>
                    <button type="button" aria-label={t.deleteDemand} onClick={() => deleteRequirement(requirement.id)} disabled={!editable}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
          </>
        ) : (
          activeViewContent[activeView]
        )}
      </section>
    </main>
  )
}

export default App
