// contracts/scripts/deploy-to-educhain.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment to EduChain Testnet...");

  try {
    // Get verification key and compute hash
    const vkHash = process.env.VK_HASH;

    // Get zkVerify contract address from environment
    const zkVerifyAddress = process.env.ZKV_CONTRACT_ADDRESS_EDU;
    if (!zkVerifyAddress) {
      throw new Error(
        "ZKV_CONTRACT_ADDRESS_EDU not found in environment variables"
      );
    }
    console.log("ZkVerify Contract Address:", zkVerifyAddress);

    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log(
      "Account balance:",
      (await deployer.provider.getBalance(deployer.address)).toString()
    );

    console.log("Deploying ZkIncomeVerification contract...");

    // Get contract factory using ethers v6 syntax
    const ZkIncomeVerification = await ethers.getContractFactory(
      "ZkIncomeVerification"
    );

    // Deploy contract
    console.log("Deploying with parameters:", {
      zkVerifyAddress,
      vkHash,
    });

    const contract = await ZkIncomeVerification.deploy(zkVerifyAddress, vkHash);
    console.log("Waiting for deployment transaction...");

    // Wait for deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log("ZkIncomeVerification deployed to:", contractAddress);

    // Deploy EduFiLoan contract
    console.log("\nDeploying EduFiLoan contract...");
    const EduFiLoan = await ethers.getContractFactory("EduFiLoan");
    const eduFiLoan = await EduFiLoan.deploy(contractAddress);

    await eduFiLoan.waitForDeployment();
    const eduFiLoanAddress = await eduFiLoan.getAddress();
    console.log("EduFiLoan deployed to:", eduFiLoanAddress);

    // Save deployment information
    const deploymentInfo = {
      network: "edu-chain-testnet",
      zkIncomeVerificationAddress: contractAddress,
      eduFiLoanAddress: eduFiLoanAddress,
      zkVerifyContract: zkVerifyAddress,
      vkHash: vkHash,
      deploymentTime: new Date().toISOString(),
      deployer: deployer.address,
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }

    // Save deployment info to file
    const deploymentPath = path.join(
      deploymentsDir,
      `educhain_testnet_deployment.json`
    );

    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log(`Deployment information saved to ${deploymentPath}`);
    console.log("\nDeployment completed successfully!");

    // Wait for additional confirmations
    console.log("\nWaiting for additional block confirmations...");
    await contract.deploymentTransaction().wait(3);
    await eduFiLoan.deploymentTransaction().wait(3);
    console.log("Contract deployments confirmed with additional blocks!");

    console.log("\n---------------------");
    console.log("VERIFICATION COMMANDS");
    console.log("---------------------");
    console.log(`To verify ZkIncomeVerification contract:`);
    console.log(`npx hardhat verify --network edu-chain-testnet ${contractAddress} ${zkVerifyAddress} ${vkHash}`);
    
    console.log(`\nTo verify EduFiLoan contract:`);
    console.log(`npx hardhat verify --network edu-chain-testnet ${eduFiLoanAddress} ${contractAddress}`);
    
  } catch (error) {
    console.error("\nDeployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });