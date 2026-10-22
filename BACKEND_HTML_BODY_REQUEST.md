# Backend change request: render campaign `body` as HTML

**Endpoint:** `POST /event-partners/campaign/create-campaign`

## Problem
The email template HTML-escapes `body`. Any tag the CRM sends (`<h1 style="...">`, `<p>`, `<strong>`) shows up in the recipient's inbox as literal code, so the CRM cannot send styled emails.

## Requested change
Accept an optional boolean `isHtml` on the request.

- `isHtml: true` and `channels` includes `"email"`: insert `body` into the email template **unescaped**, and set `Content-Type: text/html`.
- `isHtml` missing or `false`: keep today's behavior (escaped text, newlines kept).
- Sanitize `body` server-side when `isHtml` is true. Allow only `p, h1-h6, strong, em, u, s, a, ul, ol, li, blockquote, hr, br, code, mark, div, img`. Allow only `style`, `href`, `src`, `alt`, `target`, `rel` attributes. Strip scripts and `on*` handlers.
- Also generate a plain-text alternative part for clients that don't render HTML.

## Example payload
```json
{
  "idempotencyKey": "campaign_...",
  "channels": ["email"],
  "recipients": { "customerIds": ["..."] },
  "title": "Summer Festival",
  "body": "<h1 style=\"text-align:center\">Header</h1><p style=\"text-align:justify\"><strong>Lorem</strong> ipsum</p>",
  "isHtml": true
}
```

## Frontend status
Already implemented, off by default. Once the backend ships this, set `VITE_CAMPAIGN_SUPPORTS_HTML=true` in `.env` and restart. The CRM will then send the exact editor styling (colors, alignment, heading sizes, spacing) and the Live Preview will show the same HTML.

## Quick interim fix (spacing only)
Your test email showed every line of the plain-text body joined on one line, which means the template collapses newlines. Escape the body, then wrap it in `<div style="white-space:pre-wrap">...</div>` (or convert `\n` to `<br>`). This lets the current plain-text output keep its paragraph breaks and bullets. Colors, alignment and heading sizes still need `isHtml` above.
