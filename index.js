#!/usr/bin/env node

const fs = require("fs").promises;
const semver = require("semver");
const axios = require("axios")
const BASE_NPM_URL = "https://registry.npmjs.org";

const fetchPackage = async (packageName) => {
  const res = await axios.get(`${BASE_NPM_URL}/${packageName}`);
  return res.data;
};

let upgrayedd = async (packageJsonFile, packageLockFile) => {
  const packageJson = JSON.parse(await fs.readFile(packageJsonFile));
  const packageLock = JSON.parse(await fs.readFile(packageLockFile));
  const { dependencies, devDependencies } = packageJson;

  let outdated = [];
  for (let [packageName, versionSpec] of Object.entries(dependencies)) {
    const installedPackage = packageLock.packages[`node_modules/${packageName}`]
    const actualVersion = installedPackage?.version;
    if (!actualVersion) {
      console.log(`Package ${packageName} (${versionSpec}) is not installed yet.`);
      continue;
    }

    const registryData = await fetchPackage(packageName);
    const latestVersion = registryData["dist-tags"].latest;

    let packageResult = {
      packageName,
      versionSpec,
      actualVersion,
      latestVersion,
      outOfDate: semver.lt(actualVersion, latestVersion),
      satisfied: semver.satisfies(actualVersion, versionSpec)
    };

    if (packageSpec.outOfDate) {
      outdated.push(packageSpec);
    }
  }

  if (outdated.length) {
    return outdated;
  } else {
    console.log("All up to date! Take a break.")
    return [];
  }
};

upgrayedd.main = () => {
  const packageJson = "package.json"
  const packageLock = "package-lock.json"
  return upgrayedd(packageJson, packageLock);
}

if (require.main === module) {
  const outdated = upgrayedd();
  for (let package of outdated) {
    console.log(`${package.packageName} (${package.actualVersion}) is out of date!`);
  }
}

exports = module.exports = upgrayedd;
