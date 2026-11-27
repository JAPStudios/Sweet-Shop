# Upstream source assessment

Review date: 2026-11-26

Destination: https://github.com/JAPStudios/Sweet-Shop

Requested upstream organisations:
- https://github.com/orgs/amazon-archives/repositories
- https://github.com/orgs/AuroraOSS/repositories
- https://github.com/orgs/f-droid/repositories
- https://github.com/orgs/hellofresh/repositories
- https://github.com/orgs/M-China/repositories

## Scope and access

The organisation inventories previously returned 258 repositories for amazon-archives, 14 for AuroraOSS, 15 for f-droid, 132 for hellofresh and 2 for M-China. This is a relevance assessment of selected repositories, not a claim that every source file in all 421 repositories has been audited.

The authenticated GitHub connection has read access, but not push permission, to the upstream repositories. JAPStudios/Sweet-Shop is writable. Source material can therefore be inspected and, where its licence permits, adapted or imported into the destination repository; commits cannot be pushed into the five upstream organisations.

## Repositories with useful marketplace or service patterns

### amazon-archives/serverless-retail-workshop

Repository: https://github.com/amazon-archives/serverless-retail-workshop

This is a sample retail shop with frontend and backend components. Its README identifies it as a sample shop, and its LICENSE grants broad reuse under the terms printed in that file. The application is an old Java 8 / Spring Boot 2.0.5 / Gradle project using DynamoDB. Its order model and controller are incomplete, and its basket representation is too simple for Digital Pantry's verified products, multiple sellers, seller-specific packages, inventory and consolidated delivery.

Relevance: this is the closest direct retail starting point in the inspected Amazon archive. Its storefront, basket, retail service boundaries and persistence patterns are useful source material. The order and basket implementation must be completed and modernised rather than treated as finished marketplace functionality.

### AuroraOSS/AuroraStore

Repository: https://github.com/AuroraOSS/AuroraStore

AuroraStore is an Android application store client. Its README describes search and download, product-detail information, screenshots, reviews, updates, download management, manual versions and update blacklisting. It also states that it acts as a client for Google Play content rather than owning or licensing the applications displayed. The repository is GPL-3.0.

Relevance: the fact that its catalogue contains applications rather than physical goods does not make its store workflows irrelevant. Search, item-detail presentation, version history, download queues, update controls and catalogue browsing are useful patterns for Digital Pantry's product discovery, seller-submitted product details, order tracking and mobile experience. Its Android-specific code is not itself a web marketplace or physical-goods fulfilment backend. Any direct code reuse must comply with GPL-3.0, including applicable source and distribution obligations.

### f-droid/repomaker and f-droid/fdroidserver

Repositories:
- https://github.com/f-droid/repomaker
- https://github.com/f-droid/fdroidserver

Repomaker's README expressly describes server deployment with multi-user functionality. Its source includes user-owned repository records, access checks, product/app submission forms, media and file uploads, repository storage abstractions and publish operations. fdroidserver provides repository metadata generation, validation, signing and deployment workflows. The reviewed source is AGPL-3.0.

Relevance: these are especially useful architectural references for organisation and individual seller accounts, seller-owned listing collections, private submissions, review and verification queues, controlled publication, signed catalogue metadata and publishing history. The repository being an application store is not a reason to discard those patterns: the same repository and publishing concepts can be adapted to physical-goods listings. Direct reuse of AGPL-3.0 code requires an explicit licence-compliance decision and corresponding source-availability obligations when the covered software is conveyed or made available over a network under the licence.

### hellofresh/braintree-go

Repository: https://github.com/hellofresh/braintree-go

This is an MIT-licensed Go client for Braintree. Its README describes it as unofficial and documents an older Go compatibility range and missing advanced features.

Relevance: it is a payment-provider client reference, not a financial institution, not Butter Bank and not an income-recognition system. Its request/response and payment-operation patterns may be informative if Braintree is ever selected as a payment provider. It should not be represented as an implementation of Butter Bank or assumed to be the payment architecture Digital Pantry requires.

### M-China/mcd-mcp-server

Repository: https://github.com/M-China/mcd-mcp-server
English README: https://github.com/M-China/mcd-mcp-server/blob/main/README_EN.md

The README describes a McDonald's China service interface covering McDelivery ordering, in-store pickup, group meals, points-redemption vouchers and related service scenarios. It is specific to McDonald's China and its published service is limited to mainland China, excluding Hong Kong, Macau and Taiwan. The README describes its intended use as non-commercial and restricts commercial sale, paid distribution and monetisation without written authorisation. A separate LICENSE file was not found at the checked repository path.

Relevance: its multi-step ordering, address selection, store selection, pickup/delivery and order-status tool boundaries are useful service-integration references for the UnterSous workflow. A charitable or not-for-profit purpose does not, by itself, establish whether a particular use meets the repository's non-commercial terms; equally, the README does not establish that every not-for-profit use is commercial. No conclusion about Digital Pantry's legal classification is made here. Until permission and applicable terms are established, use the documented service patterns as a reference and do not copy or distribute its code.

### M-China/mcd-developer-innovation-challenge

Repository: https://github.com/M-China/mcd-developer-innovation-challenge

This is a developer challenge repository. It may contain examples relevant to the service ecosystem, but the inspected material does not establish a general marketplace module. Its contents require separate source-level review before reuse.

## How these sources map to Digital Pantry

| Digital Pantry capability | Relevant upstream material |
|---|---|
| Retail storefront, basket and order domain | amazon-archives/serverless-retail-workshop |
| Mobile catalogue, product details, downloads/updates as workflow analogies | AuroraOSS/AuroraStore |
| Individual and organisation-owned collections, submission and publishing controls | f-droid/repomaker |
| Catalogue metadata, validation, signing and controlled deployment | f-droid/fdroidserver |
| Payment-provider client patterns, only if a compatible provider is selected | hellofresh/braintree-go |
| Address selection, location/store selection, multi-step ordering and pickup/delivery service boundaries | M-China/mcd-mcp-server |

## Import, adaptation and verification status

- The source organisations are independently maintained projects, not one unified marketplace codebase.
- No upstream source files have yet been imported into JAPStudios/Sweet-Shop.
- The strongest implementation candidates are the Amazon retail workshop for retail foundations and F-Droid Repomaker/server for seller-owned repositories, submission, moderation and publication workflows.
- AuroraStore is relevant as an application-store client and catalogue-workflow reference; it should not be dismissed merely because its listed products are applications.
- M-China's documented order and fulfilment workflows are relevant as service-integration references. Code reuse remains subject to its published terms and any permission required.
- The HelloFresh Braintree client is relevant only to a possible payment-provider implementation, not to Butter Bank.
- No candidate is a complete implementation of Digital Pantry. Imported or adapted code must be reviewed, integrated with the actual application architecture, tested and recorded with its source, licence, notices and modifications.
- The earlier review's blanket descriptions of AuroraStore and F-Droid as irrelevant to a goods marketplace, and its categorical treatment of charitable use of M-China code, were too broad and are corrected by this assessment.
