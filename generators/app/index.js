"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const download = require("download-git-repo");
const fs = require("fs");
const path = require("path");
const { stat, unlink, rmdir, readdir } = require("fs").promises;

module.exports = class extends Generator {
  prompting() {
    this.log(
      yosay(
        `Welcome to the superb ${chalk.red("generator-yxd-cli")} generator!`
      )
    );

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
    const done = this.async();
    this._downloadTemplate()
      .then(async () => {
        const templateRoot = this.destinationPath(this.dirName, ".tmp");
        this._walk(templateRoot, templateRoot);
        await this._removeSync(templateRoot);
        done();
      })
      .catch(err => {
        this.env.error(err);
      });
  }

  install() {
    this.npmInstall(
      this.props.ckbs,
      {},
      {
        cwd: this.destinationPath(this.dirName)
      }
    );
  }
};
