import { DataSignal } from 's-js';
import * as Surplus from 'surplus'; // lgtm [js/unused-local-variable]
import { Counter } from '../../utils/counter';
import { bindString } from '../../utils/surplus';
import { EDIT_AREA_CLASS, FORM_GROUP_CLASS, HELP_CLASS, INPUT_CLASS, LABEL_CLASS, OFFSET_CLASS } from '../bootstrap';
import { SettingsCtrl } from './settings-ctrl';
import { Settings } from './settings-model';

export interface SettingsProperties {
  readonly settings: Settings;
  readonly ctrl: SettingsCtrl;
  readonly connectSignal: DataSignal<null>;
  readonly invalidCounter: Counter;
}

export function SettingsView({settings, ctrl, connectSignal, invalidCounter}: SettingsProperties):
    HTMLElement {
  return <div>
    <div class={FORM_GROUP_CLASS}>
      <label for="instanceName" class={LABEL_CLASS}>Title:</label>
      <div class={EDIT_AREA_CLASS}>
        <input id="instanceName" type="text" class={INPUT_CLASS} aria-describedby="instanceNameHelp"
               fn={bindString(settings.name)} />
        <small id="instanceNameHelp" class="form-text text-muted">
          The tab/window title, which is also used for bookmarks.
        </small>
      </div>
    </div>
    <hr />
    <div class={FORM_GROUP_CLASS}>
      <label for="baseUrl" class={LABEL_CLASS}>Base URL:</label>
      <div class={EDIT_AREA_CLASS}>
        <input id="baseUrl" type="URL" required class={INPUT_CLASS} aria-describedby="baseUrlHelp"
               fn={bindString(settings.youTrackBaseUrl, invalidCounter)} />
        <small id="baseUrlHelp" class="form-text text-muted">
          For YouTrack InCloud, enter the “Base URL” shown
          at <a target="_blank" fn={ctrl.hrefRelativeToBaseUrl('admin/domainSettings')}>Server Settings &gt; Domain
          Settings</a>. The URL should be of form “https://&lt;your-domain&gt;/youtrack”. For YouTrack Standalone, enter
          the “Base URL” shown at <a target="_blank" fn={ctrl.hrefRelativeToBaseUrl('admin/settings')}>Server
          Settings &gt; Global Settings</a>.
        </small>
      </div>
    </div>
    <div class={FORM_GROUP_CLASS}>
      <label for="hubServiceUrl" class={LABEL_CLASS}>Hub URL:</label>
      <div class={EDIT_AREA_CLASS}>
        <input id="hubServiceUrl" type="URL" required class={INPUT_CLASS} aria-describedby="hubServiceUrlHelp"
               disabled={ctrl.isInCloudUrl()} fn={bindString(settings.hubUrl, invalidCounter)} />
        <small id="hubServiceUrlHelp" class="form-text text-muted">
          For YouTrack InCloud without a custom domain, this setting is not configurable. Otherwise, enter the “Hub URL”
          shown at <a target="_blank" fn={ctrl.hrefRelativeToBaseUrl('admin/ring')}>Server Settings &gt; Hub
          Integration</a>.
        </small>
      </div>
    </div>
    <div class={FORM_GROUP_CLASS}>
      <label for="serviceId" class={LABEL_CLASS}>Service ID in Hub:</label>
      <div class={EDIT_AREA_CLASS}>
        <input id="serviceId" type="text" required class={INPUT_CLASS} aria-describedby="serviceIdHelp"
               fn={bindString(settings.youTrackServiceId, invalidCounter)} />
        <small id="serviceIdHelp" class={HELP_CLASS}>
          Enter the “YouTrack Service ID in Hub” shown
          at <a target="_blank" fn={ctrl.hrefRelativeToBaseUrl('admin/ring')}>Server Settings &gt; Hub
          Integration</a>.
        </small>
      </div>
    </div>
    <div class={FORM_GROUP_CLASS}>
      <div class={`${OFFSET_CLASS} ${EDIT_AREA_CLASS}`}>
        <button type="button" class="btn btn-sm btn-secondary" aria-describedby="loginHelp"
                disabled={ctrl.normalizedBaseUrl().length === 0 || ctrl.normalizedHubUrl().length === 0 ||
                    settings.youTrackServiceId().length === 0}
                onClick={() => connectSignal(null)}>Connect…</button>
        <small id="loginHelp" class={HELP_CLASS}>
          If you are not logged into YouTrack yet, this will take you to the YouTrack login page. Once logged in, you
          will be redirected back here. Please note: The URI of this web app (that is,
          “{SettingsCtrl.currentUri().toString()}”) needs to be registered in the&#32;
          <a target="_blank"
             fn={ctrl.hubRelativeToBaseUrlAndServiceId((serviceId) =>
                 `admin/hub/services/${serviceId}?tab=settings`)}>
            Hub Settings
          </a> under “Redirect URIs”. The current origin (that is, “{SettingsCtrl.currentOrigin().toString()}”) also
          needs to be added under “Allowed origins”
          at <a target="_blank" fn={ctrl.hrefRelativeToBaseUrl('admin/settings')}>Server Settings &gt; Global
          Settings</a>.
        </small>
      </div>
    </div>
  </div>;
}
