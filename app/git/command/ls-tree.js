const fs = require("fs");
const { type } = require("os");
const path = require("path");
const zlib = require("zlib");

class LSTreeCommand {
    constructor(flag, sha) {
        this.flag = flag;
        this.sha = sha;
    }
    execute() {
        const flag = this.flag;
        const sha = this.sha;
        const folder = sha.slice(0, 2);
        const file = sha.slice(2);
        const folderPath = path.join(process.cwd(), ".git", "objects", folder);
        const filePath = path.join(folderPath, file);
        if (!fs.existsSync(folderPath)) {
            throw new Error(`Not a valid object name ${sha}`);
        }
        if (!fs.existsSync(filePath)) {
            throw new Error(`Not a valid object name ${sha}`);
        }
        const fileContent = fs.readFileSync(filePath);
        const outputBuffer = zlib.inflateSync(fileContent);
        const output = outputBuffer.toString().split('\0');
        const treeContent = output.slice(1).filter(e => e.includes(' '));
        const names = treeContent.map((e) => e.split(' ')[1]);
        if (flag === "--name-only") {
            names.forEach((name) => process.stdout.write(name + '\n'));
        }
        else {
            let i = 0;
            while (outputBuffer[i] !== 0) i++;
            i++;
            while (i < outputBuffer.length) {
                let mode = '';
                while (outputBuffer[i] !== 0x20) {
                    mode += String.fromCharCode(outputBuffer[i++]);
                }
                i++;
                let name = '';
                while (outputBuffer[i] !== 0) {
                    name += String.fromCharCode(outputBuffer[i++]);
                }
                i++;
                const sha_child = outputBuffer.slice(i, i + 20).toString('hex');
                i += 20;
                mode = mode.padStart(6, '0');
                const type = mode.startsWith("40000") ? "tree" : "blob";
                process.stdout.write(`${mode} ${type} ${sha_child}    ${name}\n`);
            }

        }
    }
}

module.exports = LSTreeCommand;