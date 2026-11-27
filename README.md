# Sweet Shop: Digital Pantry

Sweet Shop: Digital Pantry is a marketplace for essential goods and other seller-listed products. Sellers submit listings as private drafts. A listing becomes public only after an authorised reviewer confirms legitimacy, completes testing and records the evidence. Every Digital Pantry user is a union member.

Sweet Shop: Digital Pantry operates under Sweet Shop: Survival Service, which is owned by the not-for-profit organisation HeLLP.

## Current application workflows

- Public catalogue and product detail pages show verified listings only.
- Sellers create a shop profile with a private pickup address, submit listings and import CSV exports by file upload or paste, using normalized fields or common Shopify, Etsy, Wix and Squarespace product headers. Digital Pantry charges no listing fee.
- Product categories are seller-defined. Browse filters include categories present in verified listings alongside suggested categories.
- Listings require a description, price and either available stock or a stated made-to-order lead time. Provenance details are optional. Incarcerated-artisan listings require a positive compensation rate.
- Reviewers must record testing and legitimacy checks before approval. Sellers cannot update verification fields or approve their own listings.
- The basket stores selected products and quantities.
- An administrator can configure a delivery rate schedule. Sellers with the same normalized pickup address count as one pickup location.
- UnterSous is responsible for pickup and delivery. The Digital Pantry app is not yet connected to UnterSous.
- Organisation accounts record a worker roster. Each worker keeps their own account and can list on the organisation's behalf only while their membership is active; revoking a membership removes that ability immediately. JaMail has not verified any identity or employment status, so organisation accounts stay pending.
- The affordability page holds a buyer's income assessment. No assessment exists, so no adjustment is applied; any percentage would come only from a Butter Bank response.
- The connections page (administrators) lists the credentials and API surface JaMail, Butter Bank and UnterSous each need.
- The catalogue starts empty. No generated sample sellers, organisations, products or orders are included.

## Not connected or configured

- JaMail authentication and organisation verification. Organisation memberships and their revocation are recorded and enforced by this app, but JaMail does not confirm identity or employment, and no employment-end signal reaches the app automatically.
- Butter Bank verification and income-sensitive pricing.
- Direct API imports from external storefronts or content services; the current importer accepts CSV exports with common product headers or normalized fields.
- Payment collection, seller payout routing and actual maker compensation payments.
- Delivery rate amounts; an administrator must configure them.

Checkout is closed: Base44 currently reports that its Wix Payments connection is unavailable for this account or country. This is not evidence that Wix Payments is unsupported in the United States. Checkout creates no order, no shipment and no stock change until a payment can be confirmed. No default fees, income thresholds or discounts are invented. Maker compensation fields record an intended per-item rate, not proof that payment has been made.

## Development

This is a Base44 TanStack Start application using React 19, file-based routes, server functions and Base44 entities.

```bash
npm install
base44 login
base44 link
base44 dev
npm run build
```

Publish through the Base44 app editor after the remaining integrations, delivery rates and payment workflow have been configured and tested.
