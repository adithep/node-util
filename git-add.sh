#!/bin/bash
cd ~/Desktop/website/packages/utilities
git add -A .
read -p "Commit description: " desc
git commit -m "$desc"
