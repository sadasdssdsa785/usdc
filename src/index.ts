import { createRandomWallet } from './module/walletManager';
import { checkUSDCBalance } from './checkBalance';
import { CircleFaucet, NetworkType } from './module/circleFaucet';
import { UserAgentManager } from './module/userAgentManager';
import fs from 'fs/promises';

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface WalletData {
  timestamp: string;
  address: string;
  privateKey: string;
  balance: string;
}

async function saveSuccessfulWallet(wallet: { address: string, privateKey: string }, network: NetworkType, balance: string) {
  const fileName = `${network}_wallets.json`;
  const timestamp = new Date().toISOString();
  
  const walletData: WalletData = {
    timestamp,
    address: wallet.address,
    privateKey: wallet.privateKey,
    balance
  };

  try {
    // Baca file yang ada atau buat array kosong jika file belum ada
    let existingData: WalletData[] = [];
    try {
      const fileContent = await fs.readFile(fileName, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (error) {
      // File belum ada, gunakan array kosong
    }

    // Tambahkan data baru
    existingData.push(walletData);

    // Tulis kembali ke file
    await fs.writeFile(fileName, JSON.stringify(existingData, null, 2));
    console.log(`💾 Wallet info saved to ${fileName}`);
  } catch (error) {
    console.error(`❌ Error saving wallet info to ${fileName}:`, error);
  }
}

async function runFaucet(iteration: number, network: NetworkType): Promise<void> {
  const bot = new CircleFaucet(network);
  const wallet = await createRandomWallet();
  
  console.log(`\n📝 Iteration #${iteration}`);
  console.log(`🌐 Network: ${network}`);
  console.log('🔑 Wallet address:', wallet.address);
  
  try {
    await bot.initialize();
    await bot.selectNetwork();
    await bot.inputWalletAddress(wallet.address);

    console.log('\n⏳ Waiting for transaction to complete...');
    await sleep(5000);

    console.log('💰 Checking balance...');
    const balance = await checkUSDCBalance(wallet.address, network);
    console.log(`✅ Transaction completed! Balance: ${balance} USDC`);

    // Jika balance lebih dari 0, simpan wallet info
    if (Number(balance) > 0) {
      await saveSuccessfulWallet(wallet, network, balance);
    }

  } catch (error) {
    console.error('❌ Error during iteration:', error);
  } finally {
    await bot.close();
  }
}

async function main() {
  let iteration = 1;
  const delayBetweenRuns = 1000; 
  const maxRetries = 3;

  console.log('🤖 Starting bot in headless mode...');
  console.log('⚡ Performance optimizations enabled');
  console.log('🔒 Anti-detection measures active');
  console.log('🎮 GPU acceleration enabled\n');

  while (true) {
    let retryCount = 0;
    
    // Reset user agent tracking setiap 5 iterasi
    if (iteration % 5 === 0) {
      UserAgentManager.resetUsageTracking();
      console.log('🔄 Reset user agent tracking');
    }
    
    // Tentukan network berdasarkan iterasi
    const network: NetworkType = iteration % 2 === 0 ? 'base' : 'unichain';
    
    while (retryCount < maxRetries) {
      try {
        await runFaucet(iteration, network);
        console.log(`\n😴 Waiting ${delayBetweenRuns/500} seconds before next run...\n`);
        await sleep(delayBetweenRuns);
        iteration++;
        break;
      } catch (error) {
        retryCount++;
        console.error(`❌ Error during iteration ${iteration} (Attempt ${retryCount}/${maxRetries}):`, error);
        
        if (retryCount < maxRetries) {
          const waitTime = retryCount * 6000;
          console.log(`🔄 Waiting ${waitTime/1000} seconds before retry...`);
          await sleep(waitTime);
        } else {
          console.log('⚠️ Max retries reached, moving to next iteration...');
          iteration++;
          await sleep(3000);
        }
      }
    }
  }
}

main();