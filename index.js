#!/usr/bin/env node

const fs = require("fs").promises;
const semver = require("semver");
const axios = require("axios");

const BASE_NPM_URL = "https://registry.npmjs.org";
const GITHUB_BASE_URL = "https://api.github.com";

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
    const deprecations = await upgrayedd.fetchReleases(registryData.repository.url, {
      actualVersion, latestVersion
    });

    packages[packageName] = {
      packageName,
      versionSpec,
      actualVersion,
      latestVersion,
      outOfDate: semver.lt(actualVersion, latestVersion),
      satisfied: semver.satisfies(actualVersion, versionSpec),
      deprecated: deprecations.length > 0,  // TODO: this will be going away once I get the github API integration up
      deprecations
    };
  }

  return packages;
};

upgrayedd.fetchPackage = async (packageName) => {
  const res = await axios.get(`${BASE_NPM_URL}/${packageName}`);
  return res.data;
};

upgrayedd.fetchReleases = async (gitUrl, { actualVersion, latestVersion }) => {
  const gitUrlRegex = new RegExp("github\.com/(.+?)/(.+?).git$");
  const matchResult = gitUrl.match(gitUrlRegex);
  if (!matchResult) { return []; }
  const [totalMatch, owner, repo] = matchResult;

  const releaseURL = `${GITHUB_BASE_URL}/repos/${owner}/${repo}/releases`;
  const releaseRes = await axios.get(releaseURL);

  const releaseData = releaseRes.data;
  if (!releaseData?.length) {
    return [];
  }

  let newerVersions = [];
  for (let release of releaseData) {
    if (semver.coerce(release.name) === actualVersion) {
      break;
    }

    newerVersions.push(release);
  }

  newerVersions.reverse();
  let deprecations = [];
  for (let release of newerVersions) {
    const releaseLines = release.body.split("\r\n");
    for (let line of releaseLines) {
      if (line.match("deprec")) {
        deprecations.push(line);
      }
    }
  }

  return deprecations;
};

upgrayedd.main = () => {
  const packageLock = "package-lock.json"
  return upgrayedd(packageLock);
};

if (require.main === module) {
  (async function () {
    const deprecations = await upgrayedd("package-lock.json");
    for (let [packageName, package] of Object.entries(deprecations)) {
      console.log(`${package.packageName} (${package.actualVersion}) is out of date!`);
      if (package.deprecations?.length) {
        console.log("Deprecations:");
        for (let line of package.deprecations) {
          console.log(line);
        }
      }
    }
  })();
}

exports = module.exports = upgrayedd;
