"use client";

import { useEffect } from "react";

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

type GtagFunction = (command: "event", eventName: string, params?: AnalyticsPayload) => void;

declare global {
  interface Window {
    gtag?: GtagFunction;
    clarity?: (command: "event", eventName: string) => void;
  }
}

const SAFE_FORM_FIELDS = new Set(["city", "district", "ward", "q", "minPrice", "maxPrice", "minArea", "maxArea", "radius"]);

function sanitizePayload(payload: AnalyticsPayload = {}) {
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([, value]) => value !== "" && value !== null && typeof value !== "undefined")
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 120) : value]),
  );
}

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const safePayload = sanitizePayload(payload);
  window.gtag?.("event", eventName, safePayload);
  window.clarity?.("event", eventName);
}

function datasetPayload(element: HTMLElement): AnalyticsPayload {
  return {
    location: element.dataset.analyticsLocation,
    label: element.dataset.analyticsLabel ?? element.textContent?.trim().slice(0, 80),
    href: element instanceof HTMLAnchorElement ? element.href : undefined,
  };
}

function formPayload(form: HTMLFormElement): AnalyticsPayload {
  const formData = new FormData(form);
  const payload: AnalyticsPayload = { location: form.dataset.analyticsLocation };

  for (const [key, value] of formData.entries()) {
    if (SAFE_FORM_FIELDS.has(key) && typeof value === "string") {
      payload[key] = value.slice(0, 120);
    }
  }

  return payload;
}

export function AnalyticsEventTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-analytics-event]") : null;

      if (!target) {
        return;
      }

      trackEvent(target.dataset.analyticsEvent ?? "cta_click", datasetPayload(target));
    }

    function handleSubmit(event: SubmitEvent) {
      const form = event.target instanceof HTMLFormElement ? event.target : null;

      if (!form?.dataset.analyticsEvent) {
        return;
      }

      trackEvent(form.dataset.analyticsEvent, formPayload(form));
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
    };
  }, []);

  return null;
}

export function AnalyticsView({ eventName, payload = {} }: { eventName: string; payload?: AnalyticsPayload }) {
  useEffect(() => {
    trackEvent(eventName, payload);
  }, [eventName, payload]);

  return null;
}
