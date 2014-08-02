#!/bin/bash
cd ../;
git pull;
git submodule foreach git pull;
