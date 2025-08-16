const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class CommitCommand {
    constructor(message) {
        this.message = message;
    }

    execute() {
        const indexPath = path.join(".git-ritu", "index");
        if (!fs.existsSync(indexPath)) {
            console.log("Nothing to commit, index is empty.");
            return;
        }

        let index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

        const stagedFiles = index.files.filter(f => f.stagedHash && f.stagedHash !== f.committedHash);
        if (stagedFiles.length === 0) {
            console.log("nothing to commit");
            return;
        }

        // Update committedHash for staged files
        stagedFiles.forEach(f => f.committedHash = f.stagedHash);

        // Save commit object
        const commit = { message: this.message, timestamp: new Date().toISOString(), files: stagedFiles };
        const commitHash = crypto.createHash('sha1').update(JSON.stringify(commit)).digest('hex');
        const objectsDir = path.join(".git-ritu", "objects");
        if (!fs.existsSync(objectsDir)) fs.mkdirSync(objectsDir, { recursive: true });
        fs.writeFileSync(path.join(objectsDir, commitHash), JSON.stringify(commit, null, 2));

        fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

        console.log(`[master ${commitHash.slice(0,7)}] ${this.message}`);
        console.log(`${stagedFiles.length} files committed`);
    }
}

module.exports = CommitCommand;
