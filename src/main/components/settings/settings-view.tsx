import { DataSignal } from 's-js';
import * as Surplus from 'surplus'; // lgtm [js/unused-local-variable]
import { bindString } from '../../utils/surplus';
import { EDIT_AREA_CLASS, FORM_GROUP_CLASS, HELP_CLASS, INPUT_CLASS, LABEL_CLASS } from '../bootstrap';
import { SettingsCtrl } from './settings-ctrl';
import { Settings } from './settings-model';

export interface SettingsProperties {
  settings: Settings;
  ctrl: SettingsCtrl;
  connectSignal: DataSignal<null>;
}

export function SettingsView({settings, ctrl, connectSignal}: SettingsProperties): HTMLElement {
  return <div>
    <div class={FORM_GROUP_CLASS}>
      <label for="instanceName" class={LABEL_CLASS}>Title:</label>
      <div class={EDIT_AREA_CLASS}>
        <input id="instanceName" type="text" class={INPUT_CLASS} aria-describedby="instanceNameHelp"
               placeholder="Enter Name" fn={bindString(settings.name)} />
        <small id="instanceNameHelp" class="form-text text-muted">
          The tab/window title, which is also used for bookmarks.
        </small>
      </div>
    </div>
    <hr />
    <div class={FORM_GROUP_CLASS}>
      <label for="baseUrl" class={LABEL_CLASS}>Base URL:</label>
      <div class={EDIT_AREA_CLASS}>
        <input id="baseUrl" type="text" class={INPUT_CLASS} aria-describedby="baseUrlHelp"
               placeholder="Enter URL" fn={bindString(settings.youTrackBaseUrl)} />
        <small id="baseUrlHelp" class="form-text text-muted">
          For YouTrack InCloud, this is of form <code>https://&lt;name&gt;.myjetbrains.com/</code>. For a YouTrack
          Standalone installation, this is the “Base URL” shown at Server Settings &gt; Global Settings.
        </small>
      </div>
    </div>
    <div class={FORM_GROUP_CLASS}>
      <label for="serviceId" class={LABEL_CLASS}>Service ID in Hub:</label>
      <div class={EDIT_AREA_CLASS}>
        <input id="serviceId" type="text" class={INPUT_CLASS} aria-describedby="serviceIdHelp"
               placeholder="Enter Service ID in Hub" fn={bindString(settings.youTrackServiceId)} />
        <small id="serviceIdHelp" class={HELP_CLASS}>
          The YouTrack service ID is available
          via <a target="_blank" fn={ctrl.hrefRelativeToBaseUrl('youtrack/admin/ring')}>Server Settings &gt; Hub
          Integration</a>.
        </small>
      </div>
    </div>
    <div class={FORM_GROUP_CLASS}>
      <div class={`offset-md-4 offset-lg-3 ${EDIT_AREA_CLASS}`}>
        <button type="button" class="btn btn-sm btn-secondary" aria-describedby="loginHelp"
                disabled={ctrl.verifiedBaseUrl().length === 0 || settings.youTrackServiceId().length === 0}
                onClick={() => connectSignal(null)}>Connect…</button>
        <small id="loginHelp" class={HELP_CLASS}>
          If you are not logged into YouTrack yet, this will take you to the YouTrack login page. Once logged in, you
          will be redirected back here. Please note: The URI of this web app (that is,
          “{SettingsCtrl.currentUri()}”) needs to be registered in the&#32;
          <a target="_blank"
             fn={ctrl.hubRelativeToBaseUrlAndServiceId((serviceId) =>
                 `youtrack/admin/hub/services/${serviceId}?tab=settings`)}>
            Hub Settings
          </a> under “Redirect URIs”. The URI also needs to be added under “Allowed origins”
          at <a target="_blank" fn={ctrl.hrefRelativeToBaseUrl('youtrack/admin/settings')}>Server Settings &gt; Global
          Settings</a>.
        </small>
      </div>
    </div>
  </div>;
}
