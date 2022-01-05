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

    const lockFile = "./test/data/up-to-date-package-lock.json";
    const result = await upgrayedd(lockFile);
    const axios = result["axios"];
    expect(axios.outOfDate).to.be.false;
    expect(axios.deprecated).to.be.false;
  });

  it("warns when a package is up to spec but needs updating", async function () {
    this.sandbox.stub(upgrayedd, "fetchPackage").returns({
      "dist-tags": {
        latest: "0.24.3"
      }
    });

    const lockFile = "./test/data/soft-warning-package-lock.json";
    const result = await upgrayedd(lockFile);
    const axios = result["axios"];
    
    expect(axios.outOfDate).to.be.true;
    expect(axios.satisfied).to.be.true;
    expect(axios.deprecated).to.be.false;
  });

  it("warns when a package doesn't meet the version spec");
  it("warns when there is a deprecation");
});