import { secrets } from "base44:runtime";

// Only booleans leave this module: a secret's value is never returned, logged or
// sent anywhere. Each name is referenced literally so the platform can resolve it.
const present = (name) => Boolean(secrets.get(name));

const CONFIG = {
  jamail: {
    JAMAIL_ISSUER_URL: present("JAMAIL_ISSUER_URL"),
    JAMAIL_CLIENT_ID: present("JAMAIL_CLIENT_ID"),
    JAMAIL_CLIENT_SECRET: present("JAMAIL_CLIENT_SECRET"),
    JAMAIL_ORGANISATION_SCOPE: present("JAMAIL_ORGANISATION_SCOPE"),
  },
  butter_bank: {
    BUTTER_BANK_API_BASE_URL: present("BUTTER_BANK_API_BASE_URL"),
    BUTTER_BANK_API_KEY: present("BUTTER_BANK_API_KEY"),
  },
  untersous: {
    UNTERSOUS_API_BASE_URL: present("UNTERSOUS_API_BASE_URL"),
    UNTERSOUS_API_KEY: present("UNTERSOUS_API_KEY"),
  },
};

export function serviceConfigStatus() {
  return Object.fromEntries(
    Object.entries(CONFIG).map(([key, variables]) => {
      const missing = Object.entries(variables)
        .filter(([, isSet]) => !isSet)
        .map(([name]) => name);
      return [key, { configured: missing.length === 0, missing }];
    }),
  );
}