import { TestingType, MIGRATION_STEPS } from '@packages/types'
import Debug from 'debug'
import type chokidar from 'chokidar'
import path from 'path'
import type { DataContext } from '..'
import {
  createConfigString,
  initComponentTestingMigration,
  ComponentTestingMigrationStatus,
  getSpecs,
  getDefaultLegacySupportFile,
  RelativeSpecWithTestingType,
  supportFilesForMigration,
  OldCypressConfig,
  hasComponentSpecFile,
} from '../util/migration'
import {
  formatMigrationFile,
  FilePart,
  regexps,
  NonSpecFileError,
} from '../util/migrationFormat'

const debug = Debug('cypress:data-context:MigrationDataSource')

interface MigrationFile {
  testingType: TestingType
  relative: string
  parts: FilePart[]
}

export interface FilesForMigrationUI {
  before: MigrationFile[]
  after: MigrationFile[]
}

type MIGRATION_STEP = typeof MIGRATION_STEPS[number]

export class MigrationDataSource {
  private _config: OldCypressConfig | null = null
  private _step: MIGRATION_STEP = 'renameAuto'
  filteredSteps: MIGRATION_STEP[] = MIGRATION_STEPS.filter(() => true)
  hasCustomIntegrationFolder: boolean = false
  hasCustomIntegrationSpecPattern: boolean = false
  hasCustomComponentFolder: boolean = false
  hasCustomComponentSpecPattern: boolean = false
  hasComponentTesting: boolean = true

  private componentTestingMigrationWatcher?: chokidar.FSWatcher
  componentTestingMigrationStatus?: ComponentTestingMigrationStatus

  constructor (private ctx: DataContext) { }

  async initialize () {
    this._config = null
    await this.initializeFlags()
    this.filteredSteps = MIGRATION_STEPS.filter((step) => this.shouldShowStep(step))
    if (this.filteredSteps[0]) {
      this.setStep(this.filteredSteps[0])
      debug('ready to start migration')
    }
  }

  async getSpecsRelativeToFolder () {
    if (!this.ctx.currentProject) {
      throw Error('cannot get specs without a project path')
    }

    const compFolder = await this.getComponentFolder()
    const intFolder = await this.getIntegrationFolder()

    const specs = await getSpecs(this.ctx.currentProject, compFolder, intFolder)

    debug('looked in %s and %s and found %o', compFolder, intFolder, specs)

    return specs
  }

  async getDefaultLegacySupportFile (): Promise<string> {
    if (!this.ctx.currentProject) {
      throw Error(`Need this.ctx.projectRoot!`)
    }

    return getDefaultLegacySupportFile(this.ctx.currentProject)
  }

  async getComponentTestingMigrationStatus () {
    const config = await this.parseCypressConfig()

    if (!config || !this.ctx.currentProject) {
      throw Error('Need currentProject and config to continue')
    }

    if (!this.componentTestingMigrationWatcher) {
      const onFileMoved = (status: ComponentTestingMigrationStatus) => {
        this.componentTestingMigrationStatus = status

        if (status.completed) {
          this.componentTestingMigrationWatcher?.close()
        }

        // TODO(lachlan): is this the right plcae to use the emitter?
        this.ctx.deref.emitter.toLaunchpad()
      }

      const { status, watcher } = await initComponentTestingMigration(
        this.ctx.currentProject,
        await this.getComponentFolder(),
        config.component?.testFiles || config.testFiles || '**/*',
        onFileMoved,
      )

      this.componentTestingMigrationStatus = status
      this.componentTestingMigrationWatcher = watcher
    }

    if (!this.componentTestingMigrationStatus) {
      throw Error(`Status should have been assigned by the watcher. Somethign is wrong`)
    }

    return this.componentTestingMigrationStatus
  }

  async supportFilesForMigrationGuide (): Promise<FilesForMigrationUI> {
    if (!this.ctx.currentProject) {
      throw Error(`Need this.ctx.projectRoot!`)
    }

    return supportFilesForMigration(this.ctx.currentProject)
  }

