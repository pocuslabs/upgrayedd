const expect = require("chai").expect;
const sinon = require("sinon");

const upgrayedd = require("../index");

describe("upgrayedd", function () {
  before(function () {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    this.sandbox.restore();
  });

  it("prints a success message when everything is up to date", async function () {
    this.sandbox.stub(upgrayedd, "fetchPackage").returns({
      "dist-tags": {
        latest: "0.24.0"
      }
    });

    const packageFile = "./test/data/up-to-date-package.json";
    const lockFile = "./test/data/up-to-date-package-lock.json";
    const result = await upgrayedd(packageFile, lockFile);
    expect(result).to.be.empty;
  });

  it("warns when a package is up to spec but needs updating", async function () {
    this.sandbox.stub(upgrayedd, "fetchPackage").returns({
      "dist-tags": {
        latest: "0.24.3"
      }
    });

    const packageFile = "./test/data/soft-warning-package.json";
    const lockFile = "./test/data/soft-warning-package-lock.json";
    const result = await upgrayedd(packageFile, lockFile);
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