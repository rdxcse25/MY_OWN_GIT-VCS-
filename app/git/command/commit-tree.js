const { execSync } = require("child_process");
const crypto = require('crypto');
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function getGitUser() {
    try {
        const name = execSync("git config user.name", { encoding: "utf-8" }).trim();
        const email = execSync("git config user.email", { encoding: "utf-8" }).trim();
        return { name, email };
    } catch (err) {
        throw new Error("Error reading Git user config:", err.message);
    }
}

class CommitTreeCommand{
    constructor(tree,parent,message) {
        this.treeSHA = tree;
        this.parentSHA = parent;
        this.message = message;
    }
    execute(){
        const gitUser = getGitUser();
        const author = `${gitUser.name} <${gitUser.email}>`;
        const commitContentBuffer = Buffer.concat([
            Buffer.from(`tree ${this.treeSHA}\n`,"utf-8"),
            Buffer.from(`parent ${this.parentSHA}\n`,"utf-8"),
            Buffer.from(`author ${author} ${Date.now()}\n`,"utf-8"),
            Buffer.from(`committer ${author} ${Date.now()}\n`,"utf-8"),
            Buffer.from(`\n`),
            Buffer.from(`${this.message}\n`,"utf-8")
        ]);
        const commitHeader = `commit ${commitContentBuffer.length}\0`;
        const data = Buffer.concat([
            Buffer.from(commitHeader,"utf-8"),
            commitContentBuffer
        ]);
        const hash = crypto.createHash('sha1').update(data).digest('hex');

        const folder = hash.slice(0, 2);
        const file = hash.slice(2);
        const completeFolderPath = path.join(process.cwd(), ".git", "objects", folder);
        if (!fs.existsSync(completeFolderPath)) {
            fs.mkdirSync(completeFolderPath);
        }
        const compressedData = zlib.deflateSync(data);
        fs.writeFileSync(path.join(completeFolderPath, file), compressedData);
        process.stdout.write(hash + '\n');
    }
}

module.exports = CommitTreeCommand;