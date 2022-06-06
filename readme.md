# catonomicon

An experiment in how far you can get in creating a modest nft fansite / catalog with a static site + smol stack

## Setup + development
- `npm install`
- `npx @11ty/eleventy --serve`

## Updating data as mint progresses
- `pull.sh` to pull latest metadata + images, aggregate for convenience + use in generation, and build search indexes
- `git commit` + merge and Github Pages should Just Work(TM)
