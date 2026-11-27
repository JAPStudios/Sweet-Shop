# Pinned upstream repositories

These Git submodules pin the selected upstream projects used during Digital Pantry's source review. They preserve each upstream repository and its own history instead of flattening incompatible applications into the marketplace runtime.

Initialize them with:

```sh
git submodule update --init --recursive
```

## Selected source projects

| Upstream | Purpose in the review | Reuse notes |
|---|---|---|
| amazon-archives/serverless-retail-workshop | Retail storefront, basket, order domain and persistence patterns | MIT; old Java/Spring and Django sample; incomplete order workflow |
| amazon-archives/swa-sample-seller | Seller-account and seller API workflow reference | No LICENSE file was found at the checked repository root; its README warns about confidential seller-account data and local-only use; do not reuse code without verifying permission |
| amazon-archives/aws-service-catalog-react-components | Catalogue UI component reference | MIT No Attribution; AWS service catalogue, not a physical-goods marketplace |
| AuroraOSS/AuroraStore | Android app-store search, item details, downloads and update workflows | GPL-3.0; keep separate unless the project explicitly adopts the licence obligations |
| f-droid/repomaker | Multi-user seller-owned repositories, submission and publishing workflow | AGPL-3.0; network-service copyleft obligations require a deliberate licence decision |
| f-droid/fdroidserver | Catalogue metadata, validation, signing and publication | AGPL-3.0; keep separate unless the project explicitly adopts the licence obligations |
| hellofresh/braintree-go | Payment-provider client patterns | MIT; unofficial, old Go client; relevant only if Braintree is selected |
| M-China/mcd-mcp-server | McDonald's China ordering and pickup API documentation | The repository contains README documentation only, not the hosted service implementation. Its terms restrict sample use to non-commercial connection to McDonald's MCP Service; it is not a generic UnterSous API. No code reuse is authorised by this submodule pointer. |

## Integration boundary

The submodules are source references, not runtime dependencies. The Digital Pantry application remains in the root TanStack Start project. No GPL-3.0 or AGPL-3.0 code is linked into that application by this commit. The M-China service is not used as an order or delivery backend. Any later code reuse requires a separate compatibility, licence and security review.
