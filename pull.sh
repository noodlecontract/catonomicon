#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

max=${1:-20}

mkdir -p output_raw
# base_url="cloudflare-ipfs.com/ipfs/QmZeFg4o5brY4DzsG9TAXtai7trKouMA8w5i1J9oAwbMpw"
base_url="https://opensea.mypinata.cloud/ipfs/QmZeFg4o5brY4DzsG9TAXtai7trKouMA8w5i1J9oAwbMpw"
# lots of pomp + circumstance for light parallelism + "only download if entry does not exist or is unrevealed"
seq 1 $max | xargs -P 4 -I {} sh -c "((test ! -e output_raw/{}.json) || grep -q 'placeholder.png' output_raw/{}.json) && (echo 'pulling {}') && (curl --silent $base_url/{}.json | jq > output_raw/{}.json)"

mkdir -p output_agg
jq -c 'select(.name == "CAT" | not)' output_raw/* > output_agg/revealed.json
# best-effort flatten b/c base structure isn't v sheets/csv-friendly
jq '{id: .coven_cats.id, name: .name, description: .description, image: .image} + (.attributes | (map ({ (.trait_type): .value }) | add))' output_agg/revealed.json | jq -s | jq -r '(map(keys) | add | unique) as $cols | map(. as $row | $cols | map($row[.])) as $rows | $cols, $rows[] | @csv' > output_agg/revealed.csv
