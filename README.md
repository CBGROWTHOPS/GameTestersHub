# GameTestersHub

Lead generation site for game testers. Landing page + quiz funnel → MailerLite + Facebook CAPI.

## Setup

### Required Credentials

Before deploying, you need:

1. **Facebook Pixel ID** - Create in Business Manager
2. **BeMob Campaign URL** - Your redirect URL with tracking
3. **Supabase Edge Function URL** - Your submit-lead endpoint

### Configuration

Update these values in `tracking.js`:
- `FB_PIXEL_ID` - Your Facebook Pixel ID

Update these values in `quiz.js`:
- `SUPABASE_FUNCTION_URL` - Your submit-lead endpoint
- `REDIRECT_URL` - BeMob campaign URL (fallback)

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