  async getSpecsForMigrationGuide (): Promise<FilesForMigrationUI> {
    const specs = await this.getSpecsRelativeToFolder()

    const processSpecs = (regexp: 'beforeRegexp' | 'afterRegexp') => {
      return (acc: MigrationFile[], x: RelativeSpecWithTestingType) => {
        try {
          return acc.concat({
            testingType: x.testingType,
            relative: x.relative,
            parts: formatMigrationFile(x.relative, new RegExp(regexps[x.testingType][regexp])),
          })
        } catch (e) {
          if (e instanceof NonSpecFileError) {
            // it's possible they have a non spec file in their cypress/integration directory,
            // if that happens, we just skip that file and carry on.
            return acc
          }

          throw e
        }
      }
    }

    const result: FilesForMigrationUI = {
      before: specs.before.reduce(processSpecs('beforeRegexp'), []),
      after: specs.after.reduce(processSpecs('afterRegexp'), []),
    }

    if (result.before.length !== result.after.length) {
      throw Error(`Before and after should have same lengths, got ${result.before.length} and ${result.after.length}`)
    }

    return result
  }

  async getConfig () {
    const config = await this.parseCypressConfig()

    return JSON.stringify(config, null, 2)
  }

  async createConfigString () {
    const config = await this.parseCypressConfig()

    return createConfigString(config)
  }

  async getIntegrationFolder () {
    const config = await this.parseCypressConfig()

    if (config.e2e?.integrationFolder) {
      return config.e2e.integrationFolder
    }

    if (config.integrationFolder) {
      return config.integrationFolder
    }

    return 'cypress/integration'
  }

  async getComponentFolder () {
    const config = await this.parseCypressConfig()

    if (config.component?.componentFolder) {
      return config.component.componentFolder
    }

    if (config.componentFolder) {
      return config.componentFolder
    }

    return 'cypress/component'
  }

  private async parseCypressConfig (): Promise<OldCypressConfig> {
    if (this._config) {
      return this._config
    }

    if (this.ctx.lifecycleManager.metaState.hasLegacyCypressJson) {
      const cfgPath = path.join(this.ctx.lifecycleManager?.projectRoot, 'cypress.json')

      this._config = await this.ctx.file.readJsonFile(cfgPath) as OldCypressConfig

      return this._config
    }

    return {}
  }

  private async initializeFlags () {
    const config = await this.parseCypressConfig()

    this.hasCustomIntegrationSpecPattern = config.testFiles !== undefined || config.e2e?.testFiles !== undefined

    this.hasCustomIntegrationFolder = config.e2e?.integrationFolder !== undefined || config.integrationFolder !== undefined

    const customComponentTestFiles = config.component?.testFiles ?? config.testFiles
    const customComponentFolder = config.component?.componentFolder ?? config.componentFolder

    this.hasCustomComponentSpecPattern = customComponentTestFiles !== '*/**' && customComponentTestFiles !== undefined && customComponentTestFiles !== null

    this.hasCustomComponentFolder = customComponentFolder !== 'cypress/component' && customComponentFolder !== undefined && customComponentFolder !== null

    const componentFolder = customComponentFolder ?? 'cypress/component'
    const componentGlob = customComponentTestFiles ?? '**/*'

    this.hasComponentTesting = await hasComponentSpecFile(
      this.ctx.lifecycleManager?.projectRoot,
      componentFolder,
      componentGlob,
    )
  }

  private shouldShowStep (step: MIGRATION_STEP): boolean {
    switch (step) {
      case 'renameAuto': return !(this.hasCustomIntegrationSpecPattern && this.hasCustomComponentSpecPattern)
      case 'renameManual': return this.hasComponentTesting
      case 'setupComponent': return this.hasComponentTesting
      default: return true
    }
  }

  get step (): MIGRATION_STEP {
    return this._step
  }

  setStep (step: MIGRATION_STEP) {
    this._step = step
  }
}
