const crypto = require("crypto");
const fs = require("fs");

function normalizeMode(stat) {
    if (stat.isFile()) return "100644";
    if (stat.isSymbolicLink()) return "120000";
    // Executable check
    if ((stat.mode & 0o111)) return "100755";
    return "100644";
}

function getFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash("sha1").update(content).digest("hex");
}


module.exports = {
    normalizeMode,
    getFileHash,
};