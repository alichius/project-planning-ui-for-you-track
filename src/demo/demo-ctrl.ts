import { IssueActivity, ProjectPlan, YouTrackIssue } from '@fschopp/project-planning-for-you-track';
import S from 's-js';
import { ProjectPlanningAppComputation, ProjectPlanningAppCtrl } from '../main';
import { DemoApp } from './demo-model';

export class DemoCtrl {
  public readonly jsonProjectPlan: () => string;

  public static createDefaultDemoCtrl(app: DemoApp, appComputation: ProjectPlanningAppComputation): DemoCtrl {
    const projectPlanningAppCtrl: ProjectPlanningAppCtrl =
      ProjectPlanningAppCtrl.createDefaultProjectPlanningAppCtrl(app, appComputation);
    return new DemoCtrl(projectPlanningAppCtrl);
  }

  public constructor(
      public readonly projectPlanningAppCtrl: ProjectPlanningAppCtrl
  ) {
    this.jsonProjectPlan = S(() => {
      const extendedProjectPlan = projectPlanningAppCtrl.extendedProjectPlan();
      if (extendedProjectPlan === undefined) {
        return '';
      }
      const projectPlan: ProjectPlan = extendedProjectPlan.plan;
      // OK in demo to deep clone like this
      const clonedProjectPlan: ProjectPlan = JSON.parse(JSON.stringify(projectPlan));
      humanReadableTimestamps(clonedProjectPlan);
      return JSON.stringify(clonedProjectPlan, undefined, 2);
    });
  }
}

function humanReadableTimestamps(projectPlan: ProjectPlan): void {
  interface IsoTimestampedIssue {
    $resolved: string;
  }
  interface IsoTimestampedIssueActivity {
    $start: string;
    $end: string;
  }

  for (const issue of projectPlan.issues) {
    if (issue.resolved !== Number.MAX_SAFE_INTEGER) {
      (issue as YouTrackIssue & IsoTimestampedIssue).$resolved = new Date(issue.resolved).toISOString();
    }
    for (const issueActivity of issue.issueActivities) {
      const timestampedIssueActivity = issueActivity as IssueActivity & IsoTimestampedIssueActivity;
      timestampedIssueActivity.$start = new Date(issueActivity.start).toISOString();
      timestampedIssueActivity.$end = new Date(issueActivity.end).toISOString();
    }
  }
}
