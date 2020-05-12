"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const download = require("download-git-repo");
const path = require("path");
const { stat, unlink, rmdir, readdir } = require("fs").promises;
const ora = require("ora");
const fs = require("fs-extra");
const boxen = require("boxen");
const beeper = require("beeper");
// Const updateNotifier = require("update-notifier");
const pkg = require("../../package.json");

const BOXEN_OPTS = {
  padding: 1,
  margin: 1,
  align: "center",
  borderColor: "yellow",
  borderStyle: "round"
};
const ORA_SPINNER = {
  interval: 80,
  frames: [
    "   ⠋",
    "   ⠙",
    "   ⠚",
    "   ⠞",
    "   ⠖",
    "   ⠦",
    "   ⠴",
    "   ⠲",
    "   ⠳",
    "   ⠓"
  ]
};

module.exports = class extends Generator {
  constructor(params, opts) {
    super(params, opts);

    this.log("constructor");
  }

  /**
   * 检查版本信息
   */
  _checkVersion() {
    this.log();
    this.log("🛠️  Checking your Generator-Yxd-Cli version...");

    let checkResult = false;
    const notifier = updateNotifier({
      pkg,
      updateCheckInterval: 0
    });

    const update = notifier.update;
    if (update) {
      const messages = [];
      messages.push(
        chalk.bgYellow.black(" WARNI: ") +
          "  Generator-Yxd-Cli is not latest.\n"
      );
      messages.push(
        chalk.grey("current ") +
          chalk.grey(update.current) +
          chalk.grey(" → ") +
          chalk.grey("latest ") +
          chalk.green(update.latest)
      );
      messages.push(chalk.grey("Up to date ") + `npm i -g ${pkg.name}`);
      this.log(boxen(messages.join("\n"), BOXEN_OPTS));
      beeper();
      this.log("🛠️  Finish checking your Generator-Yxd-Cli. CAUTION ↑↑", "⚠️");
    } else {
      checkResult = true;
      this.log(
        "🛠️  Finish checking your Generator-Yxd-Cli. OK",
        chalk.green("✔")
      );
    }

    return checkResult;
  }

  initializing() {
    this.log();

    const version = `(v${pkg.version})`;
    const messages = [];
    messages.push(
      `💁 Welcome to use Generator-Webpack-Kickoff ${chalk.grey(version)}   `
    );
    messages.push(
      chalk.yellow(
        "You can create a Webpack/Rollup-based frontend environment."
      )
    );
    messages.push(
      chalk.grey("https://github.com/alienzhou/generator-webpack-kickoff")
    );
    messages.push(
      chalk.grey("https://www.npmjs.com/package/generator-webpack-kickoff")
    );
    this.log(
      boxen(messages.join("\n"), {
        ...BOXEN_OPTS,
        ...{
          borderColor: "green",
          borderStyle: "doubleSingle"
        }
      })
    );
    // This._checkVersion();
  }

  prompting() {
    this.log(
      yosay(
        `Welcome to the superb ${chalk.red("generator-yxd-cli")} generator!`
      )
    );
    this.log();
    this.log("⚙  Basic configuration...");
    const prompts = [
      {
        type: "input",
        name: "dirName",
        message: "input your project folder name:",
        default: "yxd-cli-master",
        validate: async dirName => {
          if (fs.existsSync(dirName) && fs.statSync(dirName).isDirectory) {
            this.log();
            this.log(`'${chalk.red(dirName)}'  directory is already exists！`);
            return false;
          }

          return true;
        }
      },
      {
        type: "input",
        name: "appName",
        message: "input your package.json name:",
        default: "yxd-cli"
      },
      {
        type: "confirm",
        name: "isDownLodash",
        message: "if download loadsh?",
        default: false
      },
      {
        type: "list",
        name: "lists",
        message: "select need install packages:",
        choices: ["bootstrap", "lodash"],
        default: []
      },
      {
        type: "checkbox",
        name: "ckbs",
        message: "select need install packages:",
        choices: ["bootstrap", "lodash"],
        default: []
      },
      {
        type: "confirm",
        name: "someAnswer",
        message: "Would you like to enable this option?",
        default: true
      }
    ];

    return this.prompt(prompts).then(props => {
      this.dirName = props.dirName;
      this.props = props;
    });
  }

  async _removeSync(paths) {
    let statObj = await stat(paths);
    if (statObj.isFile()) {
      await unlink(paths);
    } else {
      let dirs = await readdir(paths);
      dirs = dirs.map(item => this._removeSync(path.join(paths, item)));
      await Promise.all(dirs);
      await rmdir(paths);
    }
  }

  _downloadTemplate() {
    return new Promise((resolve, reject) => {
      const dirPath = this.destinationPath(this.dirName, ".tmp");
      download("Lil-El/Yo-Code-Template", dirPath, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  _walk(filePath, templateRoot) {
    if (fs.statSync(filePath).isDirectory()) {
      fs.readdirSync(filePath).forEach(name => {
        this._walk(path.resolve(filePath, name), templateRoot);
      });
      return;
    }

    const relativePath = path.relative(templateRoot, filePath);
    const destination = this.destinationPath(this.dirName, relativePath);
    this.fs.copyTpl(filePath, destination, {
      appName: this.props.appName
    });
  }

  writing() {
    this.log("⚙  Finish basic configuration.", chalk.green("✔"));
    this.log();
    this.log("📂 Generate the project template and configuration...");
    const done = this.async();

    let spinner = ora({
      text: `Download the template from https://github.com/Lil-El/Yo-Code-Template...`,
      spinner: ORA_SPINNER
    }).start();
    this._downloadTemplate()
      .then(() => {
        spinner.stopAndPersist({
          symbol: chalk.green("   ✔"),
          text: `Finish downloading the template from https://github.com/Lil-El/Yo-Code-Template`
        });

        spinner = ora({
          text: `Copy files into the project folder...`,
          spinner: ORA_SPINNER
        }).start();
        const templateRoot = this.destinationPath(this.dirName, ".tmp");
        this._walk(templateRoot, templateRoot);
        spinner.stopAndPersist({
          symbol: chalk.green("   ✔"),
          text: `Finish copying files into the project folder`
        });

        spinner = ora({
          text: `Clean tmp files and folders...`,
          spinner: ORA_SPINNER
        }).start();
        fs.removeSync(templateRoot); // This._removeSync模拟了removeSync
        spinner.stopAndPersist({
          symbol: chalk.green("   ✔"),
          text: `Finish cleaning tmp files and folders`
        });
        done();
      })
      .catch(err => {
        this.env.error(err);
      });
  }

  install() {
    this.log();
    this.log(
      "📂 Finish generating the project template and configuration.",
      chalk.green("✔")
    );
    this.log();
    this.log("📦 Install dependencies...");
    this.npmInstall(
      this.props.ckbs,
      {},
      {
        cwd: this.destinationPath(this.dirName)
      }
    );
  }

  end() {
    const dir = chalk.green(this.dirName);
    const info = `🎊 Create project successfully! Now you can enter ${dir} and start to code.`;
    this.log("📦 Finish installing dependencies.", chalk.green("✔"));
    this.log();
    this.log(
      boxen(info, {
        ...BOXEN_OPTS,
        ...{
          borderColor: "white"
        }
      })
    );
  }
};
