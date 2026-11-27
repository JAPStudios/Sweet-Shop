// External services Digital Pantry depends on but is not connected to.
// Nothing here calls a provider: it states what each connection needs, so the
// app can show an honest status instead of pretending the service exists.

export const EXTERNAL_SERVICES = [
  {
    key: "jamail",
    name: "JaMail",
    role: "Sign-in for individuals and organisation workers, and the record of who is employed by which organisation.",
    requires: [
      "JAMAIL_ISSUER_URL",
      "JAMAIL_CLIENT_ID",
      "JAMAIL_CLIENT_SECRET",
      "JAMAIL_ORGANISATION_SCOPE",
    ],
    endpoints: [
      "OpenID Connect discovery, authorisation and token exchange for individual and worker accounts",
      "Organisation membership read for a given organisation account",
      "Employment-end notification — a signed webhook or a membership poll interval — so access is removed when employment ends",
    ],
    meanwhile:
      "Accounts sign in with Base44 email sign-in. Organisation memberships and revocations are recorded in this app and enforced when a worker lists goods, but JaMail has not confirmed any identity or employment status.",
  },
  {
    key: "butter_bank",
    name: "Butter Bank",
    role: "Verification of a buyer's income so essentials can be priced according to the institution's assessment.",
    requires: ["BUTTER_BANK_API_BASE_URL", "BUTTER_BANK_API_KEY"],
    endpoints: [
      "Assessment request returning a reference for the buyer",
      "Assessment result — the outcome and the price adjustment the institution authorises — by signed webhook or a result read",
      "The institution's consent and redirect requirements for the buyer",
    ],
    meanwhile:
      "No assessment can be requested, so no income-adjusted price is calculated. Every basket is priced at the seller's listed price.",
  },
  {
    key: "untersous",
    name: "UnterSous",
    role: "Driver pickup and delivery, including collecting parcels from several sellers before delivering them.",
    requires: ["UNTERSOUS_API_BASE_URL", "UNTERSOUS_API_KEY"],
    endpoints: [
      "Pickup-run creation with stops, parcel references and pickup windows",
      "Driver assignment and run status read",
      "Delivery status notification — a signed webhook or a poll interval — so order tracking stays current",
    ],
    meanwhile:
      "The pickup console groups parcels by pickup location and records collection and delivery by hand. No run is dispatched to UnterSous and no driver is assigned by the app.",
  },
];

export const serviceByKey = (key) => EXTERNAL_SERVICES.find((service) => service.key === key);