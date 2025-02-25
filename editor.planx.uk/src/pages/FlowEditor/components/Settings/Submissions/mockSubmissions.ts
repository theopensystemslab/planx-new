import { Submission } from "./types";

export const mockSubmissions = [
  {
    __typename: "submission_services_log",
    flowId: "b71f7a77-f06e-4dba-adf4-482286436c12",
    sessionId: "9111b241-3883-4d60-a973-5e693c021818",
    eventId: "f34636cb-651e-4de1-a0e2-d09586cabf02",
    eventType: "Pay",
    status: "Success",
    retry: false,
    response: {
      data: {
        body: '{"message":"Successfully sent to email","inbox":"jess@opensystemslab.io","govuk_notify_template":"Submit"}',
        status: 200,
        headers: [
          {
            name: "Vary",
            value: "Origin",
          },
        ],
      },
      type: "webhook_response",
      version: "1",
    },
    createdAt: "2024-11-20T11:16:14.529048+00:00",
    flowName: "jo",
  },
  {
    __typename: "submission_services_log",
    flowId: "b71f7a77-f06e-4dba-adf4-482286436c12",
    sessionId: "22fd6122-ddd1-4fc3-84fd-5198539a2f55",
    eventId: "158956bb-1c6d-41c0-816d-ee24836725o2",
    eventType: "Send to email",
    status: "Success",
    retry: false,
    response: {
      data: {
        body: '{"message":"Successfully sent to email","inbox":"rory@opensystemslab.io","govuk_notify_template":"Submit"}',
        status: 200,
        headers: [
          {
            name: "Vary",
            value: "Origin",
          },
          {
            name: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            name: "RateLimit-Policy",
            value: "250;w=600",
          },
          {
            name: "RateLimit-Limit",
            value: "250",
          },
          {
            name: "RateLimit-Remaining",
            value: "247",
          },
          {
            name: "RateLimit-Reset",
            value: "590",
          },
          {
            name: "Content-Security-Policy",
            value:
              "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
          },
          {
            name: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            name: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          {
            name: "Origin-Agent-Cluster",
            value: "?1",
          },
          {
            name: "Referrer-Policy",
            value: "no-referrer",
          },
          {
            name: "Strict-Transport-Security",
            value: "max-age=15552000; includeSubDomains",
          },
          {
            name: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            name: "X-DNS-Prefetch-Control",
            value: "off",
          },
          {
            name: "X-Download-Options",
            value: "noopen",
          },
          {
            name: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            name: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          {
            name: "X-XSS-Protection",
            value: "0",
          },
          {
            name: "Content-Type",
            value: "application/json; charset=utf-8",
          },
          {
            name: "Content-Length",
            value: "104",
          },
          {
            name: "ETag",
            value: 'W/"68-IhhiejBrkxjV41VbrWguTns6VUs"',
          },
          {
            name: "Set-Cookie",
            value:
              "session=e30=; path=/; expires=Mon, 24 Feb 2025 17:14:46 GMT; httponly",
          },
          {
            name: "Set-Cookie",
            value:
              "session.sig=TIu5aDi92uPSWZMs1vryu03iWiY; path=/; expires=Mon, 24 Feb 2025 17:14:46 GMT; httponly",
          },
          {
            name: "Date",
            value: "Mon, 24 Feb 2025 15:14:46 GMT",
          },
          {
            name: "Connection",
            value: "keep-alive",
          },
          {
            name: "Keep-Alive",
            value: "timeout=30",
          },
        ],
      },
      type: "webhook_response",
      version: "1",
    },
    createdAt: "2025-02-24T15:14:46.518501+00:00",
    flowName: "jo",
  },
  {
    __typename: "submission_services_log",
    flowId: "b71f7a77-f06e-4dba-adf4-482286436c12",
    sessionId: "23fd6122-ddd1-4fc3-84fd-5198539a2f95",
    eventId: "158956bb-1c6d-41c0-816d-ee24836725d2",
    eventType: "Submit to Uniform",
    status: "Success",
    retry: true,
    response: {
      data: {
        body: '{"message":"Successfully sent to email","inbox":"dan@opensystemslab.io","govuk_notify_template":"Submit"}',
        status: 200,
        headers: [
          {
            name: "Vary",
            value: "Origin",
          },
          {
            name: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            name: "RateLimit-Policy",
            value: "250;w=600",
          },
          {
            name: "RateLimit-Limit",
            value: "250",
          },
          {
            name: "RateLimit-Remaining",
            value: "247",
          },
          {
            name: "RateLimit-Reset",
            value: "590",
          },
          {
            name: "Content-Security-Policy",
            value:
              "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
          },
          {
            name: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            name: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          {
            name: "Origin-Agent-Cluster",
            value: "?1",
          },
          {
            name: "Referrer-Policy",
            value: "no-referrer",
          },
          {
            name: "Strict-Transport-Security",
            value: "max-age=15552000; includeSubDomains",
          },
          {
            name: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            name: "X-DNS-Prefetch-Control",
            value: "off",
          },
          {
            name: "X-Download-Options",
            value: "noopen",
          },
          {
            name: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            name: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          {
            name: "X-XSS-Protection",
            value: "0",
          },
          {
            name: "Content-Type",
            value: "application/json; charset=utf-8",
          },
          {
            name: "Content-Length",
            value: "104",
          },
          {
            name: "ETag",
            value: 'W/"68-IhhiejBrkxjV41VbrWguTns6VUs"',
          },
          {
            name: "Set-Cookie",
            value:
              "session=e30=; path=/; expires=Mon, 24 Feb 2025 17:14:46 GMT; httponly",
          },
          {
            name: "Set-Cookie",
            value:
              "session.sig=TIu5aDi92uPSWZMs1vryu03iWiY; path=/; expires=Mon, 24 Feb 2025 17:14:46 GMT; httponly",
          },
          {
            name: "Date",
            value: "Mon, 24 Feb 2025 15:14:46 GMT",
          },
          {
            name: "Connection",
            value: "keep-alive",
          },
          {
            name: "Keep-Alive",
            value: "timeout=30",
          },
        ],
      },
      type: "webhook_response",
      version: "1",
    },
    createdAt: "2025-02-11T15:14:46.518501+00:00",
    flowName: "jo",
  },
  {
    __typename: "submission_services_log",
    flowId: "b71f7a77-f06e-4dba-adf4-482286436c12",
    sessionId: "2081b241-3883-4d60-a973-5e693c021818",
    eventId: "f34636cb-641e-4de1-a0e2-d09586cabf02",
    eventType: "Pay",
    status: "Failed",
    retry: true,
    response: {
      data: {
        body: '{"message":"Successfully sent to email","inbox":"jo@opensystemslab.io","govuk_notify_template":"Submit"}',
        status: 200,
        headers: [
          {
            name: "Vary",
            value: "Origin",
          },
        ],
      },
      type: "webhook_response",
      version: "1",
    },
    createdAt: "2025-01-02T12:19:14.529048+00:00",
    flowName: "jo",
  },
  {
    flowId: "b71f7a77-f06e-4dba-adf4-482286436c12",
    sessionId: "6981b241-3883-4d60-a973-5e693c021818",
    eventId: "g34636cb-651e-9de1-a0e2-d09586cabf02",
    eventType: "Submit to BOPS",
    status: "Failed (502)",
    retry: false,
    response: {
      data: {
        message:
          '{"error":"Sending to BOPS failed (planx), this error has been logged"}',
      },
      type: "client_error",
      version: "1",
    },
    createdAt: "2025-02-10T19:50:14.529048+00:00",
    flowName: "jo",
  },
] as Submission[];
