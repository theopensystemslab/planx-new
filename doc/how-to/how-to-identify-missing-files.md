# How to identify and fix missing files

## Context
PlanX allows applicants to upload images alongside their applications. These files are stored on AWS S3. When each file is uploaded, we use Scanii (link) to scan the uploaded files for - 
 - Malware (Malicious, unwanted or otherwise dangerous software)
 - NSFW Images (Detects adult, offensive or otherwise inappropriate images)

Scanii is an AWS application which runs on our AWS accounts, which operated through a Lambda function.

When Scanii detects an image which breaks it's moderation policy the file is deleted from S3. We do not currently subscribe to these events or take further action (e.g. updating the user's breadcrumbs/passport, or logging these events).

As these images are automatically deleted, this can lead to issues when trying to download the application files - the passport will list files which no longer exist on S3 and the request to get the file will fail.

## Steps
If the above is reported (failure to download files) please take the following steps to identify the issue.

### Identify reason file was deleted
- Get file key
  - This can be retrieved from the error message directly, or from API logs (tail logs in AWS and attempt to download)
  - Keep hold of this, you'll need it shortly
- (Optional) Verify the file is not present in the AWS bucket
- Go to AWS > CloudWatch > Log groups > Scanii-Lambda-Callback > Search log group
- Set timeframe if known (will speed up search dramatically - even if set to all events later that session creation data)
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