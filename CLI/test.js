const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

const open_project = require("./start.js");

const projects = require("./projects.json")["user_projects"],
  paths = projects.map(o => {
    return JSON.parse(o)["location"];
  }),
  options = projects.map((o, ix) => {
    return `${ix}: ${JSON.parse(o).name}`;
  });

rl.question(
  `Please select a project:

${options.join("\n")}

`,
  chosen => {
    open_project(paths[parseInt(chosen)]);
    process.exit(0);
  }
);
