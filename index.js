#!/usr/bin/env node

const fs = require("fs").promises;
const semver = require("semver");
const axios = require("axios")
const BASE_NPM_URL = "https://registry.npmjs.org";

let upgrayedd = async (packageJsonFile, packageLockFile) => {
  const packageJson = JSON.parse(await fs.readFile(packageJsonFile));
  const packageLock = JSON.parse(await fs.readFile(packageLockFile));
  const { dependencies, devDependencies } = packageJson;

  let packages = Object.entries(dependencies).reduce(async (acc, [packageName, versionSpec]) => {
    const installedPackage = packageLock.packages[`node_modules/${packageName}`]
    const actualVersion = installedPackage?.version;
    if (!actualVersion) {
      console.log(`Package ${packageName} (${versionSpec}) is not installed yet.`);
      return acc;
    }

    const registryData = await upgrayedd.fetchPackage(packageName);
    const latestVersion = registryData["dist-tags"].latest;

    acc[packageName] = {
      packageName,
      versionSpec,
      actualVersion,
      latestVersion,
      outOfDate: semver.lt(actualVersion, latestVersion),
      satisfied: semver.satisfies(actualVersion, versionSpec),
      deprecated: false  // TODO: this will be going away once I get the github API integration up
    };

    return acc;
  }, {});

  return packages;
};

upgrayedd.fetchPackage = async (packageName) => {
  const res = await axios.get(`${BASE_NPM_URL}/${packageName}`);
  return res.data;
};

upgrayedd.main = () => {
  const packageJson = "package.json"
  const packageLock = "package-lock.json"
  return upgrayedd(packageJson, packageLock);
}

if (require.main === module) {
  (async function () {
    const outdated = await upgrayedd();
    for (let package of outdated) {
      console.log(`${package.packageName} (${package.actualVersion}) is out of date!`);
    }
  })()
}

exports = module.exports = upgrayedd;
