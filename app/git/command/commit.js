const fs = require("fs");
const path = require("path");
const WriteTreeCommand = require("./write-tree.js");
const CommitTreeCommand = require("./commit-tree.js");

class CommitCommand {
    constructor(message) {
        this.message = message;
        this.gitDir = path.join(process.cwd(), ".git-ritu");
        this.indexPath = path.join(this.gitDir, "index");
        this.headPath = path.join(this.gitDir, "HEAD");
    }

    execute() {
        // Step 1: Ensure something is staged
        if (!fs.existsSync(this.indexPath)) {
            throw new Error("nothing to commit, working tree clean");
        }

        // Step 2: write-tree to get a tree hash
        const writeTree = new WriteTreeCommand();
        let treeHash = "";
        const oldWrite = process.stdout.write;
        process.stdout.write = (str) => { treeHash = str.trim(); };
        writeTree.execute();
        process.stdout.write = oldWrite;

        if (!treeHash) {
            throw new Error("failed to write tree");
        }

        // Step 3: get parent commit if exists
        let parentHash = null;
        if (fs.existsSync(this.headPath)) {
            parentHash = fs.readFileSync(this.headPath, "utf-8").trim();
        }

        // Step 4: call commit-tree plumbing command
        const commitArgs = [treeHash];
        if (parentHash) commitArgs.push("-p", parentHash);
        commitArgs.push("-m", this.message);

        const commitTree = new CommitTreeCommand(...commitArgs);
        let commitHash = "";
        process.stdout.write = (str) => { commitHash = str.trim(); };
        commitTree.execute();
        process.stdout.write = oldWrite;

        // Step 5: update HEAD
        fs.writeFileSync(this.headPath, commitHash);

        console.log(`[master (root-commit) ${commitHash}] ${this.message}`);
    }
}

module.exports = CommitCommand;
