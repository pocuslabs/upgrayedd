#!/usr/bin/env node

const fs = require("fs").promises;
const semver = require("semver");
const axios = require("axios")
const BASE_NPM_URL = "https://registry.npmjs.org";

const getPackage = async (packageName) => {
  console.log(await axios.get(`${BASE_NPM_URL}/${packageName}`))
};

const upgrayedd = async () => {
  const fileContents = await fs.readFile("package.json");
  const { dependencies, devDependencies } = JSON.parse(fileContents);

  for (let [packageName, version] of Object.entries(dependencies)) {
    getPackage(packageName);
  }
};

if (require.main === module) {
    upgrayedd();
}

exports = module.exports = upgrayedd;
