# V-Guard Hard Water Trial — Microsoft Setup Requirements

---

## 1. Prerequisites

| Requirement | Detail |
|---|---|
| Microsoft 365 account | Business Basic or higher (not personal @outlook.com) |
| Licenses needed | Power Automate (included in M365 Business), SharePoint Online, Excel Online |
| Power BI | Free Power BI Desktop (download from microsoft.com) + Power BI Pro if sharing dashboards with team |
| Admin access | You need SharePoint Site Owner or Contributor role |

---

## 2. SharePoint Site Setup

**Create a dedicated site:**
1. Go to `your-org.sharepoint.com` → **+ Create site** → **Team site**
2. Name: `VGuard Hard Water Trial`
3. Note the URL — example: `https://vguard.sharepoint.com/sites/HardWaterTrial`
4. This URL goes into `config/microsoft-endpoints.json` → `sharePoint.siteUrl`

**Create the Photos library:**
1. Inside the site → **+ New** → **Document library**
2. Name it exactly: `TrialPhotos` (must match `photosLibraryName` in config)
3. No subfolders needed — Power Automate creates them per installation

**Create the Excel file:**
1. Inside the site → **+ New** → **Excel workbook**
2. Name it exactly: `VGuard_Trial_Installations.xlsx` (must match `excelFileName` in config)
3. Open the file → rename **Sheet1** to `Installations`
4. In row 1, add these column headers **exactly** in this order (copy-paste):

```
submittedAt  installationDate  technicianName  technicianPhone  heaterSerialNumber
cartridgeNumber  waterSampleCollected  customerName  customerWhatsApp  pincode
gpsLat  gpsLng  gpsAccuracyMeters  waterSource  waterHardnessEstimate
waterQualityFeel  heaterModel  heaterCapacity  heaterWattage  heaterAgeYears
hotWaterTemperatureSetting  peoplePerDay  bathsPerDay  heaterUsagePattern
existingScaleVisualRating  additionalComments  photoFolder  frontPhotoUrl  sidePhotoUrl  scalePhotoUrl
```

5. Select all 30 headers → **Insert** → **Table** → check "My table has headers" → OK
6. Name the table `Installations` (Table Design tab → Table Name field top-left)

---

## 3. Power Automate Flow Setup

**Create the flow:**
1. Go to `make.powerautomate.com`
2. **+ Create** → **Instant cloud flow** → **When an HTTP request is received**
3. Name: `VGuard Installation Submission`

**Step 1 — HTTP Trigger (auto-created)**

- Method: POST
- After saving the flow, copy the **HTTP POST URL** → paste into `config/microsoft-endpoints.json` → `powerAutomate.installationWebhookUrl`
- Request body JSON schema — paste this so expressions work:

```json
{
  "type": "object",
  "properties": {
    "submittedAt": { "type": "string" },
    "photoFolder": { "type": "string" },
    "destination": {
      "type": "object",
      "properties": {
        "siteUrl": { "type": "string" },
        "photosLibrary": { "type": "string" },
        "excelFile": { "type": "string" }
      }
    },
    "notification": {
      "type": "object",
      "properties": {
        "notificationEmail": { "type": "string" }
      }
    },
    "installation": { "type": "object" },
    "photos": {
      "type": "object",
      "properties": {
        "front": { "type": "string" },
        "side": { "type": "string" },
        "scale": { "type": "string" }
      }
    }
  }
}
```

---

**Step 2 — Create photo folder (SharePoint)**

- Action: **SharePoint → Create new folder**
- Site Address: your SharePoint site URL
- List or Library: `TrialPhotos`
- Folder Name: `triggerBody()?['photoFolder']`

---

**Step 3 — Upload front photo**

- Action: **SharePoint → Create file**
- Site Address: your SharePoint site URL
- Folder Path: `/TrialPhotos/` + `triggerBody()?['photoFolder']`
- File Name: `front.jpg`
- File Content: `base64ToBinary(triggerBody()?['photos']?['front'])`

Repeat for **side.jpg** and **scale.jpg** (same pattern, change key and filename).

---

**Step 4 — Get photo URLs (3 actions)**

- Action: **SharePoint → Get file properties** (once per photo)
- Use the output `{Link}` field → store in a variable for each photo
- Or use the `Path` output from Create file step directly in the Excel row

---

**Step 5 — Add Excel row**

- Action: **Excel Online (Business) → Add a row into a table**
- Location: SharePoint
- Document Library: `Documents`
- File: `VGuard_Trial_Installations.xlsx`
- Table: `Installations`
- Map each column to the matching expression:

