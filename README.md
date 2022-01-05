# upgrayedd

![NPM badge](https://img.shields.io/npm/v/@pocuslabs/upgrayedd)
![CircleCI badge](https://img.shields.io/circleci/build/github/pocuslabs/upgrayedd)

Upgrade packages with confidence

## Introduction

This project aims to make package upgrades, specifically npm packages, easier to deal with. The goal is to provide a concise list of things you need to be aware of when upgrading any package that posts release notes to its Github "releases" page. More sources will be added as they come up.

## Usage

You can use `upgrayedd` with `npx` in your project root, where your `package-lock.json` lives:

`npx @pocuslabs/upgrayedd`

Note that the project does not yet support `yarn.lock` files. You can also clone the project if you like, and run it locally, as in:

`node index.js /path/to/package-lock.json`

This will print out a list of deprecations that the script finds, directly to the console. To write to a file, you can use shell redirection for now -- I'll be adding an option for file output later on.

## Tests

There is a rudimentary test suite, which tests the basic functionality of the tool. Use `npm test` to run them.

## Note

This project is under active development as a brand new package and is in extreme flux. Stay tuned for more!

## License

Released under the MIT License. See the LICENSE file for details.
