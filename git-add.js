(function () {
  "use strict";

  var git = require('nodegit'),
      path = require('path'),
      fs = require('fs'),
      fileContent = 'hello world'
      ;

  /**
   * This example creates a certain file `newfile.txt`, adds it to the git index and
   * commits it to head. Similar to a `git add newfile.txt` followed by a `git commit`
  **/

  //open a git repo
  git.Repo.open(path.resolve(__dirname, '../packages/utilities/.git'), function(openReporError, repo) {
    if (openReporError) throw openReporError;

      //add the file to the index...
      repo.openIndex(function(openIndexError, index) {
        if (openIndexError) throw openIndexError;

        index.read(function(readError) {
          if (readError) throw readError;

          index.addByPath(".", function(addByPathError) {
            if (addByPathError) throw addByPathError;

            index.write(function(writeError) {
              if (writeError) throw writeError;

              index.writeTree(function(writeTreeError, oid) {
                if (writeTreeError) throw writeTreeError;

                //get HEAD
                git.Reference.oidForName(repo, 'HEAD', function(oidForName, head) {
                  if (oidForName) throw oidForName;

                  //get latest commit (will be the parent commit)
                  repo.getCommit(head, function(getCommitError, parent) {
                    if (getCommitError) throw getCommitError;
                    var author = git.Signature.create("Adithep SriNarula", "badsxx@gmail.com");
                    var committer = git.Signature.create("Adithep SriNarula", "badsxx@gmail.com");

                    //commit
                    repo.createCommit('HEAD', author, committer, 'message', oid, [parent], function(error, commitId) {
                      console.log("New Commit:", commitId.sha());
                    });
                  });
                });
              });
            });
          });
        });
      });
  });
}());
