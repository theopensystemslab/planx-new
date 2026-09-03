# How to identify and fix missing files

## Context
PlanX allows applicants to upload images alongside their applications. These files are stored on AWS S3. When each file is uploaded, we use [Scanii](https://scanii.com/) to scan the uploaded files for - 
 - Malware (Malicious, unwanted or otherwise dangerous software)
 - NSFW Images (Detects adult, offensive or otherwise inappropriate images)

Scanii is an AWS application which runs on our AWS accounts, which operates through a Lambda function.

When Scanii detects an image which breaks it's moderation policy the file is deleted from S3. We do not currently subscribe to these events or take further action (e.g. updating the user's breadcrumbs/passport, or logging these events).

As these images are automatically deleted, this can lead to issues when trying to download the application files - the passport will list files which no longer exist on S3 and the request to get the file will fail.

## Scan verification

Once Scanii has scanned an object, a callback Lambda tags it with `ScaniiId` and `ScaniiFindings`. The API will not serve a file from the user-data bucket unless those tags are present, so a file that has not yet been scanned is never handed to a council. This is controlled by the `ENFORCE_SCAN_FROM` env var (an ISO8601 date), which is set in every environment backed by a bucket Scanii watches: staging and production (from Pulumi config) and pizzas (from `.env.staging`). When unset the check is disabled entirely, which is the case in local development and in e2e/integration tests - both run against Minio, which has no Scanii equivalent, so no object is ever tagged.

The API response tells you which situation you're in before you go near CloudWatch:

| Response | Meaning |
| --- | --- |
| `503` + `{ "error": "FILE_SCAN_PENDING" }` | Scanii hasn't tagged the object yet. Transient — retry after the `Retry-After` interval. If it persists, the tagging Lambda is broken or not running. |
| `404` + `{ "error": "FILE_FLAGGED" }` | Scanii recorded findings against the file. Follow the steps below. |
| `404` + `{ "error": "FILE_NOT_FOUND" }` | No such object. Usually a file Scanii deleted at scan time — also follow the steps below. |
| `500` | An S3 or configuration failure, not a moderation issue. Check API logs. |

You can inspect an object's tags directly:

```sh
# <bucket> is the user-data bucket for staging/production, or pizza-user-uploads for a pizza
aws s3api get-object-tagging --bucket <bucket> --key 'abc12345/my_file.jpg'
```

A file that was scanned and cleared carries `ScaniiFindings` set to the literal string `None` - **not** an empty value. A real finding looks similar to `content.malicious.eicar-test-signature`. Anything we don't recognise is treated as a finding and the file is refused, so if Scanii ever changes this format, expect `FILE_FLAGGED` on healthy files.

## Steps
If the above is reported (failure to download files) please take the following steps to identify the issue.

### Identify reason file was deleted
- Get file key
  - This can be retrieved from the error message directly, or from API logs (tail logs in AWS and attempt to download)
  - Keep hold of this, you'll need it shortly
- (Optional) Verify the file is not present in the AWS bucket
- Go to AWS > CloudWatch > Log groups > Scanii-Lambda-Callback > Search log group
- Set timeframe if known (will speed up search dramatically - even if set to all events later than session creation data)
- Search for S3 file key (excluding file name)
  - If the full path is `abc12345/my_file.jpg`, search for `abc12345`
  - Searches can have issues with `/` or other characters in the full file path
- Scannii logs will show a reason why the file was deleted

### Update user's passport
- Find user's session in Hasura (`lowcal_sessions` table)
- Copy content of `data` column
- Find breadcrumbs associated with file key
- Remove file slot from the breadcrumb which contains the deleted file
- Paste modified content back into the `data` column and save

### Finally
- Download files again to test - you may need to repeat the above steps multiple times if numerous files have been deleted.


## Future improvements
Clearly this is an imperfect solution. However, this is a rare occurrence so far (2 issues as of April 2025) and relatively simple to troubleshoot. Here's a few ideas on how we could improve this in future - 

 - Once Scanii deletes a file, replace it on S3 with another file describing the issue (e.g. a `.jpg` with the text "This file was deleted due to: X")
 - Once Scanni deleted a file, track this in a PlanX db table
   - Use records here to either update a user's session, or...
   - Check table before fetching files
   - More permissive payload creation - skip failed files and add comment to zip (e.g. a `failures.txt` listing any issues)
   - The zip builder now fails outright rather than silently omitting a file, so a council never receives an incomplete submission. A `failures.txt` would still make sense for permanently deleted files, where retrying can never succeed.
