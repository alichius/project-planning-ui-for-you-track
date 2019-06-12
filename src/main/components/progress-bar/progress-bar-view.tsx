// noinspection ES6UnusedImports
import * as Surplus from 'surplus';
import { withClassIff } from '../../utils/surplus';

function asString(progress: () => number | undefined, unit: string = ''): string {
  const currentProgress: number | undefined = progress();
  const value: number = currentProgress === undefined || currentProgress < 0
      ? 0
      : Math.min(100, currentProgress);
  return value === 0
      ? value.toString()
      : `${value}${unit}`;
}

export interface ProgressBarProperties {
  className?: string;
  progress: () => number | undefined;
}

export function ProgressBarView({className, progress}: ProgressBarProperties): HTMLElement {
  return <div class={`progress ${className || ''}`} fn={withClassIff(() => progress() === undefined, 'd-none')}>
      <div class="progress-bar progress-bar-striped progress-bar-animated"
           role="progressbar" aria-valuenow={asString(progress)} aria-valuemin="0" aria-valuemax="100"
           style={{width: asString(progress, '%')}} />
    </div>;
}
