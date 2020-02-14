/*
 * Copyright (c) 2020- David Fajardo
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

const { $lx, $px } = require("./lix-main.js");

const help = `
--init                    initial setup if you haven't run lix-cli before
--list                    list all scanned projects
--make [url] [path]       make a new project in the given directory
                          creates a new directory if your path includes
--open [name|index]       open a project by name or index
--refresh                 rescan everything
--help                    print this dialog
--pull                    pull a project
--snapshots               get a list of a project's snapshots
--cli                     open project in a new terminal window
--append [path]           add a project to watched list
--delete                  remove a project from watched list
--config                  get or change your config
--scan [path]             search for projects in given directory
--dirs                    prints your watched directories
--appenddir [path]        adds a directory to watch
--rmdir [path]            removes a directory from watched
`;

if (!$lx.isInit && !process.argv[2] === "--init") {
  console.log(`You must init first!!
${help}`);
  process.exit(0);
}

switch (process.argv[2]) {
  case "--init":
    if (!$lx.isInit) {
      console.log("Initiating...this will take a minute.");
      $lx.init(false, () => {
        console.log("Your projects have been added!");
        process.exit(0);
      });
    } else {
      console.log(
        "You're all set to go. Use --refresh if you want to rescan everything."
      );
      process.exit(0);
    }
    break;
  case "--open":
    if (!process.argv[3] || !$lx.get(process.argv[3])) list();
    else open(process.argv[3]);
    break;
  case "--make":
    if (process.argv[3].endsWith("/"))
      process.argv[3] = process.argv[3].slice(0, -1);

    const dirname = process.argv[3].split("/").pop();
    try {
      $px(dirname).create(process.argv[3], process.argv[4], { auto: true });
    } catch (e) {
      console.error(e);
      throw e;
    }
    break;
  case "--list":
    list(true);
    break;
  case "--refresh":
    console.log("Refreshing...this will take a second.");
    $lx.init(true, () => {
      console.log("Your projects have been rescanned!");
      process.exit(0);
    });
    break;
  case "--pull":
    pull();
    break;
  case "--snapshots":
    snap();
    break;
  case "--cli":
    open_in_terminal();
    break;
  case "--append":
    if (!process.argv[3]) {
      console.error("You must provide a directory path!");
      process.exit(0);
    } else $px(process.argv[3]).append(() => process.exit(0));
    break;
  case "--delete":
    del();
    break;
  case "--config":
    config();
    break;
  case "--scan":
    if (!process.argv[3]) {
      console.log("You must provide a directory path!");
      process.exit(0);
    } else
      $lx.scan(process.argv[3], data => {
        console.log(data);
        process.exit(0);
      });
    break;
  case "--dirs":
    console.log($lx.dirs);
    process.exit(0);
    break;
  case "--appenddir":
    if (!process.argv[3]) {
      console.log("You must provide a directory path!");
      process.exit(0);
    }
    $lx.appendDir(process.argv[3], () => {
      console.log("success!");
      process.exit(0);
    });
    break;
  case "--rmdir":
    if (!process.argv[3]) {
      console.log("You must provide a directory path!");
      process.exit(0);
    }
    $lx.rmDir(process.argv[3], () => {
      console.log("success!");
      process.exit(0);
    });
    break;
  case "--help":
  default:
    console.log(help);
    process.exit(0);
}

function list(stop) {
  const options = $lx.projects
    .map((o, ix) => {
      return `${ix}: ${o.name}`;
    })
    .join("\n");

  if (stop) {
    console.log(options);
    return process.exit(0);
  }
  rl.question(
    `Please select one of the following:

${options}
  `,
    selected => {
      if (selected === "exit") return process.exit(0);
      if (!selected || !$lx.get(selected)) return list();
      return open(selected);
    }
  );
}

function open(file) {
  console.log(
    `Now opening ${file}, please be patient while Electron boots.
Press [ctrl/cmd + c] twice to exit without saving your project.
`
  );
  $px(file).open(() => {
    console.log(`opening ${selected}`);
    process.exit(0);
  });
}

function snap() {
  const options = $lx.projects
    .map((o, ix) => {
      return `${ix}: ${o.name}`;
    })
    .join("\n");

  rl.question(
    `Which project would you like to check for snapshots?

${options}
`,
    ans => {
      $px(ans).getSnapshots(res => {
        console.log(res);
        process.exit(0);
      });
    }
  );
}

function pull() {
  const options = $lx.projects
    .map((o, ix) => {
      return `${ix}: ${o.name}`;
    })
    .join("\n");

  rl.question(
    `Type all to pull all projects or select one:

${options}
`,
    ans => {
      rl.question("Overwrite the old?    Y/N    ", yesno => {
        if (!"yn".includes(yesno.toLowerCase())) return pull();
        const override = yesno.toLowerCase() === "y";
        if (ans === "all") {
          $lx.updateAll(override, res => {
            console.log(res);
            process.exit(0);
          });
        } else {
          $px(ans).update(override, res => {
            console.log(res);
            process.exit(0);
          });
        }
      });
    }
  );
}

function open_in_terminal() {
  const options = $lx.projects
    .map((o, ix) => {
      return `${ix}: ${o.name}`;
    })
    .join("\n");

  rl.question(
    `Which project would you like to open?

${options}
  `,
    ans => {
      $px(ans).openTerminal();
    }
  );
}

function del() {
  const options = $lx.projects
    .map((o, ix) => {
      return `${ix}: ${o.name}`;
    })
    .join("\n");

  rl.question(
    `Which project would you like to remove?

${options}
`,
    ans => {
      $px(ans).delete();
    }
  );
}

function config() {
  rl.question("Change or get your config?    C/G    ", ans => {
    if (!"cg".includes(ans.toLowerCase())) return config();
    if (ans.toLowerCase() === "g") {
      console.log(JSON.stringify($lx.config()));
      return process.exit(0);
    }
    let new_config = {};
    rl.question("New value for text editor?    ", ed => {
      new_config.editor = ed.toString();
      rl.question("New value for terminal?    ", term => {
        new_config.terminal = term.toString();
        rl.question(
          `Commit { "editor": "${ed}", "terminal": "${term}"} ?    Y/N    `,
          yesno => {
            if (yesno.toLowerCase() === "y") {
              $lx.config(new_config, msg => {
                console.log(msg);
                return process.exit(0);
              });
            } else console.log("Changes aborted!");
            return process.exit(0);
          }
        );
      });
    });
  });
}
