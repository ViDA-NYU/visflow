#!/bin/bash

if [ ! -e ta3ta2_api ]; then
  # clone ta3ta2-api and rename it to remove dash
  #git clone https://gitlab.datadrivendiscovery.org/d3m/ta3ta2-api.git
  git clone d3m:d3m/ta3ta2-api.git
  cd ta3ta2-api
  git checkout master
  cd ..
  mv ta3ta2-api ta3ta2_api
  rm -rf ta3ta2_api/.git
fi

./update-api-proto.sh

# echo "Starting server ..."
# 
# # this might need to be in the background
# python TA3.py
