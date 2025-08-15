const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

class CatFileCommand {
    constructor(flag, commitSHA) {
        this.flag = flag;
        this.commitSHA = commitSHA;

    }
    execute() {
        const flag = this.flag;
        const commitSHA = this.commitSHA;
        switch (flag) {
            case "-p": {
                const folder = commitSHA.slice(0, 2);
                const file = commitSHA.slice(2);
                const completePath = path.join(process.cwd(), ".git", "objects", folder, file);

                if (!fs.existsSync(completePath)) {
                    throw new Error(`Not a valid object name ${commitSHA}`);
                }

                const fileContent = fs.readFileSync(completePath);

                const outputBuffer = zlib.inflateSync(fileContent);
                const output = outputBuffer.toString();
                const nullIndex = output.indexOf('\0');
                const content = output.slice(nullIndex + 1);
                process.stdout.write(content);
            }
                break;
        }
    }
}
module.exports = CatFileCommand;