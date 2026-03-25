# ClickMagick Setup — GTH (GameTestersHub)

## Migration Summary
Migrated GTH tracking from BeMob → ClickMagick on 2026-03-24. ClickMagick handles click tracking, offer rotation, referrer blanking, and Facebook CAPI via Audience Optimization.

## Account
- **Plan**: Starter ($79/mo trial)
- **UID**: 211897
- **HID**: 2728055707
- **Username**: chris691
- **API Key**: stored in ~/Documents/permissions/clickmagick api.txt
- **API Base**: https://api.clickmagick.com/v1 (form-encoded POST, NOT JSON)
- **API Auth Header**: X-APIKEY

## Custom Domains (ssaff.link)

| Subdomain | Record Type | Content | Proxied | ClickMagick Type | Purpose |
|-----------|------------|---------|---------|-----------------|---------|
| cm.ssaff.link | CNAME | cdn.clkmc.com | Yes | Projects CDN | Tracking JS (ad blocker bypass) |
| trk.ssaff.link | A | 13.248.180.39 | Yes | Smart Links (ID: 144440) | Offer redirect with referrer blanking |
| rot.ssaff.link | A | 13.248.160.45 | Yes | Rotators (ID: 144441) | Weighted offer rotation |

**DNS**: Cloudflare (zone: ssaff.link, ID: 44b540cf0b4b6b83fbddbeb8f9e763c2)
**SSL**: Cloudflare Full + Always Use HTTPS (required for ClickMagick custom domains)
**Nameservers**: clarissa.ns.cloudflare.com, julio.ns.cloudflare.com
**Moved from Namecheap BasicDNS → Cloudflare on 2026-03-25** (ClickMagick requires Cloudflare proxy for SSL on custom domains).

## Project: GTH - SSAFF

- **Type**: Project (JS tracking on site, not redirect-based)
- **Domain**: gametestershub.com
- **Tracking Code**: TrueTracking JS on all 4 GTH pages (index, start, continue, offers)
- **CDN**: cm.ssaff.link/cmc.js (custom domain to bypass ad blockers)
- **Token**: `[cmc_vid]` — placed in HTML, replaced by tracking JS with actual visitor ID

```html
<!-- ClickMagick Click Tracking (in <head> of every GTH page) -->
<script>
  window.clickmagick_cmc = {
    uid: '211897',
    hid: '2728055707',
    cmc_project: 'GTH - SSAFF',
    vid_info: 'on',
    utm_source: 'organic',
  }
</script>
<script src='//cm.ssaff.link/cmc.js'></script>
```

## Audience Optimization (Facebook CAPI)

- **Integration**: Facebook Ads → Dataset 1635681097458226
- **Events**: Lead (Action) + Purchase (Sale)
- **Lead fires**: When quiz form submitted (cmc_goal=a via quiz.js)
- **Purchase fires**: When MaxBounty postback received → ClickMagick logs Sale → AO sends to FB
- **Token refresh**: Tokens expire ~60 days. Update in ClickMagick AO settings + Railway (superaff-agents)

## Smart Links (Offer Redirects)

Each offer has a Smart Link with `blank_referrer=true` so MaxBounty/offer sites can't see gametestershub.com as the referrer.

| Smart Link | ID | Slug | Destination |
|-----------|-----|------|-------------|
| GTH FreeCash | 2774696 | gth-freecash | MaxBounty offer 26175 (s2=[s1]) |
| GTH InboxDollars | 2774697 | gth-inbox | MaxBounty offer 6365 (s2=[s1]) |
| GTH Klink | 2774698 | gth-klink | MaxBounty offer 30346 (s2=[s1]) |

**URL format**: `trk.ssaff.link/<slug>/<sub-id1>`
**Example**: `trk.ssaff.link/gth-freecash/cmc2516938438`

The `[s1]` token in the primary_url gets replaced with the Sub-ID 1 value (cmc_vid) passed in the URL path.

## Rotator (Offer Rotation)

| Rotator | ID | Slug | Mode |
|---------|-----|------|------|
| GTH Offers | 149035 | gth-offers | Sequential (weighted) |

**URL**: `rot.ssaff.link/gth-offers/<cmc_vid>`
**Backup URL**: trk.ssaff.link/gth-freecash

### Rotator URLs (Weighted)

| Position | Name | ID | Weight | Destination Smart Link |
|----------|------|----|--------|----------------------|
| 1 | FreeCash | 3772954 | 4 (~57%) | trk.ssaff.link/gth-freecash/[s1] |
| 2 | InboxDollars | 3772955 | 2 (~29%) | trk.ssaff.link/gth-inbox/[s1] |
| 3 | Klink | 3772956 | 1 (~14%) | trk.ssaff.link/gth-klink/[s1] |

## Full Data Flow

