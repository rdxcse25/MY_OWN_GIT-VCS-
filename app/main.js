const fs = require("fs");
const path = require("path");
const GitClient = require("./git/client.js");

const gitClient = new GitClient();

//commands
const { CatFileCommand, HashObjectCommand, LsTreeCommand, WriteTreeCommand, CommitTreeCommand, AddCommand, CommitCommand, StatusCommand } = require("./git/command");

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
    case "write-tree":
        handleWriteTreeCommand();
        break;

    case "commit-tree":
        handleCommitTreeCommand();
        break;

    case "add":
        handleAddCommand();
        break;
    
    case "commit":
        handleCommitCommand();
        break;

    case "status":
        handleStatusCommand();
        break;

    default:
        throw new Error(`Unknown command ${command}`);
}

function createGitDirectory() {
    const gitDir = path.join(process.cwd(), ".git-ritu");
    fs.mkdirSync(path.join(gitDir, "objects"), { recursive: true });
    fs.mkdirSync(path.join(gitDir, "refs", "heads"), { recursive: true });
    // Create HEAD pointing to main
    fs.writeFileSync(path.join(gitDir, "HEAD"), "ref: refs/heads/main\n");
    // Create empty main branch file
    fs.writeFileSync(path.join(gitDir, "refs", "heads", "main"), "");
    // Create staging area
    fs.writeFileSync(path.join(gitDir, "index"), JSON.stringify({ files: [] }, null, 2));
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
    if (!sha && flag === "--name-only") return;
    if (!sha) {
        sha = flag;
        flag = null;
    }
    const commandLsTree = new LsTreeCommand(flag, sha);
    gitClient.run(commandLsTree);
}

function handleWriteTreeCommand() {
    const commandWriteTree = new WriteTreeCommand();
    gitClient.run(commandWriteTree);
}

function handleCommitTreeCommand() {
    const tree = process.argv[3];;
    const commitSHA = process.argv[5];
    const commitMessage = process.argv[7];


    const commandCommitTree = new CommitTreeCommand(tree, commitSHA, commitMessage);
    gitClient.run(commandCommitTree);
}

function handleAddCommand() {
    const filePath = process.argv[3];
    const commandAdd = new AddCommand(filePath);
    gitClient.run(commandAdd);
}

function handleCommitCommand() {
    const commitMessage = process.argv[4];
    const commandCommit = new CommitCommand(commitMessage);
    gitClient.run(commandCommit);
}

function handleStatusCommand() {
    const commandStatus = new StatusCommand();
    gitClient.run(commandStatus);
}