import { Submission } from "./types";

export const mockSubmissions = [
  {
    createdAt: "2025-02-25T15:12:43.7328+00:00",
    flowId: "28e258a7-812f-4390-b520-7c00e7f5cd77",
    flowName: "Apply for planning permission",
    sessionId: "a88106ca-8421-4fe8-ba61-f8e954cb567d",
    eventId: "fe960ab2-63b5-45c1-8a1b-5707fd110a89",
    eventType: "Send to email",
    status: "Success",
    retry: false,
    response: {
      data: {
        body: '{"message":"Successfully sent to email","inbox":"test@testgov.uk","govuk_notify_template":"Submit"}',
        status: 200,
        headers: [
          {
            name: "Date",
            value: "Tue, 25 Feb 2025 15:12:43 GMT",
          },
          {
            name: "Content-Type",
            value: "application/json; charset=utf-8",
          },
          {
            name: "Transfer-Encoding",
            value: "chunked",
          },
          {
            name: "Connection",
            value: "keep-alive",
          },
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
            value: "249",
          },
          {
            name: "RateLimit-Reset",
            value: "600",
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
            value: "max-age=15552000; includeSubDomains; preload",
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
            name: "ETag",
            value: 'W/"78-+yH9803IgqqgEJ/xBuYyGT+rJDk"',
          },
          {
            name: "Set-Cookie",
            value:
              "session=e30=; path=/; expires=Tue, 25 Feb 2025 17:12:43 GMT; httponly",
          },
          {
            name: "Set-Cookie",
            value:
              "session.sig=TIu5aDi92uPSWZMs1vryu03iWiY; path=/; expires=Tue, 25 Feb 2025 17:12:43 GMT; httponly",
          },
          {
            name: "cf-cache-status",
            value: "DYNAMIC",
          },
          {
            name: "Report-To",
            value:
              '{"endpoints":[{"url":"https:\\/\\/a.nel.cloudflare.com\\/report\\/v4?s=ZHSjpXiNvPysbaW9gCbs0nyK2jBqHEf%2B2KnqzVojsJ9xepPBYJwXGSHqYugl62P9iiwx2Niez3rzJwcapo0EVAyq2c1aN8ZaC3ljgcqgiA65P45mFTAxEuTsFisq71OtD7plpc%2B7JQ%3D%3D"}],"group":"cf-nel","max_age":604800}',
          },
          {
            name: "NEL",
            value:
              '{"success_fraction":0,"report_to":"cf-nel","max_age":604800}',
          },
          {
            name: "Content-Security-Policy",
            value: "frame-ancestors none;",
          },
          {
            name: "Server",
            value: "cloudflare",
          },
          {
            name: "CF-RAY",
            value: "9178a2a04fc26547-LHR",
          },
          {
            name: "Content-Encoding",
            value: "gzip",
          },
          {
            name: "alt-svc",
            value: 'h3=":443"; ma=86400',
          },
          {
            name: "server-timing",
            value:
              'cfL4;desc="?proto=TCP&rtt=1539&min_rtt=1539&rtt_var=578&sent=5&recv=6&lost=0&retrans=0&sent_bytes=2321&recv_bytes=919&delivery_rate=1878080&cwnd=180&unsent_bytes=0&cid=aa3bad7d41d0b0b5&ts=220&x=0"',
          },
        ],
      },
      type: "webhook_response",
      version: "1",
    },
  },
  {
    createdAt: "2025-02-25T14:44:42.401611+00:00",
    flowId: "01e38c5d-e701-4e44-acdc-4d6b5cc3b854",
    flowName: "Apply for planning permission",
    sessionId: "c64eefbe-bb2d-47c8-94de-d4776e09af04",
    eventId: "7bae03cc-530b-4d4b-9594-8aa407f5147d",
    eventType: "Upload to AWS S3",
    status: "Success",
    retry: false,
    response: {
      data: {
        body: '{"message":"Successfully uploaded submission to S3: https://api.editor.planx.dev/file/private/jzfjxzui/c64eefbe-bb2d-47c8-94de-d4776e09af04.json","payload":"Validated ODP Schema","webhookResponse":202,"auditEntryId":46}',
        status: 200,
        headers: [
          {
            name: "Date",
            value: "Tue, 25 Feb 2025 14:44:42 GMT",
          },
          {
            name: "Content-Type",
            value: "application/json; charset=utf-8",
          },
          {
            name: "Transfer-Encoding",
            value: "chunked",
          },
          {
            name: "Connection",
            value: "keep-alive",
          },
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
            value: "249",
          },
          {
            name: "RateLimit-Reset",
            value: "600",
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
            value: "max-age=15552000; includeSubDomains; preload",
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
            name: "ETag",
            value: 'W/"db-v7zdg9XU4l9LvCvpKyCRR+FsvDY"',
          },
          {
            name: "Set-Cookie",
            value:
              "session=e30=; path=/; expires=Tue, 25 Feb 2025 16:44:42 GMT; httponly",
          },
          {
            name: "Set-Cookie",
            value:
              "session.sig=TIu5aDi92uPSWZMs1vryu03iWiY; path=/; expires=Tue, 25 Feb 2025 16:44:42 GMT; httponly",
          },
          {
            name: "cf-cache-status",
            value: "DYNAMIC",
          },
          {
            name: "Report-To",
            value:
              '{"endpoints":[{"url":"https:\\/\\/a.nel.cloudflare.com\\/report\\/v4?s=VKrsNX2Wbt8KLz9XOMHDy6UPtfkhrwds0WnE%2BGrwta9e2BYkZ4SdE7qW6nOlKgJ6xlovOFI1qdsvy1nqdRbGF7hNjlYGG7UPYgbGNFKI87zNiQUOpbrQdayFrzdikqyY99KrGXzJJQ%3D%3D"}],"group":"cf-nel","max_age":604800}',
          },
          {
            name: "NEL",
            value:
              '{"success_fraction":0,"report_to":"cf-nel","max_age":604800}',
          },
          {
            name: "Content-Security-Policy",
            value: "frame-ancestors none;",
          },
          {
            name: "Server",
            value: "cloudflare",
          },
          {
            name: "CF-RAY",
            value: "917879609efe9532-LHR",
          },
          {
            name: "Content-Encoding",
            value: "gzip",
          },
          {
            name: "alt-svc",
            value: 'h3=":443"; ma=86400',
          },
          {
            name: "server-timing",
            value:
              'cfL4;desc="?proto=TCP&rtt=1546&min_rtt=1532&rtt_var=585&sent=5&recv=6&lost=0&retrans=0&sent_bytes=2322&recv_bytes=913&delivery_rate=1890339&cwnd=197&unsent_bytes=0&cid=050e45a52c5bab62&ts=8435&x=0"',
          },
        ],
      },
      type: "webhook_response",
      version: "1",
    },
  },
  {
    createdAt: "2025-02-19T14:42:02.218441+00:00",
    flowId: "01e38c5d-e701-4e44-acdc-4d6b5cc3b854",
    flowName: "Apply for planning permission",
    sessionId: "e4dab675-0893-41ce-ade8-0ad8a5e3d7e8",
    eventId: "d1e6c8d0-946d-4e43-bc24-16fdda8a6849",
    eventType: "Upload to AWS S3",
    status: "Success",
    retry: false,
    response: {
      data: {
        body: '{"message":"Successfully uploaded submission to S3: https://api.editor.planx.dev/file/private/4cf1rquq/e4dab675-0893-41ce-ade8-0ad8a5e3d7e8.json","payload":"Validated ODP Schema","webhookResponse":202,"auditEntryId":45}',
        status: 200,
        headers: [
          {
            name: "Date",
            value: "Wed, 19 Feb 2025 14:42:02 GMT",
          },
          {
            name: "Content-Type",
            value: "application/json; charset=utf-8",
          },
          {
            name: "Transfer-Encoding",
            value: "chunked",
          },
          {
            name: "Connection",
            value: "keep-alive",
          },
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
            value: "249",
          },
          {
            name: "RateLimit-Reset",
            value: "600",
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
            value: "max-age=15552000; includeSubDomains; preload",
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
            name: "ETag",
            value: 'W/"db-WMIe4mU8Zd44iGjoquL4BIOgWpo"',
          },
          {
            name: "Set-Cookie",
            value:
              "session=e30=; path=/; expires=Wed, 19 Feb 2025 16:42:02 GMT; httponly",
          },
          {
            name: "Set-Cookie",
            value:
              "session.sig=TIu5aDi92uPSWZMs1vryu03iWiY; path=/; expires=Wed, 19 Feb 2025 16:42:02 GMT; httponly",
          },
          {
            name: "cf-cache-status",
            value: "DYNAMIC",
          },
          {
            name: "Report-To",
            value:
              '{"endpoints":[{"url":"https:\\/\\/a.nel.cloudflare.com\\/report\\/v4?s=eSXn%2FS5r0%2F4mwLYxKR9PHxpb%2BOpKI2xG5Wf7K8WWm0aR28IE5RR7WqakM0G74%2BKM96F4WEspPypxKvKdhW7v%2B2Ormxov3U75BVckj1ums2RV%2FrGLZz0euyDBGdfBsX%2Be%2FXv%2FkkQjdA%3D%3D"}],"group":"cf-nel","max_age":604800}',
          },
          {
            name: "NEL",
            value:
              '{"success_fraction":0,"report_to":"cf-nel","max_age":604800}',
          },
          {
            name: "Content-Security-Policy",
            value: "frame-ancestors none;",
          },
          {
            name: "Server",
            value: "cloudflare",
          },
          {
            name: "CF-RAY",
            value: "914705310b11f65b-LHR",
          },
          {
            name: "Content-Encoding",
            value: "gzip",
          },
          {
            name: "alt-svc",
            value: 'h3=":443"; ma=86400',
          },
          {
            name: "server-timing",
            value:
              'cfL4;desc="?proto=TCP&rtt=1918&min_rtt=1913&rtt_var=721&sent=5&recv=6&lost=0&retrans=0&sent_bytes=2322&recv_bytes=912&delivery_rate=1513852&cwnd=251&unsent_bytes=0&cid=da4cc00c4885bd7e&ts=9464&x=0"',
          },
        ],
      },
      type: "webhook_response",
      version: "1",
    },
  },
  {
    createdAt: "2025-02-19T13:37:44.249298+00:00",
    flowId: "01e38c5d-e701-4e44-acdc-4d6b5cc3b854",
    flowName: "Apply for planning permission",
    sessionId: "e4dab675-0893-41ce-ade8-0ad8a5e3d7e8",
    eventId: "38f59b4f-f0b7-4137-896d-aa46a4b8d5ad",
    eventType: "Upload to AWS S3",
    status: "Failed (500)",
    retry: false,
    response: {
      data: {
        message:
          '{"error":"Failed to upload submission to S3 (lambeth): Invalid DigitalPlanning pp.full.householder payload for session e4dab675-0893-41ce-ade8-0ad8a5e3d7e8. Errors: [\\n  {\\n    \\"instancePath\\": \\"/data/applicant\\",\\n    \\"schemaPath\\": \\"#/additionalProperties\\",\\n    \\"keyword\\": \\"additionalProperties\\",\\n    \\"params\\": {\\n      \\"additionalProperty\\": \\"agent\\"\\n    },\\n    \\"message\\": \\"must NOT have additional properties\\"\\n  },\\n  {\\n    \\"instancePath\\": \\"/data/applicant/ownership/owners/0\\",\\n    \\"schemaPath\\": \\"#/required\\",\\n    \\"keyword\\": \\"required\\",\\n    \\"params\\": {\\n      \\"missingProperty\\": \\"noticeGiven\\"\\n    },\\n    \\"message\\": \\"must have required property \'noticeGiven\'\\"\\n  },\\n  {\\n    \\"instancePath\\": \\"/data/applicant/ownership/owners/0\\",\\n    \\"schemaPath\\": \\"#/required\\",\\n    \\"keyword\\": \\"required\\",\\n    \\"params\\": {\\n      \\"missingProperty\\": \\"noNoticeReason\\"\\n    },\\n    \\"message\\": \\"must have required property \'noNoticeReason\'\\"\\n  },\\n  {\\n    \\"instancePath\\": \\"/data/applicant/ownership/owners/0\\",\\n    \\"schemaPath\\": \\"#/required\\",\\n    \\"keyword\\": \\"required\\",\\n    \\"params\\": {\\n      \\"missingProperty\\": \\"noticeDate\\"\\n    },\\n    \\"message\\": \\"must have required property \'noticeDate\'\\"\\n  },\\n  {\\n    \\"instancePath\\": \\"/data/applicant/ownership/owners/0\\",\\n    \\"schemaPath\\": \\"#/anyOf\\",\\n    \\"keyword\\": \\"anyOf\\",\\n    \\"params\\": {},\\n    \\"message\\": \\"must match a schema in anyOf\\"\\n  },\\n  {\\n    \\"instancePath\\": \\"/data/applicant\\",\\n    \\"schemaPath\\": \\"#/anyOf\\",\\n    \\"keyword\\": \\"anyOf\\",\\n    \\"params\\": {},\\n    \\"message\\": \\"must match a schema in anyOf\\"\\n  }\\n], this error has been logged"}',
      },
      type: "client_error",
      version: "1",
    },
  },
  {
    createdAt: "2025-02-17T12:47:54.30246+00:00",
    flowId: "4a95512b-c0b2-4891-b433-441ae5a4d132",
    flowName: "Submit a hedgerow removal notice template",
    sessionId: "d12e9ced-3b53-43a6-8987-792d25ad358a",
    eventId: "e5cfdf35-a9f9-457f-a2c3-b1106297afeb",
    eventType: "Send to email",
    status: "Success",
    retry: false,
    response: {
      data: {
        body: '{"message":"Successfully sent to email","inbox":"test@test.com","govuk_notify_template":"Submit"}',
        status: 200,
        headers: [
          {
            name: "Date",
            value: "Mon, 17 Feb 2025 12:47:54 GMT",
          },
          {
            name: "Content-Type",
            value: "application/json; charset=utf-8",
          },
          {
            name: "Transfer-Encoding",
            value: "chunked",
          },
          {
            name: "Connection",
            value: "keep-alive",
          },
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
            value: "249",
          },
          {
            name: "RateLimit-Reset",
            value: "600",
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
            value: "max-age=15552000; includeSubDomains; preload",
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
            name: "ETag",
            value: 'W/"6c-SfjjXwnBxYdeTxzodi/wCA6cOKA"',
          },
          {
            name: "Set-Cookie",
            value:
              "session=e30=; path=/; expires=Mon, 17 Feb 2025 14:47:54 GMT; httponly",
          },
          {
            name: "Set-Cookie",
            value:
              "session.sig=TIu5aDi92uPSWZMs1vryu03iWiY; path=/; expires=Mon, 17 Feb 2025 14:47:54 GMT; httponly",
          },
          {
            name: "cf-cache-status",
            value: "DYNAMIC",
          },
          {
            name: "Report-To",
            value:
              '{"endpoints":[{"url":"https:\\/\\/a.nel.cloudflare.com\\/report\\/v4?s=CCaago5Wu7Ld3%2BLG2QMRfjKylleA1xlMUFw0%2BZbYHUjpyJmVpslvHOXhAN2mdOwxlfL8ROGsvtjDAwOotXOCUs9lgf0fqSkQzwuPbzU%2FfLc0yffTwimDTD7guE83qFOeIugFG79qWg%3D%3D"}],"group":"cf-nel","max_age":604800}',
          },
          {
            name: "NEL",
            value:
              '{"success_fraction":0,"report_to":"cf-nel","max_age":604800}',
          },
          {
            name: "Content-Security-Policy",
            value: "frame-ancestors none;",
          },
          {
            name: "Server",
            value: "cloudflare",
          },
          {
            name: "CF-RAY",
            value: "9135e37af8e2496e-LHR",
          },
          {
            name: "Content-Encoding",
            value: "gzip",
          },
          {
            name: "alt-svc",
            value: 'h3=":443"; ma=86400',
          },
          {
            name: "server-timing",
            value:
              'cfL4;desc="?proto=TCP&rtt=1963&min_rtt=1943&rtt_var=743&sent=5&recv=6&lost=0&retrans=0&sent_bytes=2321&recv_bytes=913&delivery_rate=1490478&cwnd=248&unsent_bytes=0&cid=6aa5c374bac3d4d6&ts=277&x=0"',
          },
        ],
      },
      type: "webhook_response",
      version: "1",
    },
  },
  {
    createdAt: "2025-02-14T14:17:42.177456+00:00",
    flowId: "67f22b71-5d06-489d-8259-583cac99c362",
    flowName: "Apply for a lawful development certificate",
    sessionId: "acc48bc4-091d-48c1-865e-f1ab1f2a2f6d",
    eventId: "380b2a5a-921f-442e-811d-6089f53be1d3",
    eventType: "Upload to AWS S3",
    status: "Success",
    retry: false,
    response: {
      data: {
        body: '{"message":"Successfully uploaded submission to S3: https://api.editor.planx.dev/file/private/9hvfsa0v/acc48bc4-091d-48c1-865e-f1ab1f2a2f6d.json","payload":"Validated ODP Schema","webhookResponse":202,"auditEntryId":44}',
        status: 200,
        headers: [
          {
            name: "Date",
            value: "Fri, 14 Feb 2025 14:17:42 GMT",
          },
          {
            name: "Content-Type",
            value: "application/json; charset=utf-8",
          },
          {
            name: "Transfer-Encoding",
            value: "chunked",
          },
          {
            name: "Connection",
            value: "keep-alive",
          },
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
            value: "249",
          },
          {
            name: "RateLimit-Reset",
            value: "600",
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
            value: "max-age=15552000; includeSubDomains; preload",
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
            name: "ETag",
            value: 'W/"db-TdTlgWevSSYJxR5JJ4wwdU3a3fw"',
          },
          {
            name: "Set-Cookie",
            value:
              "session=e30=; path=/; expires=Fri, 14 Feb 2025 16:17:42 GMT; httponly",
          },
          {
            name: "Set-Cookie",
            value:
              "session.sig=TIu5aDi92uPSWZMs1vryu03iWiY; path=/; expires=Fri, 14 Feb 2025 16:17:42 GMT; httponly",
          },
          {
            name: "cf-cache-status",
            value: "DYNAMIC",
          },
          {
            name: "Report-To",
            value:
              '{"endpoints":[{"url":"https:\\/\\/a.nel.cloudflare.com\\/report\\/v4?s=x5UWgCwbOu1TD6A%2B1cbgsrI%2BCBYf9JXbNasoDyM8uo1sgtjxONs9HBeXjt6S5xf11JGsyGF2Lj0Mv89I2%2BvoHbvKghtxIQMcGmq4GWjl%2FrlJxaa5R8ARrXVAJ36dbduRVMGQ5BiT%2FQ%3D%3D"}],"group":"cf-nel","max_age":604800}',
          },
          {
            name: "NEL",
            value:
              '{"success_fraction":0,"report_to":"cf-nel","max_age":604800}',
          },
          {
            name: "Content-Security-Policy",
            value: "frame-ancestors none;",
          },
          {
            name: "Server",
            value: "cloudflare",
          },
          {
            name: "CF-RAY",
            value: "911daeb77a06385a-LHR",
          },
          {
            name: "Content-Encoding",
            value: "gzip",
          },
          {
            name: "alt-svc",
            value: 'h3=":443"; ma=86400',
          },
          {
            name: "server-timing",
            value:
              'cfL4;desc="?proto=TCP&rtt=2129&min_rtt=2124&rtt_var=800&sent=5&recv=6&lost=0&retrans=0&sent_bytes=2321&recv_bytes=913&delivery_rate=1363465&cwnd=174&unsent_bytes=0&cid=d17e3a663d47f53c&ts=7591&x=0"',
          },
        ],
      },
      type: "webhook_response",
      version: "1",
    },
  },
] as Submission[];
