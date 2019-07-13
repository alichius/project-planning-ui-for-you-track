import { ProjectPlan, ProjectPlanWarning } from '@fschopp/project-planning-for-you-track';
import * as Surplus from 'surplus'; // lgtm [js/unused-local-variable]

export function WarningsView({projectPlan}: {projectPlan: () => ProjectPlan | undefined}): HTMLElement {
  return (
      <ul class="list-group">
        {warnings(projectPlan()).map((warning) =>
            <li class="list-group-item">{warning.description}</li>
        )}
      </ul>
  );
}

function warnings(projectPlan: ProjectPlan | undefined): ProjectPlanWarning[] {
  return projectPlan === undefined
      ? []
      : projectPlan.warnings;
}
