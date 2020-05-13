# generator-yxd-cli

## Useage

- 通过 npm link 或将该 depo 发布到 npm 上
- node 的全局上拥有 generator-yxd-cli 包
- yo yxd-cli(:component \<componentName\>) 构建项目(component 模块)

## Sub-Generator

- 在 app 同级的目录下，可以添加其他目录（sub-generator）
- 执行 yo yxd-cli:component Header；执行 component/index.js
- 执行 yo yxd-cli；执行 app/index.js

## Function

- 根据 ejs，动态传入 ejs 需要的变量
- 选择 checkbox 的包，进行下载
- 对 template 的 deps 进行下载
- 从 git 仓库中获取模板
- 在已存在的 folder 中，添加 component 模块

参考地址：https://github.com/alienzhou/generator-webpack-kickoff/blob/master/generators/app/index.js
