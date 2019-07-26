import {
  appendSchedule,
  Contributor,
  Failure,
  isFailure,
  ProjectPlan,
  retrieveProjectPlan,
  RetrieveProjectPlanOptions,
  Schedule,
  scheduleUnresolved,
  SchedulingOptions,
  YouTrackConfig,
  YouTrackIssue,
} from '@fschopp/project-planning-for-you-track';
import { strict as assert } from 'assert';
import S, { DataSignal } from 's-js';
import { deepEquals } from '../../utils/deep-equals';
import { Plain } from '../../utils/s';
import { unreachableCase } from '../../utils/typescript';
import { AppCtrl } from '../app/app-ctrl';
import { App, Page } from '../app/app-model';
import { ContributorCtrl } from '../contributor/contributor-ctrl';
import { Contributor as ContributorModel, ContributorKind } from '../contributor/contributor-model';
import { ContributorsCtrl } from '../contributors/contributors-ctrl';
import { ProjectPlanningSettingsCtrl } from '../project-planning-settings/project-planning-settings-ctrl';
import { ProjectPlanningSettings } from '../project-planning-settings/project-planning-settings-model';
import { toNormalizedPlainSettings } from '../settings/settings-model';
import { YouTrackMetadata } from '../you-track-metadata/you-track-metadata-model';
import { ProjectPlanningAppComputation } from './project-planning-app-model';

const MIN_STATE_CHANGE_DURATION_MS = 60 * 60 * 1000;
const DEFAULT_REMAINING_EFFORT_MS = 0;
const DEFAULT_WAIT_TIME_MS = 0;

/**
 * Resolution is 1 hour.
 */
const SCHEDULING_RESOLUTION_MS = 60 * 60 * 1000;

/**
 * Cannot preempt or split issues that are less than 4 hours ideal time.
 */
const MIN_ACTIVITY_DURATION = 4;

/**
 * Prefix for the IDs of external contributors.
 *
 * No YouTrack user ID must have the same prefix. Given that all
 * [YouTrack IDs are of form "x-y" where both x and y are integers](https://github.com/JetBrains/xodus/blob/master/entity-store/src/main/java/jetbrains/exodus/entitystore/PersistentEntityId.java)
 * (see also the
 * [`EntityId` interface](https://github.com/JetBrains/xodus/blob/master/openAPI/src/main/java/jetbrains/exodus/entitystore/EntityId.java)),
 * anything starting with a non-numeric character should already be safe.
 */
const EXTERNAL_CONTRIBUTOR_ID_PREFIX = '@fschopp/project-planning-ui-for-you-track/';

export enum Action {
  COMPLETE_SETTINGS = 'complete',
  CONNECT = 'connect',
  BUILD_PLAN = 'build',
  UPDATE_PREDICTION = 'update',
  STOP = 'stop',
  NOTHING = 'nothing',
}

/**
 * Project plan together the settings used to compute it.
 */
export interface ExtendedProjectPlan {
  /**
   * The project plan.
   */
  plan: ProjectPlan;

  /**
   * The settings from the user interface.
   */
  settings: Plain<ProjectPlanningSettings>;

  /**
   * Time when the YouTrack activity log had been completely received and processed.
   */
  youTrackTimestamp: number;

  /**
   * Mapping from contributor IDs in {@link plan} to the real name ({@link ExternalContributor.name}).
   *
   * This map only includes IDs for external contributors. IDs not in this map are YouTrack user IDs.
   */
  idToExternalContributorName: Map<string, string>;
}

/**
 * Controller for {@link App}.
 */
export class ProjectPlanningAppCtrl {
  /**
   * Signal carrying the kind of action triggered by the button in the nav bar.
   */
  public readonly action: () => Action;

  /**
   * Signal carrying the latest project plan and the settings used to compute it, or undefined if no project plan was
   * computed yet.
   *
   * The settings are the result of {@link toNormalizedPlainSettings}(); that is, they are normalized.
   */
  public readonly extendedProjectPlan: () => ExtendedProjectPlan | undefined;

  /**
   * Signal carrying the number of warnings in the project plan.
   */
  public readonly numWarnings: () => number;


  private readonly extendedProjectPlan_: DataSignal<ExtendedProjectPlan | undefined> = S.value(undefined);
  private retrievedProjectPlanTimestamp: number | undefined;
  private retrieveProjectPlanResult: ProjectPlan | undefined;


