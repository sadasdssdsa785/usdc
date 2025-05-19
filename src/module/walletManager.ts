import { privateKeyToAccount } from 'viem/accounts';
import { generatePrivateKey } from 'viem/accounts';

export interface WalletInfo {
  privateKey: string;
  address: string;
}

/**
 * Generate wallet baru menggunakan private key
 */
export async function createRandomWallet(): Promise<WalletInfo> {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  
  return {
    privateKey: privateKey,
    address: account.address,
  };
}
