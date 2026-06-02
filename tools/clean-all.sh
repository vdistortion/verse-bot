#!/usr/bin/env bash
set -e

./tools/clean.sh

while read -r pattern; do
  [ -z "$pattern" ] && continue

  for path in $pattern; do
    rm -rf "$path"
  done
done < tools/clean-all.list
