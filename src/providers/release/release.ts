import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppProvider } from '../../providers/app/app';

@Injectable()
export class ReleaseProvider {
  private LATEST_RELEASE_URL: string;
  private appVersion: string;

  constructor(private http: HttpClient, private app: AppProvider) {
    this.LATEST_RELEASE_URL =
      'https://api.github.com/repos/bitpay/copay/releases/latest';
    this.appVersion = this.app.info.version;
  }

  public getCurrentAppVersion() {
    return this.appVersion;
  }

  public getLatestAppVersion() {
    return this.http.get(this.LATEST_RELEASE_URL).map(x => x['tag_name']);
  }

  private verifyTagFormat(tag: string) {
    var regex = /^v?\d+\.\d+\.\d+$/i;
    return regex.exec(tag);
  }

  private formatTagNumber(tag: string) {
    var formattedNumber = tag.replace(/^v/i, '').split('.');
    return {
      major: +formattedNumber[0],
      minor: +formattedNumber[1],
      patch: +formattedNumber[2]
    };
  }

  public checkForUpdates(latestVersion: string, currentVersion?: string) {
    if (!currentVersion) currentVersion = this.appVersion;

    let result = {
      updateAvailable: null,
      availabeVersion: null,
      error: null
    };

    if (!this.verifyTagFormat(currentVersion))
      result.error =
        'Cannot verify the format of version tag: ' + currentVersion;
    if (!this.verifyTagFormat(latestVersion))
      result.error =
        'Cannot verify the format of latest release tag: ' + latestVersion;

    let current: any = this.formatTagNumber(currentVersion);
    let latest: any = this.formatTagNumber(latestVersion);

    if (
      latest.major < current.major ||
      (latest.major == current.major && latest.minor <= current.minor)
    )
      return result;
    else {
      result.updateAvailable = true;
      result.availabeVersion = latestVersion;
      return result;
    }
  }
}
