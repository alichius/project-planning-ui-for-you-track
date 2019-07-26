import { unreachableCase } from '../../utils/typescript';
import { Action } from './project-planning-app-ctrl';

export function projectPlanningActionLabel(action: Action) {
  switch (action) {
    case Action.COMPLETE_SETTINGS: return 'Finish settings...';
    case Action.CONNECT: return 'Connect';
    case Action.BUILD_PLAN: return 'Build plan';
    case Action.UPDATE_PREDICTION: return 'Update prediction';
    case Action.STOP: return 'Stop';
    case Action.NOTHING: return 'Nothing';
    default: return unreachableCase(action);
  }
}
