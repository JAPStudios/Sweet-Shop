# Upstream source review

Review date: 2026-11-26

Destination: https://github.com/JAPStudios/Sweet-Shop

Requested upstream organisations:
- https://github.com/orgs/amazon-archives/repositories
- https://github.com/orgs/AuroraOSS/repositories
- https://github.com/orgs/f-droid/repositories
- https://github.com/orgs/hellofresh/repositories
- https://github.com/orgs/M-China/repositories

## Screening result

The GitHub repository search returned 258 repositories for amazon-archives, 14 for AuroraOSS, 15 for f-droid, 132 for hellofresh and 2 for M-China. The inventory was screened by repository names/descriptions for marketplace, retail, seller, order, checkout, payment, delivery and package-repository relevance, then selected candidates were inspected at README, licence and source-file level. This is a targeted relevance screen, not a complete line-by-line source audit of every repository and dependency in all five organisations.

These organisations do not publish one unified marketplace codebase. Their repositories are independent projects with different languages, architectures, purposes and licences. No source files from the five organisations have been imported into this repository.

## Candidate findings

### amazon-archives/serverless-retail-workshop

- Repository: https://github.com/amazon-archives/serverless-retail-workshop
- Archived sample retail shop with frontend and backend components; its tree contains 398 paths.
- The repository's own LICENSE grants broad reuse under a modified MIT licence.
- The backend is an old Java 8 / Spring Boot 2.0.5 / Gradle application using DynamoDB. The sample's order model is empty and its order controller contains placeholder behaviour. The basket model stores item strings rather than a complete verified product, seller, price and inventory model.
- Assessment: useful historical reference for basket/order concepts, but not safe to adopt as the marketplace backend. It requires modernisation, security work and a new domain model before any production use.

### amazon-archives/swa-sample-seller

- Repository: https://github.com/amazon-archives/swa-sample-seller
- A Java/Maven sample storefront for Subscribe with Amazon (SWA) and Login with Amazon (LWA), focused on subscription status rather than independent seller listings or multi-seller retail.
- Its README explicitly warns that the sample should be deployed only locally because visitors would have access to confidential seller-account data.
- The repository includes an Apache-2.0 LICENSE.txt. Its dependency manifest includes old libraries, including Jackson Databind 2.7.4 and RESTEasy 3.0.19.Final.
- Assessment: a useful historical example of a vendor-specific subscription storefront, but not a reusable Digital Pantry seller dashboard or checkout. Its local-only warning, vendor-specific design and dated dependencies make direct adoption inappropriate.

### amazon-archives/realworld-serverless-application

- Repository: https://github.com/amazon-archives/realworld-serverless-application
- Archived 363-path AWS Serverless Application Repository case study; Apache-2.0.
- It demonstrates AWS serverless architecture and application-repository patterns, not the seller marketplace, product verification, income-adjusted access or multi-seller delivery model.
- Assessment: infrastructure reference only; no source imported.

### amazon-archives/aws-service-catalog-react-components

- Repository: https://github.com/amazon-archives/aws-service-catalog-react-components
- MIT No Attribution React components for displaying, provisioning and terminating products in AWS Service Catalog.
- Assessment: its word "products" refers to provisionable AWS cloud services, not goods sold by marketplace sellers. It is not a Digital Pantry catalogue or checkout component; no source imported.

### AuroraOSS/AuroraStore

- Repository: https://github.com/AuroraOSS/AuroraStore
- GPL-3.0 Android client for searching and downloading applications from Google Play. Its README states that it does not own, license or distribute the applications it displays.
- Assessment: an Android app-discovery client, not a marketplace for physical goods or independent seller products. No source imported.

### f-droid/repomaker and f-droid/fdroidserver

- Repositories: https://github.com/f-droid/repomaker and https://github.com/f-droid/fdroidserver
- Repomaker is an application-repository publishing tool; fdroidserver manages F-Droid application repositories. Their source is AGPL-3.0.
- Assessment: software-package repository infrastructure, not physical-goods seller catalogues or fulfilment systems. AGPL obligations would also need to be deliberately accepted before adapting server-side code. No source imported.

### hellofresh/braintree-go

- Repository: https://github.com/hellofresh/braintree-go
- MIT-licensed third-party Go client for Braintree. Its README documents support for Go 1.7 through 1.12 and describes it as an unofficial client with missing advanced features.
- Assessment: it is not a financial-institution integration and would introduce an unrelated payment provider. It is also obsolete for a modern Go implementation. No source imported.

### M-China/mcd-mcp-server

- Repository: https://github.com/M-China/mcd-mcp-server
- The README describes McDonald's China ordering, pickup, group-meal and rewards tools. Its stated usage terms restrict copying and use to non-commercial purposes and prohibit commercial sale, paid distribution or monetisation without written authorisation.
- Assessment: unrelated to Digital Pantry's own catalogue and checkout; the published terms do not permit importing it for this marketplace without written permission. No source imported.

### M-China/mcd-developer-innovation-challenge

- Repository: https://github.com/M-China/mcd-developer-innovation-challenge
- A McDonald's China developer contest repository, not a reusable marketplace product.
- Assessment: no relevant source to import.

## Integration decision

Do not merge entire organisation repositories into Sweet-Shop. Doing so would mix unrelated applications, old frameworks, package repositories, Android clients and vendor-specific services. The appropriate process is to select individual components that solve a defined Digital Pantry requirement, inspect the exact source and dependency licences, preserve required notices, adapt the component to the marketplace's own data model, then test it before merging.

The Amazon archived retail workshop is the closest functional reference, but its incomplete order implementation and obsolete stack make a direct import inappropriate. The other inspected candidates either address unrelated software distribution/cloud provisioning, vendor-specific subscription/payment services or have unsuitable usage restrictions. The current repository therefore contains no copied upstream code from these organisations. A complete source-level audit would require selecting particular repositories and examining their full trees, dependencies and histories individually.
