# 3. Testing Principles

## Status

Draft

## Context

The intent of this document is to provide an overview of our testing terminology and approach to ensure we share the same understanding and are working from the same set of assumptions and principles about how we test as a team.

## Terminology

  * **Linting** is a type of static analysis for simple code patterns. These tests are entirely automated and are used to catch classes of errors that can be detected in how code has been written (i.e. missing HTML attributes for accessibility). ESlint is an example of a linting tool used throughout Plan✕ - see `editor.planx.uk/.eslintrc` for an example of how that is configured.

  * **Unit tests** directly interact with individual units of code. They are small and focused on testing a single functional interface at a time. Unit tests should be deterministic and generally should not have external dependencies but if required these dependencies should be mocked. Unit test files can be colocated alongside the files they they test or they may be grouped together, for example: `editor.planx.uk/src/@planx/graph/__tests__/clone.test.ts`.

  * **UI Component tests** are unit tests for UI components. These largely follow the same model as unit tests but, rather than testing purely functional interfaces, they attempt to simulate user interactions. Like unit tests, any state provided to these tests is always statically mocked. An example of a UI Component test using React Testing Library: `editor.planx.uk/src/@planx/components/NumberInput/Public.test.tsx`

  * **UI Interaction tests** are tests that expose the granular functionality of a UI for manual testing. We use Storybook to allow components to be individually viewed and interacted with. Storybook "stories" can be written to support this kind of testing. For example: `editor.planx.uk/src/ui/RichTextInput.stories.tsx`.

  * **Service tests** simulate the use of a service with mocked dependencies. They interact with a service (usually an API) as an an external application/user would but use statically mocked data to ensure tests are deterministic and side-effect free. One example of a service test using supertest is `api.planx.uk/editor/findReplace.test.js`.
  * **API Regression tests** are tests designed to catch implementation issues that would cause existing services to break or to introduce a breaking change to their public interface. An example of this kind of regression test are the introspection tests found in `hasura.planx.uk/tests`.

  * **End-to-end tests** cover a user journey through a system. These tests interact with the application from the outside, with dummy data but a full running test stack (Web UI, APIs, Database, etc). In this form of testing, only external services are mocked - the full application is under test. An example of Cypress end-to-end tests: `e2e/cypress/tests/retryGraphqlRequest.cy.js`


## General Principles

Here are some rule-of-thumb principles:

1. Linting should run in the CI pipeline on every commit.
1. UI Component tests should be written for any UI related bug.
1. Service tests should ensure the full public interface for all exposed API is functional.
1. End-to-end tests should cover major happy path cases and some other significant cases but need not be exhaustive of all possible interactions.

## Notes

Because some of the functionality of the Plan✕ editor can depend on user generated content, tests that can evaluate content are necessary. These kinds of tests may be expressed as service tests but sometimes end-to-end testing for these scenarios may be more appropriate.
