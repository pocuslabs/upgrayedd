#!/usr/bin/env node

const fs = require("fs").promises;
const semver = require("semver");
const axios = require("axios")
const BASE_NPM_URL = "https://registry.npmjs.org";

const getPackage = async (packageName) => {
  const res = await axios.get(`${BASE_NPM_URL}/${packageName}`);
  return res.data;
};

const upgrayedd = async () => {
  const fileContents = await fs.readFile("package.json");
  const { dependencies, devDependencies } = JSON.parse(fileContents);

  const outdated = Object.entries(dependencies).filter(async ([packageName, version]) => {
    const registryData = await getPackage(packageName);
    const latestVersion = registryData["dist-tags"].latest;
    if (semver.lt(semver.coerce(version), latestVersion)) {
      return true;
    }
  });

  if (outdated.length) {
    outdated.forEach(([packageName, version]) => {
      console.log(`${packageName} (${version}) is out of date!`);
    });
  } else {
    console.log("All up to date! Take a break.")
  }
};

if (require.main === module) {
    upgrayedd();
}

exports = module.exports = upgrayedd;
