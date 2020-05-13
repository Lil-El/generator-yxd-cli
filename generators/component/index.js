"use strict";
const Generator = require("yeoman-generator");
const fs = require("fs-extra");

module.exports = class extends Generator {
  constructor(params, opts) {
    super(params, opts);

    this.dirs = fs.readdirSync(this.destinationPath());
  }

  initializing() {
    this.log();
    this.argument("componentName", { type: String, required: true });
  }

  prompting() {
    const prompts = [
      {
        type: "list",
        name: "dirName",
        message: "select project folder install component:",
        choices: this.dirs,
        default: []
      }
    ];

    return this.prompt(prompts).then(props => {
      this.dirName = props.dirName;
      this.props = props;
    });
  }

  writing() {
    const done = this.async();

    this.fs.copyTpl(
      this.templatePath("./index.vue.ejs"),
      this.destinationPath(
        this.dirName + "/component/" + this.options.componentName + ".vue"
      ),
      { componentName: this.options.componentName }
    );

    done();
  }
};
