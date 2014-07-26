#!/bin/bash
function go_on {
  git add -A .
  git commit -m "$desc"
}
read -p "Commit description: " desc
cd ~/Desktop/website/packages/seed-json/
git submodule foreach git add -A .
git submodule foreach git commit -m "$desc" || :
git submodule foreach git push
cd ~/Desktop/website/
git submodule foreach git add -A .
git submodule foreach git commit -m "$desc" || :
git submodule foreach git push
git add -A .
git commit -m "$desc" || :
git push
