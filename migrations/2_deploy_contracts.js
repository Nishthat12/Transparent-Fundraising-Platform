const TransparentCrowdFunding = artifacts.require("TransparentCrowdFunding");

module.exports = function (deployer) {
  deployer.deploy(TransparentCrowdFunding);
};
