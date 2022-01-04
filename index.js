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
  const packageJson = JSON.parse(await fs.readFile("package.json"));
  const packageLock = JSON.parse(await fs.readFile("package-lock.json"));
  const { dependencies, devDependencies } = packageJson;

  let outdated = [];
  for (let [packageName, versionSpec] of Object.entries(dependencies)) {
    const actualVersion = packageLock.packages[`node_modules/${packageName}`]?.version;
    if (!actualVersion) {
      console.log(`Package ${packageName} (${versionSpec}) is not installed yet.`);
      continue;
    }

    const registryData = await getPackage(packageName);
    console.log("PACKAGE NAME", packageName);
    const latestVersion = registryData["dist-tags"].latest;
    if (semver.lt(actualVersion, latestVersion)) {
      outdated.push({
        packageName,
        versionSpect,
        actualVersion
      });
    }
  }

  if (outdated.length) {
    for (let package of outdated) {
      console.log(`${package.packageName} (${package.actualVersion}) is out of date!`);
    }
  } else {
    console.log("All up to date! Take a break.")
  }
};

if (require.main === module) {
    upgrayedd();
}

exports = module.exports = upgrayedd;
