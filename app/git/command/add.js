const fs = require("fs");
const path = require("path");
const HashObjectCommand = require("./hash-object.js");
const { normalizeMode } = require("../utils.js");

class AddCommand {
    constructor(filePath) {
        this.filePath = filePath;
        this.indexPath = path.join(process.cwd(), ".git-ritu", "index");
    }

    execute() {
        const filePath = path.resolve(this.filePath);
        if (!fs.existsSync(filePath)) {
            throw new Error(`fatal: pathspec '${this.filePath}' did not match any files`);
        }

        const hashObject = new HashObjectCommand("-w", filePath);
        let hash = "";
        const oldWrite = process.stdout.write;
        process.stdout.write = (str) => { hash = str.trim(); };
        hashObject.execute();
        process.stdout.write = oldWrite;

        const stat = fs.statSync(filePath);
        const entry = {
            ctime: Math.floor(stat.ctimeMs / 1000),
            mtime: Math.floor(stat.mtimeMs / 1000),
            dev: stat.dev,
            ino: stat.ino,
            mode: normalizeMode(stat),
            uid: stat.uid,
            gid: stat.gid,
            fileSize: stat.size,
            sha1: hash,
            path: path.relative(process.cwd(), filePath),
            stagedHash: hash,
            committedHash: null
        };

        let index = { files: [] };
        if (fs.existsSync(this.indexPath)) index = JSON.parse(fs.readFileSync(this.indexPath, "utf-8"));
        if (!index.files) index.files = [];

        const existing = index.files.find(f => f.path === entry.path);
        if (existing) {
            if (existing.stagedHash === entry.stagedHash) {
                console.log(`no changes in ${entry.path}, skipping`);
                return;
            }
            Object.assign(existing, entry);
            console.log(`updated ${entry.path} (sha1: ${entry.stagedHash})`);
        } else {
            index.files.push(entry);
            console.log(`added ${entry.path} (sha1: ${entry.stagedHash})`);
        }

        fs.writeFileSync(this.indexPath, JSON.stringify(index, null, 2));
    }
}

module.exports = AddCommand;
