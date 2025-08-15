const fs = require("fs");
const path = require("path");
const GitClient = require("./git/client.js");

const gitClient = new GitClient();

//commands
const { CatFileCommand, HashObjectCommand, LsTreeCommand } = require("./git/command");

// You can use print statements as follows for debugging, they'll be visible when running tests.

// Uncomment this block to pass the first stage
const command = process.argv[2];

switch (command) {
    case "init":
        createGitDirectory();
        break;
    case "cat-file":
        handleCatFileCommand(command);
        break;
    case "hash-object":
        handleHashObjectCommand();
        break;
    case "ls-tree":
        handleLsTreeCommand();
        break;

    default:
        throw new Error(`Unknown command ${command}`);
}

function createGitDirectory() {
    fs.mkdirSync(path.join(process.cwd(), ".git"), { recursive: true });
    fs.mkdirSync(path.join(process.cwd(), ".git", "objects"), { recursive: true });
    fs.mkdirSync(path.join(process.cwd(), ".git", "refs"), { recursive: true });

    fs.writeFileSync(path.join(process.cwd(), ".git", "HEAD"), "ref: refs/heads/main\n");
    console.log("Initialized git directory");
}

function handleCatFileCommand() {
    const flag = process.argv[3];
    const commitSHA = process.argv[4];
    const commandCatFile = new CatFileCommand(flag, commitSHA);
    gitClient.run(commandCatFile);
}

function handleHashObjectCommand() {
    let flag = process.argv[3];
    let filePath = process.argv[4];
    if (!filePath) {
        filePath = flag;
        flag = null;
    }
    const commandHashObject = new HashObjectCommand(flag, filePath);
    gitClient.run(commandHashObject);
}

function handleLsTreeCommand() {
    let flag = process.argv[3];
    let sha = process.argv[4];
    if(!sha && flag === "--name-only")return;
    if (!sha) {
        sha = flag;
        flag = null;
    }  
    const commandLsTree = new LsTreeCommand(flag, sha);
    gitClient.run(commandLsTree);
}