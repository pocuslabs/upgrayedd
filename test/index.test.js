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

  it("warns when a package doesn't meet the version spec", async function () {
    this.sandbox.stub(upgrayedd, "fetchPackage").returns({
      "dist-tags": {
        latest: "1.1.2"
      }
    });

    const lockFile = "./test/data/hard-warning-package-lock.json";
    const result = await upgrayedd(lockFile);
    const axios = result["axios"];
    
    expect(axios.outOfDate).to.be.true;
    expect(axios.satisfied).to.be.false;
    expect(axios.deprecated).to.be.false;
  });

  it("warns when there is a deprecation", async function () {
    this.sandbox.stub(upgrayedd, "fetchPackage").returns({
      repository: {
        url: "git+https://github.com/pocuslabs/upgrayyed.git"
      },
      "dist-tags": {
        latest: "1.0.1"
      }
    });

    this.sandbox.stub(upgrayedd, "fetchReleases").returns([
      "Deprecated: sifting through release logs by hand"
    ]);

    const lockFile = "./test/data/hard-warning-package-lock.json";
    const result = await upgrayedd(lockFile);
    const axios = result["axios"];
    
    expect(axios.outOfDate).to.be.true;
    expect(axios.satisfied).to.be.false;
    expect(axios.deprecated).to.be.true;
    expect(axios.deprecations.length).to.equal(1);
  });
});