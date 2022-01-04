#!/usr/bin/env node

import { promises as fs } from "fs"
import semver from "semver"
import "core-js/stable";
import "regenerator-runtime/runtime";

const upgrayedd = async () => {
  const fileContents = await fs.readFile("package.json");
  const packageJson = JSON.parse(fileContents);
  console.log(packageJson);
};

if (require.main === module) {
    upgrayedd();
}

export default upgrayedd
