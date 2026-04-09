import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { InstallationData } from '../types';
import endpoints from '../../config/microsoft-endpoints.json';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubmissionResult {
  success: boolean;
  error?: string;
}

interface PhotoSet {
  front:  string | null;
  side:   string | null;
  scale:  string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function uriToBase64(uri: string | null): Promise<string | null> {
  if (!uri) return null;
  try {
    if (Platform.OS === 'web') {
      // On web, photo URIs are blob URLs — fetch and convert to base64
      const res   = await fetch(uri);
      const buf   = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = '';
      bytes.forEach((b) => { bin += String.fromCharCode(b); });
      return btoa(bin);
    }
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch {
    return null;
  }
}

// ─── Payload builder ──────────────────────────────────────────────────────────

export function buildPayload(data: InstallationData, photos: PhotoSet) {
  // Strip local URIs — photos go as base64, folder name is the reference
  const {
    frontPhotoUri,
    sidePhotoUri,
    scalePhotoUri,
    gpsLat,
    gpsLng,
    peoplePerDay,
    bathsPerDay,
    heaterAgeYears,
    waterSampleCollected,
    cartridgeBatchCode,   // not an Excel column — excluded from payload
    ...rest
  } = data;

  // Folder name: customerName_pincode (spaces and special chars stripped)
  const safeName    = data.customerName.replace(/[^a-zA-Z0-9]/g, '');
  const photoFolder = `${safeName}_${data.pincode}`;

  // Normalise types for Excel / Power BI:
  //  • gpsLat / gpsLng       → float   (Power BI map visual requires numbers)
  //  • peoplePerDay / bathsPerDay → integer
  //  • heaterAgeYears        → integer (e.g. 3, not "1-3 years")
  //  • waterSampleCollected  → "Yes"/"No" string (readable in Excel)
  const installation = {
    ...rest,
    waterSampleCollected: waterSampleCollected ? 'Yes' : 'No',
    gpsLat:        gpsLat        ? parseFloat(gpsLat)           : null,
    gpsLng:        gpsLng        ? parseFloat(gpsLng)           : null,
    peoplePerDay:  peoplePerDay  ? parseInt(peoplePerDay, 10)   : null,
    bathsPerDay:   bathsPerDay   ? parseInt(bathsPerDay,  10)   : null,
    heaterAgeYears: heaterAgeYears ? parseInt(heaterAgeYears, 10) || null : null,
  };

  return {
    submittedAt:  new Date().toISOString(),
    photoFolder,

    // SharePoint destination — Power Automate reads these to know where to write
    destination: {
      siteUrl:        endpoints.sharePoint.siteUrl,
      photosLibrary:  endpoints.sharePoint.photosLibraryName,
      excelFile:      endpoints.sharePoint.excelFileName,
    },

    // Notification — Power Automate sends a summary email to this address after writing the Excel row
    notification: {
      notificationEmail: (endpoints as any).notification?.notificationEmail ?? '',
    },

    // All installation fields — maps 1-to-1 with Excel columns
    installation,

    // Base64 photos — Power Automate decodes and uploads to:
    // {photosLibrary}/{photoFolder}/front.jpg  |  side.jpg  |  scale.jpg
    photos: {
      front:  photos.front,
      side:   photos.side,
      scale:  photos.scale,
    },
  };
}

// ─── Main submit function ─────────────────────────────────────────────────────

export async function submitInstallation(
  data: InstallationData,
): Promise<SubmissionResult> {
  const webhookUrl = endpoints.powerAutomate.installationWebhookUrl;
  const isConfigured = webhookUrl && !webhookUrl.startsWith('REPLACE_');

  // Encode photos in parallel
  const [front, side, scale] = await Promise.all([
    uriToBase64(data.frontPhotoUri),
    uriToBase64(data.sidePhotoUri),
    uriToBase64(data.scalePhotoUri),
  ]);

  const payload = buildPayload(data, { front, side, scale });

  // Dev mode — webhook not yet configured
  if (!isConfigured) {
    console.log(
      '[Submission] Webhook not configured.\n' +
      'Edit config/microsoft-endpoints.json and replace REPLACE_WITH_* values.\n' +
      'Payload preview:',
      JSON.stringify(payload, (k, v) =>
        // Truncate base64 in logs so they're readable
        (k === 'front' || k === 'side' || k === 'scale') && typeof v === 'string'
          ? `[base64 ~${Math.round(v.length / 1024)}KB]`
          : v,
        2,
      ),
    );
    return { success: true };
  }

  // Live submission
  try {
    const res = await fetch(webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      return { success: false, error: `Power Automate responded with HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Network error — check connectivity' };
  }
}