  public static createDefaultProjectPlanningAppCtrl(
      app: App<ProjectPlanningSettings>, appComputation: ProjectPlanningAppComputation): ProjectPlanningAppCtrl {
    const appCtrl: AppCtrl<ProjectPlanningSettings> = AppCtrl.createDefaultAppCtrl(app, appComputation);
    const createContributorCtrl = (contributor: ContributorModel): ContributorCtrl =>
        new ContributorCtrl(contributor, app.settings.contributors);
    const contributorsCtrl: ContributorsCtrl =
        new ContributorsCtrl(app.settings.contributors, app.settings.transient, createContributorCtrl);
    const settingsCtrl: ProjectPlanningSettingsCtrl = new ProjectPlanningSettingsCtrl(
        app.settings, appCtrl.settingsCtrl, appCtrl.youTrackMetadataCtrl, contributorsCtrl);
    return new ProjectPlanningAppCtrl(app, appComputation, appCtrl, settingsCtrl);
  }

  /**
   * Constructor.
   *
   * @param app_ The user-provided application state.
   * @param appComputation_ The computed application state.
   * @param appCtrl Controller for {@link App}.
   * @param settingsCtrl Controller for {@link ProjectPlanningSettings}.
   */
  public constructor(
      private readonly app_: App<ProjectPlanningSettings>,
      private readonly appComputation_: ProjectPlanningAppComputation,
      public readonly appCtrl: AppCtrl<ProjectPlanningSettings>,
      public readonly settingsCtrl: ProjectPlanningSettingsCtrl
  ) {
    this.action = S(() => actionFromState(
        this.appComputation_.progress(), this.appCtrl.youTrackMetadataCtrl.pendingMetadata(),
        this.appComputation_.youTrackMetadata(), this.extendedProjectPlan_(),
        toNormalizedPlainSettings(this.app_.settings), app_.currentPage(), appComputation_.numInvalidSettings() === 0));
    this.extendedProjectPlan = this.extendedProjectPlan_;
    this.numWarnings = S(() => {
      const extendedProjectPlan: ExtendedProjectPlan | undefined = this.extendedProjectPlan();
      return extendedProjectPlan === undefined
          ? 0
          : extendedProjectPlan.plan.warnings.length;
    });

    // 'seed' is undefined (the calculation does not keep a state), and 'onchanges' is true (skip the initial run).
    S.on(this.appComputation_.doAction, () => this.defaultAction(), undefined, true);
  }

  public defaultAction(): void {
    const action: Action = this.action();
    switch (action) {
      case Action.COMPLETE_SETTINGS: this.app_.currentPage(Page.SETTINGS); return;
      case Action.CONNECT: this.appComputation_.connect(null); return;
      case Action.BUILD_PLAN:
        return this.appCtrl.showErrorIfFailure(
            'Failed to build project plan',
            this.buildPlan(toNormalizedPlainSettings(this.app_.settings))
        );
      case Action.UPDATE_PREDICTION:
        return this.appCtrl.showErrorIfFailure(
            'Failed to update prediction',
            this.updatePrediction(toNormalizedPlainSettings(this.app_.settings))
        );
      case Action.STOP: case Action.NOTHING: return;
      default: return unreachableCase(action);
    }
  }

  private async buildPlan(currentConfig: Plain<ProjectPlanningSettings>): Promise<void> {
    const typeFieldId = currentConfig.typeFieldId;
    const splittableTypeIds = new Set<string>(currentConfig.splittableTypeIds);
    const youTrackConfig: YouTrackConfig = {
      stateFieldId: currentConfig.stateFieldId,
      inactiveStateIds: currentConfig.inactiveStateIds,
      remainingEffortFieldId: currentConfig.remainingEffortFieldId,
      remainingWaitFieldId: currentConfig.remainingWaitFieldId,
      assigneeFieldId: currentConfig.assigneeFieldId,
      otherCustomFieldIds: [typeFieldId],
      dependsLinkTypeId: currentConfig.dependsLinkTypeId,
      doesInwardDependOnOutward: currentConfig.doesInwardDependOnOutward,
      savedQueryId: currentConfig.savedQueryId,
      overlaySavedQueryId: currentConfig.overlaySavedQueryId,
      minStateChangeDurationMs: MIN_STATE_CHANGE_DURATION_MS,
      defaultRemainingEffortMs: DEFAULT_REMAINING_EFFORT_MS,
      defaultWaitTimeMs: DEFAULT_WAIT_TIME_MS,
      isSplittableFn: (issue: YouTrackIssue) => {
        const value: string | undefined = issue.customFields[typeFieldId];
        return splittableTypeIds.has(value);
      },
    };
    const options: RetrieveProjectPlanOptions = {
      progressCallback: (percentDone) => this.appComputation_.progress(percentDone),
    };
    this.retrieveProjectPlanResult = await retrieveProjectPlan(
        this.appCtrl.settingsCtrl.normalizedBaseUrl(),
        youTrackConfig,
        options
    );
    this.retrievedProjectPlanTimestamp = Date.now();
    await this.updatePrediction(currentConfig);
  }

