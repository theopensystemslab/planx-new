# 7. Express.js module structure

Date: 2023-08-18

## Status

Proposed

## Context

Our Express.js application has grown without much structure - it's a bit unclear where things should go, or how a new feature should be structured. With the addition of Swagger docs and potentially new developers coming onto the team it makes sense to start tidying things up.

## Decision

I'm proposing that we implement a modular structure consisting of four main files/folders within each module: `middleware.ts`, `routes.ts`, `controller.ts`, and `service.ts`. Not every module will have every file and some modules may have a folder of `/services` or `/controllers` if they require it.

This structure will hopefully bring more clarity and organization to the codebase.

**Proposed structure**
```
api.planx.uk/
|-- modules/
|   |-- auth/
|   |   |-- routes.ts
|   |   |-- middleware.ts
|   |   |-- controller.ts
|   |   |-- service.ts
|   |-- ...
|-- app.js
|-- server.js
|-- ...
```

1. **`routes.ts`:**
   - Nice and simple - no business logic, just route definition and documention

2. **`middleware.ts`:**
   - Preprocess incoming requests before reaching route handlers

3. **`controller.ts`:**
   - Orchestrates data processing and interactions with external sources
   - Handles request/response logic (`res`, `req`, `next`), validation, error handling

4. **`service.ts`:**
   - Contains the core business logic and operations
   - Responsible for communicating with database via GraphQL client
   - More easily testable outside the context of the request / response cycle
  
**Rationale:**
I believe that this structure will improve code readability and maintainability by dividing responsibilities into distinct files. It promotes the separation of concerns and a clearer code "flow". 

I'm suggesting modules grouped around distinct "features" or "groupings of functionality" as opposed to top level `/middleware`, `/routes` folder etc for a few reasons - 
 - It more closely matches the structure we currently have and use - refactoring should be simpler and cleaner
 - We can tackle it module by module much more easily, and track our progress
 - (Opinion) I like the workflow - it's sort of like a lot of microservices which matches how we use and conceive of the API I think.

## Consequences

1. **Positive:**
   - Enhanced code organization and readability
   - Improved maintainability and of debugging
   - Simpler, and more effective, unit testing of individual components
   - Enables efficient addition of new features and routes

2. **Negative:**
   - Initial implementation will take some time - it's something we can chip away at
   - I think this pattern would work for most modules, but there may be some exceptions we'll need to work around