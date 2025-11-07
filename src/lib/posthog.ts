/**
 * PostHog Analytics Configuration
 * Centralized configuration for PostHog tracking
 */

import posthog from 'posthog-js';

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    const apiKey = import.meta.env.PUBLIC_POSTHOG_KEY;
    const apiHost = import.meta.env.PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    if (!apiKey) {
      console.warn('PostHog API key not found');
      return;
    }

    posthog.init(apiKey, {
      api_host: apiHost,
      // Don't autocapture pageviews - we'll do it manually for better control
      capture_pageview: false,
      // Capture performance metrics
      capture_performance: true,
      // Session recording - disabled by default, enable if needed
      disable_session_recording: true,
      // Autocapture interactions
      autocapture: true,
      // Respect Do Not Track
      respect_dnt: true,
      // Filter internal traffic
      loaded: (posthog) => {
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('vercel.app')) {
          posthog.opt_out_capturing();
        }
      }
    });
  }
};

export { posthog };
