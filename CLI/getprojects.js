const shell = require("shelljs");
const projects = require("./projects.json"),
  new_projects = require("./autosearch.js");

let updated_projects = JSON.parse(JSON.stringify(projects));

if (
  !updated_projects["first_created"] ||
  updated_projects["first_created"] === ""
)
  updated_projects["first_created"] = new Date();

if (!updated_projects["os"] || updated_projects["os"] === "")
  updated_projects["os"] = process.platform;

updated_projects["last_updated"] = new Date();
updated_projects["user_projects"] = projects["user_projects"].concat(
  new_projects(process.argv[2])
);

shell.echo(JSON.stringify(updated_projects)).to("projects.json");