  private async updatePrediction(currentConfig: Plain<ProjectPlanningSettings>): Promise<void> {
    const youTrackMetadata: YouTrackMetadata | undefined = this.appComputation_.youTrackMetadata();
    assert(this.retrieveProjectPlanResult !== undefined && youTrackMetadata !== undefined &&
        this.retrievedProjectPlanTimestamp !== undefined);

    const contributors: Contributor[] = [];
    const idToExternalContributorName = new Map<string, string>();
    for (const contributor of currentConfig.contributors) {
      let id: string;
      let numMembers: number;
      if (contributor.type === ContributorKind.EXTERNAL) {
        id = `${EXTERNAL_CONTRIBUTOR_ID_PREFIX}${idToExternalContributorName.size}`;
        idToExternalContributorName.set(id, contributor.name);
        numMembers = contributor.numMembers;
      } else {
        id = contributor.id;
        numMembers = 1;
      }
      contributors.push({
        id,
        minutesPerWeek: 60 * contributor.hoursPerWeek,
        numMembers,
      });
    }
    const schedulingOptions: SchedulingOptions = {
      contributors,
      minutesPerWeek: youTrackMetadata!.minutesPerWorkWeek,
      resolutionMs: SCHEDULING_RESOLUTION_MS,
      minActivityDuration: MIN_ACTIVITY_DURATION,
      predictionStartTimeMs: this.retrievedProjectPlanTimestamp,
    };
    const schedule: Schedule = await scheduleUnresolved(
        this.retrieveProjectPlanResult!.issues, schedulingOptions);
    const finalPlan: ProjectPlan | Failure = appendSchedule(
        this.retrieveProjectPlanResult!, schedule, schedulingOptions.predictionStartTimeMs!);
    if (isFailure(finalPlan)) {
      throw finalPlan;
    } else {
      this.extendedProjectPlan_({
        plan: finalPlan,
        settings: currentConfig,
        youTrackTimestamp: this.retrievedProjectPlanTimestamp!,
        idToExternalContributorName,
      });
    }
  }
}

function actionFromState(progress: number | undefined, pendingMetadata: boolean,
    youTrackMetadata: YouTrackMetadata | undefined, extendedProjectPlan: ExtendedProjectPlan | undefined,
    currentSettings: Plain<ProjectPlanningSettings>, currentPage: Page, validSettings: boolean): Action {
  if (progress !== undefined || pendingMetadata) {
    return Action.STOP;
  } else if (!validSettings) {
    return currentPage === Page.SETTINGS
        ? Action.NOTHING
        : Action.COMPLETE_SETTINGS;
  } else if (youTrackMetadata === undefined) {
    return Action.CONNECT;
  } else if (extendedProjectPlan === undefined) {
    return Action.BUILD_PLAN;
  }

  const newWithoutContributors = {...currentSettings};
  const lastWithoutContributors = {...extendedProjectPlan.settings};
  delete newWithoutContributors.contributors;
  delete lastWithoutContributors.contributors;
  const youTrackConfigChanged = !deepEquals(newWithoutContributors, lastWithoutContributors);
  const contributorsChanged = !deepEquals(currentSettings.contributors, extendedProjectPlan.settings.contributors);

  if (youTrackConfigChanged) {
    return Action.BUILD_PLAN;
  } else if (contributorsChanged) {
    return Action.UPDATE_PREDICTION;
  } else {
    return Action.NOTHING;
  }
}
