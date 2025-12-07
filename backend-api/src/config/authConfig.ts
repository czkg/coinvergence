export const AUTH_CONFIG = {
  // verification token valid for 1 hour
  verificationTokenExpiresIn: 60 * 60 * 1000,

  // unverified accounts auto-deleted after 30 days
  deleteUnverifiedAfter: 30 * 24 * 60 * 60 * 1000,

  // JWT configs
  jwtExpiresIn: "7d" as const,

  // email sender
  mailFrom: "no-reply@coinvergence.net",
};
