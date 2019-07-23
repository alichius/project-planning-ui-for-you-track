import { goToOauthPage, } from '@fschopp/project-planning-for-you-track';
import S from 's-js';
import { AlertsCtrl } from '../alerts/alerts-ctrl';
import { SettingsCtrl } from '../settings/settings-ctrl';
import { Settings } from '../settings/settings-model';
import { YouTrackMetadataCtrl } from '../you-track-metadata/you-track-metadata-ctrl';
import { App, AppComputation } from './app-model';

/**
 * Controller for {@link App}.
 *
 * @typeparam T Type of of the user-provided state; that is, of {@link App.settings}.
 */
export class AppCtrl<T extends Settings> {
  /**
   * Creates a new {@link AppCtrl}, including all transitive (controller) dependencies.
   *
   * This method is a convenience method. It creates and “wires” dependencies such as {@link AlertsCtrl} or
   * {@link SettingsCtrl}, using reasonable defaults.
   *
   * @typeparam T Type of of the user-provided state; that is, of {@link App.settings}.
   * @param app The user-provided application state.
   * @param appComputation The computed application state.
   */
  public static createDefaultAppCtrl<T extends Settings>(app: App<T>, appComputation: AppComputation): AppCtrl<T> {
    const settingsCtrl: SettingsCtrl = new SettingsCtrl(app.settings);
    const alertsCtrl: AlertsCtrl = new AlertsCtrl(appComputation.alerts);
    const youTrackMetadataCtrl: YouTrackMetadataCtrl =
        new YouTrackMetadataCtrl(appComputation.youTrackMetadata, settingsCtrl.normalizedBaseUrl, alertsCtrl);
    return new AppCtrl(app, appComputation, settingsCtrl, alertsCtrl, youTrackMetadataCtrl);
  }

  /**
   * Constructor.
   *
   * @param app_ The user-provided application state.
   * @param appComputation_ The computed application state.
   * @param settingsCtrl The controller for elementary settings (name of YouTrack instance, base URL, etc.).
   * @param alertsCtrl The controller for displaying alerts to the user.
   * @param youTrackMetadataCtrl The controller for retrieving YouTrack metadata.
   */
  public constructor(
      private readonly app_: App<T>,
      private readonly appComputation_: AppComputation,
      public readonly settingsCtrl: SettingsCtrl,
      public readonly alertsCtrl: AlertsCtrl,
      public readonly youTrackMetadataCtrl: YouTrackMetadataCtrl
  ) {
    // 'seed' is undefined (the calculation does not keep a state), and 'onchanges' is true (skip the initial run).
    S.on(this.appComputation_.connect, () => this.connect(), undefined, true);

    // Bind document.title to react to changes of this.app.transient.appName
    S(() => {
      const appName: string = this.appComputation_.name();
      const title: string = this.app_.settings.name();
      document.title = title.length > 0
          ? `${appName}: ${title}`
          : appName;
    });
  }

  public showErrorIfFailure(title: string, promise: Promise<void>): void {
    promise
        .catch((exception) => this.alertsCtrl.alert(title, exception))
        .finally(() => {
          this.appComputation_.progress(undefined);
        });
  }

  private connect(): void {
    goToOauthPage(this.settingsCtrl.normalizedBaseUrl(), this.settingsCtrl.normalizedHubUrl(),
        this.app_.settings.youTrackServiceId(), this.app_);
  }
}
