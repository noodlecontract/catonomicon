#!/usr/bin/env bash
# pull data out of ipfs and:
# - store json for convenient local use (assumes `jq`)
# - download image data + store resized 150x150 px copy (assumes `sips`)
# - flatten + turn into csv for upload and sharing in spreadsheets
# - generate data needed for static site
# - precompile search index with ^ data
set -euo pipefail
IFS=$'\n'

max=${1:-20}

# ==========================================
# Download from ipfs
# ==========================================
mkdir -p output_raw
# base_url="cloudflare-ipfs.com/ipfs/QmTbgUFtGbfqPZBdoEk5Hsf3Ap9aZg1LXcgPvJyBz6ex8S"
base_url="https://opensea.mypinata.cloud/ipfs/QmTbgUFtGbfqPZBdoEk5Hsf3Ap9aZg1LXcgPvJyBz6ex8S"
# lots of pomp + circumstance for light parallelism + "only download if entry does not exist or is unrevealed"
seq 1 $max | xargs -P 4 -I {} sh -c "((test ! -e output_raw/{}.json) || grep -q 'placeholder.png' output_raw/{}.json) && (echo 'pulling {}'; curl --silent $base_url/{}.json | jq > output_raw/{}.json) || exit 0";

# ==========================================
# Aggregate single-file output json + csv
# ==========================================
mkdir -p output_agg
jq -c 'select(.name == "CAT" | not)' output_raw/* > output_agg/revealed.json
# best-effort flatten b/c base structure isn't v sheets/csv-friendly
jq '{id: .coven_cats.id, name: .name, description: .description, image: .image} + (.attributes | (map ({ (.trait_type): .value }) | add))' output_agg/revealed.json | jq -s | jq -r '(map(keys) | add | unique) as $cols | map(. as $row | $cols | map($row[.])) as $rows | $cols, $rows[] | @csv' > output_agg/revealed.csv

# ==========================================
# download + minify image data
# ==========================================
lines=`jq -r '[.coven_cats.id, .image] | @tsv' output_agg/revealed.json`

img_base="assets/img/cat"
mkdir -p $img_base
for line in $lines
do
    id=`cut -f 1 -d '	' <<< $line`
    url=`cut -f 2 -d '	' <<< $line`

    # files are ~1-2MB each, so skip download if we already have it
    # would be lovely to do this without writing to disk, but sips doesn't do stdin??
    img_out="${img_base}/${id}.png"
    [[ -e $img_out ]] || (echo "downloading $img_out"; curl --silent $url -o $img_out && (sips -Z 125 $img_out > /dev/null))
done

# ==========================================
# Munge metadata for use in static sites
# ==========================================

# - _data is just used at generation time so a bit more verbose is ok
# - `asset` copy is needed to quickly display results, so sack readability for size
jq '
{
    id: .coven_cats.id,
    name: .name,
    description: .description,
    archetype: .attributes | .[] | select(.trait_type == "Archetype of Power") | .value,
    sun: .attributes | .[] | select(.trait_type == "Sun Sign") | .value,
    moon: .attributes | .[] | select(.trait_type == "Moon Sign") | .value,
    rising: .attributes | .[] | select(.trait_type == "Rising Sign") | .value,
    caprice: .attributes | .[] | select(.trait_type == "Caprice") | .value,
    catastrophe: .attributes | .[] | select(.trait_type == "Catastrophe") | .value,
    caution: .attributes | .[] | select(.trait_type == "Caution") | .value,
    charisma: .attributes | .[] | select(.trait_type == "Charisma") | .value,
    cunning: .attributes | .[] | select(.trait_type == "Cunning") | .value,
    curiosity: .attributes | .[] | select(.trait_type == "Curiosity") | .value,
    attributes: .attributes | map(
        select(.trait_type != "Archetype of Power")
        | select(.trait_type | contains("Sign") | not)
        | select(.display_type == "number" | not)
    )
}
' output_agg/revealed.json | jq -s  > _data/cats.json

jq '
map({
    id: .id,
    n: .name,
    d: .description,
    t: .archetype,
    ss: .sun,
    sm: .moon,
    sr: .rising,
})
| group_by(.id) | map({key: .[0].id|tostring, value: .[0]}) | from_entries
' _data/cats.json | jq -c  > assets/short_cats.json

# ==========================================
# build search index
# ==========================================
node build_index.js
