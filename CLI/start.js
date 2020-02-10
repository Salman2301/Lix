const spawn = require("child_process").spawn;

function open_project(project) {
  spawn("npx", ["corvid", "open-editor"], { cwd: project });
}

module.exports = open_project;
