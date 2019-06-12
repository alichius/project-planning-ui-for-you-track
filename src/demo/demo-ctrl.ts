import { IssueActivity, ProjectPlan, YouTrackIssue } from '@fschopp/project-planning-for-you-track';
import S from 's-js';
import { App, AppCtrl, createApp, Router } from '../main';
import { DemoView } from './demo-view';

export class DemoCtrl {
  public readonly jsonProjectPlan: () => string;

  constructor(
      public readonly appCtrl: AppCtrl
  ) {
    this.jsonProjectPlan = S(() => {
      const currentProjectPlan = appCtrl.projectPlan();
      if (currentProjectPlan === undefined) {
        return '';
      }
      // OK in demo to deep clone like this
      const clonedProjectPlan: ProjectPlan = JSON.parse(JSON.stringify(currentProjectPlan));
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

S.root(() => {
  const app: App = createApp();
  new Router(app);
  const appCtrl = new AppCtrl(app);
  const demoCtrl = new DemoCtrl(appCtrl);
  document.body.append(...DemoView({ctrl: demoCtrl}).children);
});
