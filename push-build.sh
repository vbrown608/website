#!/bin/bash
set -e

chmod 600 deploy_key
eval `ssh-agent -s`
ssh-add deploy_key

cd _site
git init
git config user.name "Travis CI"
git config user.email "builds@travis-ci.com"

git remote add upstream "git@github.com:vbrown608/certbot-builds.git"
git fetch upstream
git checkout -B $TRAVIS_BRANCH

touch .

git add -A
git commit -m "Build website at ${rev}"
git push -q upstream $TRAVIS_BRANCH
