const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

class HashObjectCommand{
    constructor(flag, filePath) {
        this.flag = flag;
        this.filePath = filePath;
    }
    execute(){
        const filePath = path.resolve(this.filePath);
        if(!fs.existsSync(filePath)){
            throw new Error(`could not open ${filePath} for reading: No such file or directory`);
        }
        const fileContent = fs.readFileSync(filePath);
        const fileLength = fileContent.length;
        const header = `blob ${fileLength}\0`;
        const blob = Buffer.concat([Buffer.from(header), fileContent]);
        const hash = crypto.createHash("sha1").update(blob).digest("hex");
        if(this.flag && this.flag === "-w"){
            const folder = hash.slice(0,2);
            const file = hash.slice(2);
            const completeFolderPath = path.join(process.cwd(), ".git-ritu", "objects", folder);
            if(!fs.existsSync(completeFolderPath)){
                fs.mkdirSync(completeFolderPath);
            }
            const compressedData = zlib.deflateSync(blob);
            fs.writeFileSync(path.join(completeFolderPath, file), compressedData); 
        }
        process.stdout.write(hash);
    }
}
 
module.exports = HashObjectCommand;