```
1. FB Ad click → gametestershub.com?utm_source=facebook&utm_medium=cpc&...
   └── Project JS captures: fbclid, IP, UA, assigns cmc_vid
   └── [cmc_vid] token in HTML replaced with e.g. "cmc2516938438"

2. User completes quiz → ClickMagick logs Action (Lead)
   └── Audience Optimization sends Lead event to Facebook CAPI ✓

3. User clicks offer → continue.js builds rotator URL:
   rot.ssaff.link/gth-offers/cmc2516938438
                              └── cmc_vid passed as Sub-ID 1

4. Rotator picks weighted Smart Link → redirects to:
   trk.ssaff.link/gth-freecash/cmc2516938438
                                └── [s1] token forwards cmc_vid

5. Smart Link (blank_referrer=true) → redirects to MaxBounty:
   afflat3d3.com/trk/lnk/.../?o=26175&...&s2=cmc2516938438
                                            └── [s1] placed into s2 param
   Referrer is BLANK ✓

6. User converts → MaxBounty fires postback:
   clkmg.com/api/s/post/?uid=211897&s1=cmc2516938438&amt=2.50
                                   └── #S2# macro = our s2 (cmc_vid)

7. ClickMagick matches sale to visitor via cmc_vid
   └── Audience Optimization sends Purchase event to Facebook CAPI ✓
```

## MaxBounty Postback URL
```
https://www.clkmg.com/api/s/post/?uid=211897&s1=#S2#&amt=#RATE#
```
- `#S2#` = MaxBounty's s2 parameter (contains cmc_vid)
- `#RATE#` = payout amount

## Campaign ID → Brand Mapping

| Campaign ID | Offer | Brand |
|------------|-------|-------|
| 26175 | FreeCash | GTH |
| 6365 | InboxDollars | GTH |
| 30346 | Klink | GTH |
| 27707 | (reserved) | GTH |

## ClickMagick API Quick Reference

**Auth**: `X-APIKEY` header with API key value.
**Format**: Form-encoded POST (NOT JSON). Use `--data-urlencode` for URLs with & characters.

### Key Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /campaigns/projects | List Projects |
| POST | /campaigns/projects | Create Project |
| GET | /links | List Smart Links |
| POST | /links | Create Smart Link |
| PATCH | /links/{id} | Edit Smart Link |
| GET | /links/settings?id=X | Get Smart Link settings |
| GET | /rotators | List Rotators |
| POST | /rotators | Create Rotator |
| PATCH | /rotators/{id} | Edit Rotator |
| POST | /rotators/{id}/urls | Add Rotator URL |
| GET | /rotators/{id}/urls | List Rotator URLs |
| GET | /domains | List Custom Domains |
| POST | /domains | Create Custom Domain (type: "link" or "rotator") |

### Smart Link Key Parameters
- `primary_url` (required) — destination URL, supports tokens: [s1]-[s5], [clickid], [utm_source], etc.
- `blank_referrer` — "true"/"false" — hides referrer from destination
- `domain_id` — custom domain to use
- `link_slug` — URL-friendly identifier (4-20 chars)

### Rotator Key Parameters
- `rotator_mode` — "fulfillment", "spillover", "random", "sequential"
- `sequential_repeat_clicks` — "same_url" or "next_url"
- `domain_id` — custom rotator domain

### Rotator URL Key Parameters
- `url` (required) — destination, supports [s1]-[s5] tokens
- `weight` (1-10) — only for sequential rotators
- `max_clicks` / `max_clicks_daily` — cap traffic

### ClickMagick Tokens (for destination URLs)
- `[s1]`-`[s5]` — Sub-ID values from incoming URL path
- `[clickid]` — unique click identifier
- `[utm_source]`, `[utm_medium]`, `[utm_campaign]`, `[utm_term]`, `[utm_content]`
- `[country]` — visitor's country
- `[query_string]` — full query string passthrough

### CMC Parameters (for Project tracking code/URLs)
- `cmc_vid` — visitor ID for cross-domain/cross-device tracking
- `cmc_goal` — a (action/lead), e (engagement), s (sale), n (no conversion)
- `cmc_amt` — sale amount
- `cmc_ref` — unique reference per conversion type
- `cmc_strip` — "utm" or "cmc" to clean URL bar
- `cmc_project` — override project name
- `cmc_adid` — ad network ad ID (for Auto Cost)

## What ClickMagick Replaced for GTH
- BeMob (click tracking/redirect) → ClickMagick Project + Smart Links
- bemob-connect webhook (purchase CAPI sends) → ClickMagick Audience Optimization
- bemob-connect /api/lead (lead CAPI sends) → ClickMagick Action tracking
- JS-side offer rotation in continue.js → ClickMagick Rotator
- conversion-backfill.js as primary → still runs as backup

## What's Still on BeMob
- BDN and RFJ brands (until ClickMagick upgrade to Pro for unlimited FB ad accounts)

## Key URLs
- ClickMagick dashboard: https://clickmagick.com/user/campaigns/
- ClickMagick API docs: https://api.clickmagick.com/docs/
- ClickMagick KB: https://www.clickmagick.com/user/kb/
- MaxBounty dashboard: https://affiliates.maxbounty.com/dashboard
