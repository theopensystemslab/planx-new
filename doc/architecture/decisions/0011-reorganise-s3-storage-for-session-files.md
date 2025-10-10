# 11. Reorganise S3 storage for session files

Date: 2025-10-07

## Status

Proposed

## Context

### Current State
- All files are currently stored with flat structure: `/:nanoId/filename.jpg`
  - This applies to files uploaded by users ("private") and files uploaded by editors ("public")
- Files are co-located regardless of team, service, or context
- File grouping requires querying user passports to get list of files
- No ability to limit API access per-team
- Generated files are recreated on each request (both slow and computationally expensive)
- No lifecycle rules - we manually sanitise via data held in user's passport - leaving orphaned files


### Core Problem
**API cannot enforce team-level access control** An API key for Team A could theoretically access Team B's files if the nanoId is discovered. We're relying on security through obscurity and a high level of trust as we only issue a small number of keys. As this grows, we need a more robust access system here.

### Secondary Problems
1. Difficult to bulk-download or sanitise data for a specific team/service
2. Generated files regenerated on each request (performance issue)
3. No logical organisation for operational tasks (e.g. debugging, building submission zip, "resuming" from a partially completed file-upload component)

## Decision

### In scope: User uploaded ("private") file only
Adopt hierarchical S3 key structure for all **new** session files - 

```
:bucket-name/:teamSlug/:flowId/:sessionId/filename.jpg
:bucket-name/:teamSlug/:flowId/:sessionId/generated/filename.pdf
```

Critically, I'm not proposing a migration of existing data. We'll need to generate a new S3 bucket for new files to be uploaded to, and maintain the old bucket and API access endpoints.

### Out of scope: Editor-uploaded images
I'm proposing that we do not change how editor images are stored as part of this task. This is a separate issue, which will require a migration of data. I also see this as a technically more challenging propsal (in some ways) which we would do well to sequence once this task is completed.

## Consequences

### Benefits

#### 1. Team-level, and supplier-level (e.g. BOPS), access control
```ts
// Pseudocode for Express validation middleware - replacement for useFilePermission()
const requestedTeamSlug = req.params.teamSlug
const allowedTeamSlugs = getAllowedTeamsForAPIKey(apiKey);

if (!allowedTeamSlugs.includes(requestedTeamSlug)) {
  throw new Error("API key cannot access this team");
}
```

#### 2. Improved file access
```sh
# Get all files for a flow (possibly useful in ML context)
aws s3 sync s3://:bucketName/:teamSlug/:flowId ./backup/

# List all files for a session
s3.listObjectsV2({ Prefix: ':teamSlug/:flowId/:sessionId' })
```

### Trade-offs and risks

#### 1. Complexity during transition period
**Duration:** 6 months from rollout - uploaded files will remain accessible in current bucket

In the meantime, the API would need to allow access to both old and new paths, and access which bucket to fetch from. My proposal would be that we introduce a new endpoint for file access, e.g. `https://api.editor.planx.dev/file/private/:teamSlug/:flowId/filename.jpg`

**Risk mitigation:**
- Logging access patterns during transition - who's still relying on old access API endpoints?
- Deprecate old API endpoints
- Allow existing API keys to access both routes during the transition
- Remove old code at 6 months + 2 weeks buffer period

#### 2. Path traversal protection
I'm pretty certain S3 prevents this behaviour natively (I think `..` is treated as a plain string), but we should account for attempts at path traversal now that keys have a meaningful path.

```ts
// Sanitise key to prevent ../../../ attacks
function sanitiseKey(key) {
  const sanitised = path.normalize(key).replace(/^(\.\.[\/\\])+/, '');
  if (sanitised !== key) {
    throw new Error('Invalid key: path traversal detected');
  }
  return sanitised;
}
```

#### 3. Team/flow/session lifecycle
**What if a team or flow is deleted?**

Option A: We keep files until their natural sanitation date
- Pro: Simple, no data loss risk
- Con: "Orphaned" files for max 6 months

