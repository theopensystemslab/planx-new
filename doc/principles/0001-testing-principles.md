# 1. Testing Principles

## Status

Draft

## Context

The intent of this document is to provide an overview of our testing terminology and approach to ensure we share the same understanding and are working from the same set of assumptions and principles about how we test as a team.

## Terminology

  * **Linting** is a type of static analysis for simple code patterns. These tests are entirely automated and are used to catch classes of errors that can be detected in how code has been written (i.e. missing HTML attributes for accessibility).

  * **Unit tests** directly interact with individual units of code. They are small and focused on testing a single functional interface at a time. Unit tests always mocks external dependencies and are entirely deterministic.

  * **UI Component tests** are unit tests for UI components. These largely follow the same model as unit tests but, rather than testing purely functional interfaces, they attempt to simulate user interactions. Like unit tests, any state provided to these tests is always statically mocked.

  * **Service tests** simulate the use of a service with mocked dependencies. They interact with a service (usually an API) as an an external application/user would but use statically mocked data to ensure tests are deterministic and side-effect free.

  * **End-to-end tests** cover a user journey through a system. These tests interact with the application from the outside, with dummy data but a full running test stack (Web UI, APIs, Database, etc). In this form of testing, only external services are mocked - the full application is under test.


## Principles

1. Linting should run in the pipeline on every commit.
1. Unit tests should cover all logically complex code.
1. UI Component tests should be written for any UI related bug.
1. Service tests should ensure the full public interface for all exposed API is functional.
1. End-to-end tests should cover major happy path cases and some other significant cases.

## Notes

Because some of the functionality of the Plan✕ editor can depend on user generated content, tests that can evaluate content are necessary. [Are these kinds of tests always necessarily end-to-end tests or could they be covered in service tests?]
