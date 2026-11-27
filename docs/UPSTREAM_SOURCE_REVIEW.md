# Upstream source review

Review date: 2026-11-26

Destination: https://github.com/JAPStudios/Sweet-Shop

Requested upstream organisations:
- https://github.com/orgs/amazon-archives/repositories
- https://github.com/orgs/AuroraOSS/repositories
- https://github.com/orgs/f-droid/repositories
- https://github.com/orgs/hellofresh/repositories
- https://github.com/orgs/M-China/repositories

## Screening coverage

The repository inventory returned 258 repositories for amazon-archives, 14 for AuroraOSS, 15 for f-droid, 132 for hellofresh and 2 for M-China. Repository names and descriptions were screened for marketplace, retail, seller, order, checkout, payment, delivery and package-repository relevance. Selected candidates were then inspected at README, licence and source-file level.

This was a targeted relevance screen, not a complete line-by-line source audit of every repository, dependency, commit or branch in all five organisations. It does not establish that every repository has been examined in full.

The five organisations do not publish one unified marketplace codebase. Their repositories are independent projects with different languages, architectures, purposes and licences. No source files from the five organisations have been imported into this repository as of this review.

## Candidate findings

### amazon-archives/serverless-retail-workshop

- Repository: https://github.com/amazon-archives/serverless-retail-workshop
- Archived sample retail shop with frontend and backend components; its tree contains 398 paths.
- The repository's own LICENSE grants broad reuse under a modified MIT licence.
- The backend is an old Java 8 / Spring Boot 2.0.5 / Gradle application using DynamoDB. The sample's order model is empty and its order controller contains placeholder behaviour. The basket model stores item strings rather than a complete verified product, seller, price and inventory model.
- Technical finding: it is a historical retail reference. Direct use as a production marketplace backend would require framework modernisation, security review, a complete domain model and working order behaviour.

### amazon-archives/swa-sample-seller

- Repository: https://github.com/amazon-archives/swa-sample-seller
- A Java/Maven sample storefront for Subscribe with Amazon (SWA) and Login with Amazon (LWA), focused on subscription status rather than independent seller listings or multi-seller retail.
- Its README explicitly warns that the sample should be deployed only locally because visitors would have access to confidential seller-account data.
- The repository includes an Apache-2.0 LICENSE.txt. Its dependency manifest includes old libraries, including Jackson Databind 2.7.4 and RESTEasy 3.0.19.Final.
- Technical finding: this is a vendor-specific subscription storefront example, not a general seller dashboard or multi-seller checkout. Its local-only warning and dated dependencies are material limitations.

### amazon-archives/realworld-serverless-application

- Repository: https://github.com/amazon-archives/realworld-serverless-application
- Archived 363-path AWS Serverless Application Repository case study; Apache-2.0.
- It demonstrates AWS serverless architecture and application-repository patterns, not the seller marketplace, product verification, income-adjusted access or multi-seller delivery model.
- Technical finding: infrastructure reference; no marketplace module identified in the inspected material.

### amazon-archives/aws-service-catalog-react-components

- Repository: https://github.com/amazon-archives/aws-service-catalog-react-components
- MIT No Attribution React components for displaying, provisioning and terminating products in AWS Service Catalog.
- Technical finding: its word "products" refers to provisionable AWS cloud services, not goods sold by marketplace sellers. It is not a Digital Pantry catalogue or checkout component.

### AuroraOSS/AuroraStore

- Repository: https://github.com/AuroraOSS/AuroraStore
- GPL-3.0 Android client for searching and downloading applications from Google Play. Its README states that it does not own, license or distribute the applications it displays.
- Technical finding: an Android app-discovery and download client, not a marketplace for physical goods or independent seller products.

### f-droid/repomaker and f-droid/fdroidserver

- Repositories: https://github.com/f-droid/repomaker and https://github.com/f-droid/fdroidserver
- Repomaker is an application-repository publishing tool; fdroidserver manages F-Droid application repositories. Their source is AGPL-3.0.
- Technical finding: software-package repository infrastructure, not physical-goods seller catalogues or fulfilment systems. Adapting AGPL-3.0 server-side code would carry licence obligations that need to be reviewed and accepted.

### hellofresh/braintree-go

- Repository: https://github.com/hellofresh/braintree-go
- MIT-licensed third-party Go client for Braintree. Its README documents support for Go 1.7 through 1.12 and describes it as an unofficial client with missing advanced features.
- Technical finding: this is not a financial-institution integration. It is an old client for a specific payment provider and does not implement Digital Pantry's income recognition or checkout model.

### M-China/mcd-mcp-server

- Repository: https://github.com/M-China/mcd-mcp-server
- The README describes McDonald's China ordering, pickup, group-meal and rewards tools. Its stated usage terms restrict copying and use to non-commercial purposes and prohibit commercial sale, paid distribution or monetisation without written authorisation.
- Legal finding: the published terms do not authorise importing it into a commercialised or revenue-generating distribution without written permission. Its subject matter is also a McDonald's-specific ordering service, not a general marketplace.

### M-China/mcd-developer-innovation-challenge

- Repository: https://github.com/M-China/mcd-developer-innovation-challenge
- A McDonald's China developer contest repository.
- Technical finding: the inspected repository material does not identify a reusable general marketplace component.

## Current import and verification status

- No upstream source files have been imported from the five organisations.
- No dependency from these candidates has been added to Sweet-Shop.
- No upstream component has yet been adapted, tested or merged.
- The inspected Amazon retail workshop is incomplete and uses an obsolete stack; the other inspected candidates address different product categories, vendor-specific services or software distribution. The McDonald's China server's published terms expressly restrict commercial reuse without written authorisation.
- The inventory screen does not substitute for a complete source and dependency audit. Further repository-specific review requires inspection of the relevant source trees, manifests, licence files, notices, histories and dependency licences.

