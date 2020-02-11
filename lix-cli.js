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

const { $lx, $px } = require("./lix.js");

switch (process.argv[2]) {
  case "--init":
    if (!$lx.isInit) {
      console.log("Initiating...this will take a minute.");
      $lx.init(() => {
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
    try {
      if ($lx.isInit) list(true);
      else {
        console.error("You must run --init first!");
        process.exit(0);
      }
    } catch (e) {
      if (e.match(/SyntaxError: Unexpected token [0-9A-Za-z] in JSON*/)) {
        rl.question(
          "It looks like something has gone wrong in the config. Refresh now to fix this? Y/N",
          yesno => {
            if (
              !"yn".includes(yesno.toLowerCase()) ||
              yesno.toLowerCase() === "n"
            ) {
              console.log("Use --rescan to fix.");
              return process.exit(0);
            }

            console.log("Refreshing...this will take a minute.");
            $lx.init(() => {
              console.log("Your projects have been rescanned!");
              process.exit(0);
            });
          }
        );
      }
    }
    break;
  case "--refresh":
    console.log("Refreshing...this will take a minute.");
    $lx.init(() => {
      console.log("Your projects have been rescanned!");
      process.exit(0);
    });
    break;
  case "--help":
  default:
    console.log(`
--init                    initial setup if you haven't run lix-cli before
--list                    list all scanned projects
--make [path] [url]       make a new project in the given directory
                              creates a new directory if your path includes
--open [name|index]       open a project by name or index
--refresh                 rescan everything
--help                    print this dialog
`);
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
    `Now opening ${file}. Use control/cmd c to exit without saving your project.`
  );
  $px(file).open(() => {
    console.log(`opening ${selected}`);
    process.exit(0);
  });
}
