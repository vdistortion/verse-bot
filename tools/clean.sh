#!/usr/bin/env bash
set -e

while read -r pattern; do
  [ -z "$pattern" ] && continue

  for path in $pattern; do
    rm -rf "$path"
  done
done < tools/clean.list
