#!/usr/bin/env bash

# abort on errors
set -e

# build
pnpm run build

# navigate into the build output directory
cd dist

# add .nojekyll to bypass GitHub Page's default behavior
touch .nojekyll

git init
git add -A
git commit -m 'deploy'

git push -f git@me.github.com:mr-wildcard/team-ux-elearning.git main:gh-pages

cd -

