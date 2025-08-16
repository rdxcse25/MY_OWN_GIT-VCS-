const CatFileCommand = require("./cat-file.js");
const HashObjectCommand = require("./hash-object.js");
const LsTreeCommand = require("./ls-tree.js");
const WriteTreeCommand = require("./write-tree.js");
const CommitTreeCommand = require("./commit-tree.js");
const AddCommand = require("./add.js");
const CommitCommand = require("./commit.js");
const StatusCommand = require("./status.js");


module.exports = {
    CatFileCommand,
    HashObjectCommand,
    LsTreeCommand,
    WriteTreeCommand,
    CommitTreeCommand,
    AddCommand,
    CommitCommand,
    StatusCommand,
}
