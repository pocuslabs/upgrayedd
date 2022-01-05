#!/usr/bin/env node

const fs = require("fs").promises;
const semver = require("semver");
const axios = require("axios")
const BASE_NPM_URL = "https://registry.npmjs.org";

const parseLockFile = async (lockFileName) => {
  const rawContents = await fs.readFile(lockFileName);
  const lockFile = JSON.parse(rawContents);
  const { dependencies, devDependencies } = lockFile.packages[""];

  return [lockFile, {
    ...devDependencies,
    ...dependencies
  }];
};

let upgrayedd = async (packageLockFile) => {
  const [lockFile, dependencies] = await parseLockFile(packageLockFile);

  let packages = {};
  for (let [packageName, versionSpec] of Object.entries(dependencies)) {
    const installedPackage = lockFile.packages[`node_modules/${packageName}`]
    const actualVersion = installedPackage?.version;
    if (!actualVersion) {
      console.log(`Package ${packageName} (${versionSpec}) is not installed yet.`);
      continue;
    }

    const registryData = await upgrayedd.fetchPackage(packageName);
    const latestVersion = registryData["dist-tags"].latest;

    packages[packageName] = {
      packageName,
      versionSpec,
      actualVersion,
      latestVersion,
      outOfDate: semver.lt(actualVersion, latestVersion),
      satisfied: semver.satisfies(actualVersion, versionSpec),
      deprecated: false  // TODO: this will be going away once I get the github API integration up
    };
  }

  return packages;
};

upgrayedd.fetchPackage = async (packageName) => {
  const res = await axios.get(`${BASE_NPM_URL}/${packageName}`);
  return res.data;
};

upgrayedd.main = () => {
  const packageLock = "package-lock.json"
  return upgrayedd(packageLock);
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
