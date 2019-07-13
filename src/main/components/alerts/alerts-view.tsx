import { SDataArray } from 's-array';
import * as Surplus from 'surplus'; // lgtm [js/unused-local-variable]
import { AlertsCtrl } from './alerts-ctrl';
import { Alert } from './alerts-model';

export interface AlertsProperties {
  readonly alerts: SDataArray<Alert>;
  readonly ctrl: AlertsCtrl;
}

/**
 * Creates a new HTML element that will contain all alerts that are to be shown to the user.
 */
export function AlertsView({alerts, ctrl}: AlertsProperties): HTMLElement {
  return (
      <div class="alert-wrapper" aria-live="polite" aria-atomic="true">
        {alerts.mapSample((alert) =>
            <div class="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
              <div class="toast-header">
                <strong class="mr-auto">{alert.title}</strong>
                <button type="button" class="ml-2 mb-1 close" aria-label="Close" onClick={() => ctrl.remove(alert)}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="toast-body">{alert.message}</div>
            </div>
        )}
      </div>
  );
}
