const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class StatusCommand {
    execute() {
        console.log("On branch master\n");

        const indexPath = path.join(".git-ritu", "index");
        let index = { files: [] };
        if (fs.existsSync(indexPath)) index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

        const allFiles = this.getAllFiles(process.cwd())
            .filter(f => !f.startsWith(".git") && !f.startsWith(".git-ritu"));

        const staged = [];
        const modified = [];
        const untracked = [];

        allFiles.forEach(f => {
            const entry = index.files.find(e => e.path === f);
            const currentHash = this.hashFile(path.join(process.cwd(), f));

            if (!entry) {
                untracked.push(f);
            } else if (entry.stagedHash && entry.stagedHash !== entry.committedHash) {
                staged.push(f);
            } else if (currentHash !== entry.committedHash) {
                modified.push(f);
            }
        });

        if (staged.length > 0) {
            console.log("Changes to be committed:");
            staged.forEach(f => console.log("\t" + f));
            console.log();
        } else {
            console.log("No changes to be committed\n");
        }

        if (modified.length > 0) {
            console.log("Changes not staged for commit:");
            modified.forEach(f => console.log("\t" + f));
            console.log();
        }

        if (untracked.length > 0) {
            console.log("Untracked files:");
            untracked.forEach(f => console.log("\t" + f));
        } else {
            console.log("No untracked files");
        }
    }

    getAllFiles(dir) {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) results = results.concat(this.getAllFiles(filePath));
            else results.push(path.relative(process.cwd(), filePath));
        });
        return results;
    }

    hashFile(filePath) {
        if (!fs.existsSync(filePath)) return "";
        const data = fs.readFileSync(filePath);
        return crypto.createHash('sha1').update(data).digest('hex');
    }
}

module.exports = StatusCommand;
