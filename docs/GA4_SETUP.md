# GTH — Google Analytics 4 Setup

## Property Details

| Field | Value |
|-------|-------|
| Account | ssaff (`accounts/389166335`) |
| Property | GTH (`properties/530374640`) |
| Data Stream | GTH Web (`dataStreams/14275913340`) |
| Measurement ID | `G-5SNR88E3EX` |
| Measurement Protocol Secret | TBD (needs data collection acknowledgement in browser) |
| OAuth Credentials | `~/Documents/permissions/internal/ga4_oauth.json` |

## Tag Installation

gtag.js snippet in `src/layouts/BaseLayout.astro` (lines 17-23), loads before ClickMagick.

## Configuration

### Data Retention
- Event data: 14 months
- User data: 14 months
- Reset on new activity: yes

### Enhanced Measurement
All enabled by default (scrolls, outbound clicks, forms, etc.)

### Browser-Only Settings (need manual toggle)
- **Google Signals**: Admin > Data Settings > Data Collection > toggle on
- **Referral exclusions**: Admin > Data Streams > GTH Web > Configure tag settings > List unwanted referrals:
  - `ssaff.link`, `rot.ssaff.link`, `trk.ssaff.link`, `cm.ssaff.link`
- **Data collection acknowledgement**: needed for Measurement Protocol secret

## Custom Events

| Event | Fires When | Key Params | File |
|-------|-----------|------------|------|
| `funnel_step_complete` | User selects quiz option (steps 1-5) | `funnel_name`, `step_number`, `step_name`, `step_value` | `public/funnel/quiz.js` |
| `generate_lead` | Form submitted on step 6 | `funnel_name`, `game_preference`, `platform`, `availability`, `experience`, `motivation`, `event_id` | `public/funnel/quiz.js` |
| `offer_click` | User clicks "Start Getting Paid" on continue page | `offer_source`, `cta_text` | `public/funnel/continue.js` |

## Key Events (Conversions)

- `generate_lead` — once per event
- `offer_click` — once per event

## Custom Dimensions (Event-Scoped)

| Parameter | Display Name |
|-----------|-------------|
| `game_preference` | Game Preference |
| `platform` | Gaming Platform |
| `availability` | Weekly Availability |
| `experience` | Testing Experience |
| `motivation` | Primary Motivation |
| `funnel_name` | Funnel Name |
| `step_name` | Funnel Step Name |
| `step_value` | Funnel Step Value |
| `offer_source` | Offer Source |
| `cta_text` | CTA Text |

## Custom Metrics

| Parameter | Display Name | Unit |
|-----------|-------------|------|
| `step_number` | Funnel Step Number | Standard (1-6) |

## User Properties

Set on lead submission, persist across sessions:

| Property | Display Name |
|----------|-------------|
| `user_game_preference` | User Game Preference |
| `user_platform` | User Gaming Platform |
| `user_availability` | User Availability |

## Audiences

| Audience | Description | Duration |
|----------|------------|----------|
| Quiz Dropoff - Started But No Lead | Started quiz but never submitted form | 30 days |
| Leads Without Offer Click | Submitted form but never clicked offer CTA | 30 days |
| Offer Clickers | Clicked "Start Getting Paid" — highest value | 90 days |

## Funnel Flow

```
Homepage (/) → "Take the Quiz" CTA
  ↓
/start Step 1: Game preference → funnel_step_complete (step 1)
  ↓
/start Step 2: Platform → funnel_step_complete (step 2)
  ↓
/start Step 3: Availability → funnel_step_complete (step 3)
  ↓
/start Step 4: Experience → funnel_step_complete (step 4)
  ↓
/start Step 5: Motivation → funnel_step_complete (step 5)
  ↓
/start Step 6: Contact form → generate_lead + user properties set
  ↓
/continue (scanning animation, 7.3s) → offer_click
  ↓
ClickMagick rotator (rot.ssaff.link/gth-offers)
```

## Other Tracking on GTH

| System | Purpose |
|--------|---------|
| Facebook Pixel (`1635681097458226`) | Ad optimization, Lead event via CAPI |
| ClickMagick (project "GTH - SSAFF") | Click tracking, offer rotation, Facebook CAPI |

## Setup Date
2026-03-29
