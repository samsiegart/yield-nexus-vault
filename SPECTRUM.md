# Spectrum Pools API

The **Spectrum Pools API** allows you to query DeFi pool information including current APRs and token balances for supported pools across multiple blockchains.

## Base URL

```
https://pools-api.spectrumnodes.com
```

---

## Endpoints

### 1. **Get APR**

Retrieve the current Annual Percentage Rate (APR) for a specified pool on a supported chain.

**Endpoint**:

```
GET /apr
```

**Query Parameters**:

| Parameter | Type   | Required | Description             | Possible Values                                                    |
| --------- | ------ | -------- | ----------------------- | ------------------------------------------------------------------ |
| `chain`   | string | Yes      | Blockchain network name | `ethereum`, `optimism`, `polygon`, `arbitrum`, `base`, `avalanche` |
| `pool`    | string | Yes      | Pool provider name      | `aave`, `compound`                                                 |

**Example**:

```
GET /apr?chain=ethereum&pool=aave
```

---

### 2. **Get Pool Balance**

Retrieve the balance of a wallet address in a specific pool on a supported chain.

**Endpoint**:

```
GET /pool-balance
```

**Query Parameters**:

| Parameter | Type   | Required | Description                  | Possible Values                                                    |
| --------- | ------ | -------- | ---------------------------- | ------------------------------------------------------------------ |
| `chain`   | string | Yes      | Blockchain network name      | `ethereum`, `optimism`, `polygon`, `arbitrum`, `base`, `avalanche` |
| `pool`    | string | Yes      | Pool provider name           | `aave`, `compound`                                                 |
| `address` | string | Yes      | Wallet address (checksummed) | Any valid Ethereum-compatible address                              |

**Example**:

```
GET /pool-balance?pool=compound&chain=base&address=0xdB20A894d2CDEa7F6AA288188f826F18bB2082DD
```

---

## TypeScript Example

Below is a TypeScript snippet demonstrating how to query both endpoints using `fetch`.

```ts
const BASE_URL = "https://pools-api.spectrumnodes.com";

type Chain =
  | "ethereum"
  | "optimism"
  | "polygon"
  | "arbitrum"
  | "base"
  | "avalanche";
type Pool = "aave" | "compound";

/**
 * Fetch APR data for a specific pool and chain.
 */
async function fetchApr(chain: Chain, pool: Pool) {
  const res = await fetch(`${BASE_URL}/apr?chain=${chain}&pool=${pool}`);
  if (!res.ok) throw new Error(`Failed to fetch APR: ${res.statusText}`);
  const data = await res.json();
  console.log("APR Response:", data);
}

/**
 * Fetch pool balance for a wallet address.
 */
async function fetchPoolBalance(chain: Chain, pool: Pool, address: string) {
  const res = await fetch(
    `${BASE_URL}/pool-balance?pool=${pool}&chain=${chain}&address=${address}`
  );
  if (!res.ok)
    throw new Error(`Failed to fetch pool balance: ${res.statusText}`);
  const data = await res.json();
  console.log("Pool Balance Response:", data);
}

// Example usage
fetchApr("ethereum", "aave");
fetchPoolBalance(
  "base",
  "compound",
  "0xdB20A894d2CDEa7F6AA288188f826F18bB2082DD"
);
```

---

## Notes

- Responses are returned in JSON format.
- Ensure that wallet addresses are properly checksummed (EIP-55 format).
- The API supports both `aave` and `compound` pools on major EVM-compatible chains.

## Additional Methods:

You have two methods available:

1. APR
   https://pools-api.spectrumnodes.com/apr?chain=ethereum&pool=aave
2. Pool balance
   https://pools-api.spectrumnodes.com/pool-balance?pool=compound&chain=base&address=0xdB20A894d2CDEa7F6AA288188f826F18bB2082DD
   You can change address, pool and chain
