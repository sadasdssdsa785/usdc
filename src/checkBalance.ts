import { createPublicClient, http } from 'viem';
import { unichainSepolia, baseSepolia } from 'viem/chains';
import { abi } from './abis';
import type { NetworkType } from './module/circleFaucet';

// USDC Contract addresses
const USDC_ADDRESSES = {
  unichain: '0x31d0220469e10c4E71834a79b1f276d740d3768F',
  base: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
} as const;

export async function checkUSDCBalance(walletAddress: string, network: NetworkType = 'unichain'): Promise<string> {
  try {
    const client = createPublicClient({
      chain: network === 'unichain' ? unichainSepolia : baseSepolia,
      transport: http()
    });

    const balance = await client.readContract({
      address: USDC_ADDRESSES[network],
      abi: abi,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`]
    }) as bigint;

    const formattedBalance = Number(balance) / 1e6; // USDC has 6 decimals
    console.log(`\nUSDC Balance for ${walletAddress} on ${network}: ${formattedBalance} USDC\n`);
    return formattedBalance.toString();
  } catch (error) {
    console.error(`Error checking balance on ${network}:`, error);
    throw error;
  }
} 