#!/usr/bin/env bash
set -e

TMP=.tsconfig-lint.json
cat >$TMP <<EOF
{
  "extends": "./tsconfig.json",
  "include": [
EOF
for file in "$@"; do
  echo "    \"$file\"," >> $TMP
done
cat >>$TMP <<EOF
    "**/*.d.ts"
  ]
}
EOF

FILES_WITH_ERRORS=$(tsc --project $TMP --noEmit --skipLibCheck | cut -d '(' -f 1)

for file in "$@"; do
  grep -v "$file"<<<"$FILES_WITH_ERRORS" >/dev/null
done
