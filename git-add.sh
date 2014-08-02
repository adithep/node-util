#!/bin/bash
function go_on {
git add -A .
git commit -m "$1" || :
git push
}
read -p "Commit description: " desc
cd ../
git submodule foreach "
  git add -A .;
  git commit -m $desc || :;
  git push;
"
git add -A .;
git commit -m "$desc" || :;
git push;
