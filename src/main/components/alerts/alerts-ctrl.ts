import { isFailure } from '@fschopp/project-planning-for-you-track';
import { SArray, SDataArray } from 's-array';
import { Alert, createAlerts } from './alerts-model';

/**
 * Controller for the list of alerts.
 */
export class AlertsCtrl {
  /**
   * Array signal carrying the list of alerts currently shown.
   */
  public readonly alerts: SArray<Alert>;

  private readonly alerts_: SDataArray<Alert> = createAlerts();

  constructor() {
    this.alerts = this.alerts_;
  }

  /**
   * Adds a new alert that is to be shown to the user.
   *
   * @param title title of the alert
   * @param failure details of the alert
   */
  public alert(title: string, failure: unknown): void {
    let message: string;
    if (isFailure(failure)) {
      message = failure;
    } else if (failure instanceof Error) {
      message = failure.toString();
    } else {
      message = `Unknown error: ${failure}`;
    }
    this.alerts_.push({title, message});
  }

  /**
   * Removes the given alert.
   *
   * @param alert alert to be removed, must have been previously created by {@link alert}().
   */
  public remove(alert: Alert): void {
    this.alerts_.remove(alert);
  }
}
