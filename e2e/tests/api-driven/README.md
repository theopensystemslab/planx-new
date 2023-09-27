# API-Driven Tests

This subfolder contains end-to-end (E2E) tests aimed at testing the logic of interactions between our services, without requiring a front-end interface to drive user interactions.

These tests may require interaction with various services, such as Hasura and a PostgreSQL database, or a mocked third-party service such as Uniform or BOPS.

## Stack

- **Gherkin**: Gherkin is a language used for specifying structured test scenarios [(docs)](https://docs.cucumber.io/gherkin/reference/)
- **Cucumber-JS**: Cucumber-JS is a JavaScript implementation of the Cucumber framework, allowing us to write and run behaviour-driven development (BDD) tests [(docs)](https://github.com/cucumber/cucumber-js)
- **Node.js assert**: The `assert` module in Node.js is used for making assertions in our tests [(docs)](https://nodejs.org/api/assert.html). If we find this to be insufficient we could move to a richer assertation library such as Jest.

## Basic setup for adding new tests

To add new tests to this folder, follow these steps:

1. Create a subfolder for each test scenario you want to test.

2. Inside each test subfolder, include the following files:

   - `<YOUR_FEATURE>.feature` file: This file contains the Gherkin syntax to describe the test scenario in a human-readable format. It outlines the steps and expected behaviour of the test.
   - `helpers.ts` file: This file should contain utility functions and setup/cleanup logic for your test. At a minimum, it should include the following functions:

     - `setup()`: This function sets up the necessary environment or configurations required for the test scenario.
     - `cleanup()`: This function performs cleanup tasks after the test scenario is executed, such as resetting the environment to its initial state.

   - `steps.ts` file: This file contains the step definitions for your Gherkin scenarios. Each step definition maps a step in the `.feature` file to a function that performs the corresponding action and assertion in your test. We aim to keep these steps as readable as possible, with the majority of the logic being contained within `helpers.ts`.
