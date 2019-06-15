import { IssueActivity, ProjectPlan, YouTrackIssue } from '@fschopp/project-planning-for-you-track';
import S from 's-js';
import { AppCtrl, Plain, Router } from '../main';
import { assignDemoApp, createDemoApp, DemoApp } from './demo-model';
import { DemoView } from './demo-view';

export class DemoCtrl {
  public readonly jsonProjectPlan: () => string;
  public readonly appCtrl: AppCtrl;

  constructor(
      public readonly demoApp: DemoApp
  ) {
    this.appCtrl = new AppCtrl(demoApp);
    this.jsonProjectPlan = S(() => {
      const extendedProjectPlan = this.appCtrl.extendedProjectPlan();
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

S.root(() => {
  const demoApp: DemoApp = createDemoApp();
  Router.create(demoApp, (plain: Plain<DemoApp>) => assignDemoApp(demoApp, plain));
  const demoCtrl = new DemoCtrl(demoApp);
  document.body.append(...DemoView({ctrl: demoCtrl}));
});
