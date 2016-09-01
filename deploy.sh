#!/bin/bash
cd "$(dirname "$0")"
./build.sh

#tar all files
tar -zvcf deploy/newsminute-full.tar.gz --exclude='.git' --exclude='src' --exclude='config' --exclude='deploy' \
  --exclude='.flowconfig' --exclude='.gitignore'  .

scp deploy/newsminute-full.tar.gz chad@yak.ai:~/sites/news-minute/deploy/

#ssh
ssh -t -t chad@yak.ai << THATSIT
rm -rf ~/sites/news-minute/dist
rm -rf ~/sites/news-minute/node_modules
tar -xvf ~/sites/news-minute/deploy/newsminute-full.tar.gz -C ~/sites/news-minute/
cd ~/sites/news-minute
forever stop news-minute || true
forever start -a --uid "news-minute" dist/app.js 1998
exit
THATSIT
