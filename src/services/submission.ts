import * as FileSystem from 'expo-file-system';
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
    ...fields
  } = data;

  const photoFolder = `${data.heaterSerialNumber}_${data.cartridgeNumber}`;

  return {
    submittedAt:  new Date().toISOString(),
    photoFolder,

    // SharePoint destination — Power Automate reads these to know where to write
    destination: {
      siteUrl:        endpoints.sharePoint.siteUrl,
      photosLibrary:  endpoints.sharePoint.photosLibraryName,
      excelFile:      endpoints.sharePoint.excelFileName,
    },

    // All installation fields — maps 1-to-1 with Excel columns
    installation: fields,

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
