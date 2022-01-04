const upgrayedd = require("../index");
const expect = require("chai").expect;

describe("upgrayedd", function () {
  it("prints a success message when everything is up to date", function () {
    const packageFile = "./data/up-to-date-package.json";
    const lockFile = "./data/up-to-date-package-lock.json";
    const result = upgrayedd(packageFile, lockFile);
    expect(result).to.be.empty;
  });

  it("warns when a package is up to spec but needs updating");
  it("warns when a package doesn't meet the version spec");
  it("warns when there is a deprecation");
});