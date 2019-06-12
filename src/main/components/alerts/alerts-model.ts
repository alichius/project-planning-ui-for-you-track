import createSDataArray, { SDataArray } from 's-array';
import { jsonable } from '../../utils/s';

/**
 * Alert to the user.
 */
export interface Alert {
  title: string;
  message: string;
}

/**
 * Creates a new “alert state” consisting of all alerts currently shown to the user.
 */
export function createAlerts(): SDataArray<Alert> {
  return jsonable(createSDataArray<Alert>([]));
}
