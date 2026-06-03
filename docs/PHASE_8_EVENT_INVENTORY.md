# Phase 8 Event Inventory

| event_name | trigger | location | purpose | privacy |
|---|---|---|---|---|
| `cta_find_room_click` | User clicks primary find-room CTA | Homepage header/hero/final/mobile, landing pages | Measure renter intent and CTA CTR | No PII |
| `cta_post_room_click` | User clicks post-room CTA | Homepage header/hero/final/mobile, landing pages | Measure landlord acquisition intent | No PII |
| `cta_room_detail_click` | User clicks room detail card | Homepage, landing pages, related rooms | Measure room detail engagement | Room slug/title only |
| `search_submit` | User submits search form | Homepage hero search | Measure search demand by district/price/area/keyword | Whitelisted fields only; no email/phone/password/token |
| `geo_near_me_radius_select` | User selects nearby radius | Near-me module | Measure local search radius preference | Radius only |
| `geo_near_me_location_request` | User clicks current location | Near-me module | Measure GPS search intent | Does not send coordinates |
| `geo_near_me_result_click` | User opens nearby result | Near-me module | Measure near-me result intent | URL only; no exact coordinates from event payload |
| `seo_landing_view` | Landing page renders client-side | SEO landing page | Measure organic landing engagement | Page path/title/location only |
| `landing_room_click` | User clicks room on landing page | SEO landing page room cards | Measure SEO → room conversion | Room slug/title only |
| `room_view` | Room detail renders client-side | Room detail page | Measure room detail views | Room slug/district/ward only |
| `contact_click` | User clicks phone CTA | Room detail page | Measure lead/contact conversion | No phone number in payload |
| `directions_click` | User clicks directions CTA | Room detail page | Measure map/direction intent | No coordinates in payload |
| `related_room_click` | User clicks related room | Room detail related section | Measure internal linking and continued journey | Room slug/title only |
| `landlord_login_success` | Login API succeeds in client form | Login page | Measure landlord/user login conversion | No identifier/password/token |
| `landlord_room_form_submit` | Landlord submits create/edit form | Landlord room form | Measure create/edit intent | Mode only |
| `landlord_room_create_success` | Create room API succeeds | Landlord room form | Measure successful room creation | Returned room id not sent |
| `landlord_room_edit_success` | Edit room API succeeds | Landlord room form | Measure successful room edit/publish update path | Returned room id not sent |
| `client_error` | Client-side tracked action catches error | Login/room form/near-me | Measure UX errors | Error category/message only, truncated |

## Notes

- GA4 is enabled only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` exists.
- Microsoft Clarity is enabled only when `NEXT_PUBLIC_CLARITY_PROJECT_ID` exists.
- Google Search Console verification uses `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` through Next.js metadata.
- No Database Schema, Prisma Models, Auth, RBAC, Search Engine Logic, or Monetization Architecture changes are required.