| Excel column | Expression |
|---|---|
| submittedAt | `triggerBody()?['submittedAt']` |
| installationDate | `triggerBody()?['installation']?['installationDate']` |
| technicianName | `triggerBody()?['installation']?['technicianName']` |
| technicianPhone | `triggerBody()?['installation']?['technicianPhone']` |
| heaterSerialNumber | `triggerBody()?['installation']?['heaterSerialNumber']` |
| cartridgeNumber | `triggerBody()?['installation']?['cartridgeNumber']` |
| waterSampleCollected | `triggerBody()?['installation']?['waterSampleCollected']` |
| customerName | `triggerBody()?['installation']?['customerName']` |
| customerWhatsApp | `triggerBody()?['installation']?['customerWhatsApp']` |
| pincode | `triggerBody()?['installation']?['pincode']` |
| gpsLat | `triggerBody()?['installation']?['gpsLat']` |
| gpsLng | `triggerBody()?['installation']?['gpsLng']` |
| gpsAccuracyMeters | `triggerBody()?['installation']?['gpsAccuracyMeters']` |
| waterSource | `triggerBody()?['installation']?['waterSource']` |
| waterHardnessEstimate | `triggerBody()?['installation']?['waterHardnessEstimate']` |
| waterQualityFeel | `triggerBody()?['installation']?['waterQualityFeel']` |
| heaterModel | `triggerBody()?['installation']?['heaterModel']` |
| heaterCapacity | `triggerBody()?['installation']?['heaterCapacity']` |
| heaterWattage | `triggerBody()?['installation']?['heaterWattage']` |
| heaterAgeYears | `triggerBody()?['installation']?['heaterAgeYears']` |
| hotWaterTemperatureSetting | `triggerBody()?['installation']?['hotWaterTemperatureSetting']` |
| peoplePerDay | `triggerBody()?['installation']?['peoplePerDay']` |
| bathsPerDay | `triggerBody()?['installation']?['bathsPerDay']` |
| heaterUsagePattern | `triggerBody()?['installation']?['heaterUsagePattern']` |
| existingScaleVisualRating | `triggerBody()?['installation']?['existingScaleVisualRating']` |
| additionalComments | `triggerBody()?['installation']?['additionalComments']` |
| photoFolder | `triggerBody()?['photoFolder']` |
| frontPhotoUrl | *(Link output from Step 4 — front)* |
| sidePhotoUrl | *(Link output from Step 4 — side)* |
| scalePhotoUrl | *(Link output from Step 4 — scale)* |

---

**Step 6 — Send notification email**

- Action: **Office 365 Outlook → Send an email (V2)**
- To: `triggerBody()?['notification']?['notificationEmail']`
- Subject:
  ```
  New V-Guard Install — @{triggerBody()?['installation']?['heaterSerialNumber']}
  ```
- Body (enable HTML mode):
  ```html
  <b>Technician:</b> @{triggerBody()?['installation']?['technicianName']}<br>
  <b>Phone:</b> @{triggerBody()?['installation']?['technicianPhone']}<br>
  <b>Customer:</b> @{triggerBody()?['installation']?['customerName']}<br>
  <b>WhatsApp:</b> @{triggerBody()?['installation']?['customerWhatsApp']}<br>
  <b>Heater S/N:</b> @{triggerBody()?['installation']?['heaterSerialNumber']}<br>
  <b>Cartridge:</b> @{triggerBody()?['installation']?['cartridgeNumber']}<br>
  <b>Water Hardness:</b> @{triggerBody()?['installation']?['waterHardnessEstimate']}<br>
  <b>Scale Rating:</b> @{triggerBody()?['installation']?['existingScaleVisualRating']}<br>
  <b>Water Sample Collected:</b> @{triggerBody()?['installation']?['waterSampleCollected']}<br>
  <b>Submitted:</b> @{triggerBody()?['submittedAt']}<br><br>
  <b>Photos folder:</b>
  @{triggerBody()?['destination']?['siteUrl']}/TrialPhotos/@{triggerBody()?['photoFolder']}
  ```

---

## 4. Update Config File on GitHub

After completing the above, edit `config/microsoft-endpoints.json` on the
`claude/modular-mobile-app-setup-T39Hd` branch and replace the placeholder values:

```json
"powerAutomate": {
  "installationWebhookUrl": "https://prod-xx.westeurope.logic.azure.com:443/..."
},
"notification": {
  "notificationEmail": "you@vguard.in"
},
"sharePoint": {
  "siteUrl": "https://vguard.sharepoint.com/sites/HardWaterTrial",
  "photosLibraryName": "TrialPhotos",
  "excelFileName": "VGuard_Trial_Installations.xlsx"
}
```

---

## 5. Power BI Dashboard (optional, ~30 min)

1. Download **Power BI Desktop** (free) from microsoft.com
2. **Get Data** → **SharePoint Online List** → paste your SharePoint site URL
3. Navigate to and select `VGuard_Trial_Installations.xlsx` → Table: `Installations`
4. Add these visuals:

| Visual | Fields |
|---|---|
| Map | Latitude = `gpsLat`, Longitude = `gpsLng`, Size = count of installs |
| Bar chart | Axis = `waterHardnessEstimate`, Value = count |
| Bar chart | Axis = `existingScaleVisualRating`, Value = count |
| Card | Count of `heaterSerialNumber` = total installs |
| Slicer | `technicianName` |
| Slicer | `waterSource` |
| Slicer | `pincode` |

5. **File → Publish** → Power BI service → share URL with the team

---

## 6. Go-Live Test Checklist

- [ ] Submit one test installation from the app (use a dummy heater serial)
- [ ] Check Power Automate run history — all steps green
  - `make.powerautomate.com` → My flows → VGuard Installation Submission → Run history
- [ ] Confirm `TrialPhotos/{serial}_{cartridge}/` folder exists on SharePoint with 3 images
- [ ] Confirm Excel row added to `Installations` table with all 30 columns populated
- [ ] Confirm notification email received at `notificationEmail` address
- [ ] Open Power BI Desktop, click Refresh, confirm map dot appears for the test install
- [ ] Delete test row from Excel and test folder from SharePoint before going live
