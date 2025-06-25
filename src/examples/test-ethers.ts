// Stand-alone Node script to test AaveV3Client
// Run with:  npx ts-node src/examples/test-ethers.ts
import "./fetch-polyfill";
import "reflect-metadata";
import { AaveV3Client } from "../lib/aave-v3";

// User address and CAIP-10 identifier
const ETH_ADDRESS = "0xc7Bfd896cc6A8BF1D09486Dd08f590691b20C2Ff";
const CAIP10 = `eip155:1:${ETH_ADDRESS}`;

async function main() {
  console.log(`Fetching Aave V3 balances for ${ETH_ADDRESS} …`);
  const client = new AaveV3Client();

  try {
    const balances = await client.queryBalances(CAIP10);
    if (balances.length === 0) {
      console.log("No active Aave V3 positions for this address.");
    } else {
      console.table(
        balances.map((b) => ({
          Asset: b.symbol,
          "Net Position": b.netPosition.toString(),
          "Value (USD)": b.valueUSD.toFixed(2),
          "Health Factor": b.healthFactor,
        }))
      );
      console.log("\nRaw JSON:\n", JSON.stringify(balances, null, 2));
    }
  } catch (err) {
    console.error("Error fetching balances:", err);
    process.exit(1);
  }
}

main();
