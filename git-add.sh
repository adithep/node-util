function go_on {
  echo -ne "$1 [Y, n]\r"
  read answer
  if [ "$answer" = "n" ]; then
    echo "exit"
    exit 0
  fi
}

function call {
  go_on "$1"
  $1
  echo ""
}

call "cd ~/Desktop/website/packages/utilities"

echo "Type commit message"
read commit_message
call "git add -A ."
call "git commit -m $commit_message"
