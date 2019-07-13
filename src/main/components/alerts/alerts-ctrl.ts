import { isFailure } from '@fschopp/project-planning-for-you-track';
import { SDataArray } from 's-array';
import { Alert } from './alerts-model';

/**
 * Controller for the list of alerts.
 */
export class AlertsCtrl {
  /**
   * Constructor.
   *
   * @param alerts_ Array signal carrying the list of alerts currently shown.
   */
  public constructor(
      private readonly alerts_: SDataArray<Alert>
  ) { }

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
