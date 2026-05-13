#!/usr/bin/env bash

cd "$1" || exit

rm -f roxy*
repo-add -n -R roxy.db.tar.gz *.pkg.tar.zst