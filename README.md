# GameTestersHub

Lead generation site for game testers. Landing page + quiz funnel → MailerLite + Facebook CAPI.

## Setup

### Required Credentials

Before deploying, you need:

1. **Facebook Pixel ID** - Create in Business Manager (GTH_FB_PIXEL_ID)
2. **Facebook Access Token** - For CAPI (GTH_FB_ACCESS_TOKEN)
3. **BeMob Campaign URL** - Your redirect URL with tracking
4. **MailerLite Group ID** - For GameTestersHub group (MAILERLITE_GROUP_ID_GAMETESTERSHUB)

### Supabase Environment Variables

Add these to your remote-opportunity-hub Supabase project:

```
MAILERLITE_GROUP_ID_GAMETESTERSHUB=<your-group-id>
GTH_FB_PIXEL_ID=<your-pixel-id>
GTH_FB_ACCESS_TOKEN=<your-access-token>
```

### Frontend Configuration

Update these values in `tracking.js`:
- `FB_PIXEL_ID` - Your Facebook Pixel ID

Update these values in `quiz.js`:
- `REDIRECT_URL` - BeMob campaign URL

### Deployment

```bash
vercel
```

Or connect to Vercel via GitHub for auto-deploys.

## Architecture

```
Facebook Ad (fbclid) → Landing Page → Quiz (5 questions) → Contact Form
                                                              ↓
                                            Supabase Edge Function
                                                    ↓
                                    MailerLite + Conversion Bridge (FB CAPI)
                                                    ↓
                                            Redirect to BeMob → MaxBounty
```

## MailerLite Fields

- **Group**: GameTestersHub
- **Tag**: games
- **Custom Fields**: uuid, fbc
- **Native Fields**: first_name, last_name, email, phone, zip
