import * as FileSystem from 'expo-file-system/legacy';

export interface RemoteDriveFile {
  id: string;
  name: string;
  size: number;
  createdTime: string;
}

export interface DriveUploadResult {
  id: string;
  name: string;
  size: number;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export const GoogleDriveService = {
  /**
   * Lists all IKnowMyMoney backup files on the user's Google Drive.
   * Scoped to files created by this app: https://www.googleapis.com/auth/drive.file
   */
  async listBackups(accessToken: string): Promise<RemoteDriveFile[]> {
    const query = encodeURIComponent("name contains 'iknowmymoney_backup' and trashed = false");
    const url = `${DRIVE_API_BASE}/files?q=${query}&fields=files(id,name,size,createdTime)&orderBy=createdTime desc`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to list backups from Google Drive: ${err}`);
    }

    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      size: parseInt(f.size || '0', 10),
      createdTime: f.createdTime,
    }));
  },

  /**
   * Uploads local SQLite database file to Google Drive using multipart upload.
   */
  async uploadBackup(
    accessToken: string,
    localDbUri: string,
    fileName: string
  ): Promise<DriveUploadResult> {
    const fileInfo = await FileSystem.getInfoAsync(localDbUri);
    if (!fileInfo.exists) {
      throw new Error('Local SQLite database file does not exist.');
    }

    // Read database file in base64
    const base64Content = await FileSystem.readAsStringAsync(localDbUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const metadata = {
      name: fileName,
      mimeType: 'application/x-sqlite3',
      description: 'IKnowMyMoney automated snapshot backup',
    };

    const boundary = 'foo_bar_baz_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/x-sqlite3\r\n' +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      base64Content +
      closeDelimiter;

    const res = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Drive upload failed: ${errText}`);
    }

    const responseData = await res.json();
    return {
      id: responseData.id,
      name: responseData.name,
      size: fileInfo.size || 0,
    };
  },

  /**
   * Downloads remote backup from Google Drive and saves it to local SQLite file path.
   */
  async downloadBackup(
    accessToken: string,
    fileId: string,
    destinationUri: string
  ): Promise<void> {
    const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`;

    const downloadRes = await FileSystem.downloadAsync(url, destinationUri, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (downloadRes.status !== 200) {
      throw new Error(`Download failed with status: ${downloadRes.status}`);
    }
  },
};
