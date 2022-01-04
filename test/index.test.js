const upgrayedd = require("../index");
const expect = require("chai").expect;

describe("upgrayedd", function () {
  it("prints a success message when everything is up to date", function () {
    const packageFile = "./data/up-to-date-package.json";
    const lockFile = "./data/up-to-date-package-lock.json";
    const result = upgrayedd(packageFile, lockFile);
    expect(result).to.be.empty;
  });

  it("warns when a package is up to spec but needs updating", function () {
    const packageFile = "./data/soft-warning-package.json";
    const lockFile = "./data/soft-warning-package-lock.json";
    const result = upgrayedd(packageFile, lockFile);
    const expectedResult = [
      {
        packageName: "axios",
        versionSpec: "^0.24.0",
        actualVersion: "0.24.1",
        latestVersion: "0.24.3",
        outOfDate: true,
        satisfied: true,
        deprecated: false
      }
    ];

    expect(result).to.deep.equal(expectedResult);
  });

  it("warns when a package doesn't meet the version spec");
  it("warns when there is a deprecation");
});