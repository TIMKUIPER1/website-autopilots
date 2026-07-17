const defaultCalendarUrl = "https://api.leadconnectorhq.com/widget/booking/UaWTV0sdETiXy0refclQ";

export const publicRuntime = {
  siteUrl: import.meta.env.PUBLIC_SITE_URL || "https://auto-pilots.io",
  ghlCalendarUrl: import.meta.env.PUBLIC_GHL_CALENDAR_URL || defaultCalendarUrl,
  analyticsProvider: import.meta.env.PUBLIC_ANALYTICS_PROVIDER || "none",
  analyticsSiteId: import.meta.env.PUBLIC_ANALYTICS_SITE_ID || "",
  stripePublishableKey: import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_live_51RrdTyQbNJoBxwDUkgIihINoKNKPcYcrETp0hnwXAglonZyKA7VrueuOATpnh8amdiA1sGk85OAFTqhn0r6lZ6Jm00AKmAX8aB"
} as const;

export const calendarHost = new URL(publicRuntime.ghlCalendarUrl).origin;