Option B: Immediate deletion via lifecycle event
- Pro: Simple mental model, no orphaned data
- Con: More complex to implement, not really required

**Recommendation:** Option A. If a team offboards from PlanX we'll discuss their requirements here - I'm pretty certain we have data-porting agreements in place.

**How is session sanitation handled?**

Option A: Maintain current process
- Pro: Relatively simple, less change all at once
- Con: Chance of flakiness - if process fails file can be orphaned

Option B: Sanitise via lifecycle rules on files
- Pro: Guaranteed process, no need for nightly jobs
- Con: More complex to implement, need to account for submission date - we can only know the expiration date post-submission

**Recommendation:** We maintain the current process, but replace the current request which iterates over a passport to a more simple operation which runs of an S3 directory (based on sessionId). As a fallback we should also implement lifecycle rules on files which would cover their maximum lifespan (28 days application + 28 days ITP + 6 months).

### Implementation details

#### Multiple team access
We know that some consumers will have access to files for multiple teams, for example BOPS. We could issue a single "BOPS" API key with permissions for multiple teams, or issue one per-team.

Option A: Issue separate API keys per team
- Pro: Clear, explicit permissions. Same pattern that BOPS uses.
- Con: Consumers have to manage multiple keys (as do we)

Option B: Allow multiple teams per-API key
- Pro: Single key for suppliers
- Con: Need to handle team additions/removals

**Recommendation:** Option B - allowing a single API key to be associated with multiple teams. This will be backed by a database table that maps API keys to the teamSlugs they are permitted to access. This is simpler for us to manage, as well as simpler for consumers. We'll need to add/remove teams from associated keys via the DB but this is actually simpler than granting and managing keys directly.

### Migration plan

#### Phase 1: Preparation
- [ ] Provision new S3 bucket via IAC
- [ ] Create feature flag to allow rollbacks / testing

#### Phase 2: Deploy new format
- [ ] Update upload logic to write to new hierarchical paths
- [ ] Update read logic to support both formats
- [ ] Deprecate old API endpoint via Swagger docs
- [ ] Update data sanitation process delete via path, as well as passport iteration

#### Phase 3: Validation
- [ ] Confirm new files are uploaded in correct format
- [ ] Confirm that consumers can access files (inc. ourselves - e.g. building submission zips)

#### Phase 4: API keys and access
- [ ] Implement API key storage and retrieval, and team mappings
- [ ] Ensure old keys work on new paths, with the correct restrictions in place
- [ ] Ensure old keys continue to work on old paths

#### Phase 5: File generation
- [ ] On submission events, populate /:sessionId/generated with generated files
- [ ] Update `/download-application-files` endpoint, and other admin endpoints, to point to generated files
- [ ] Implement trigger (admin endpoint?) to re-build generated files (for example, payload generation failed due to a bug)

#### Phase 6: Clean up
- [ ] Verify that lifecycle rules work
- [ ] Remove old file sanitation process
- [ ] Remove old format code path
- [ ] Remove feature flag
- [ ] Update documentation
- [ ] :warning: Do not delete old S3 bucket - this still contains Editor uploaded ("public") files

## Alternatives Considered

### Alternative 1: Database-tracked files
Store all file metadata in database, keep S3 keys as nanoIds.

**Rejected:** Adds database dependency for every file access request - the current system is DB-free for file operations. This also avoids the difficulty of keeping S3 and database in sync (what happens if a file is written to S3, but DB write fails?). The hierarchical model we have is simple enough that the path can contain all information we need, and additional detail can be stored in S3 tags if needed.

### Alternative 2: Separate S3 buckets per team
Create `{teamSlug}-user-data` for each team.

**Rejected:** Seems overly complex, no real advantage. Cross-bucket access still required. No max number of items per-bucket so there's no real need for separation like this.

### Alternative 3: Full migration of existing files
Move all old-format files to new structure.

**Rejected:** High risk, high effort, low reward! Transition period is acceptable here given the size and cadence of the dev team.