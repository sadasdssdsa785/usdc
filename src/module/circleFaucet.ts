import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { UserAgentManager } from './userAgentManager';
import { FingerprintManager } from './fingerprintManager';
import { CookieManager } from './cookieManager';
import type { Browser, Page } from 'puppeteer';

export type NetworkType = 'unichain' | 'base';

puppeteer.use(StealthPlugin());

class CircleFaucet {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private currentUserAgent: string;
  private networkType: NetworkType;

  constructor(networkType: NetworkType = 'unichain') {
    this.currentUserAgent = UserAgentManager.getRandomUserAgent();
    this.networkType = networkType;
  }

  async initialize(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
      }

      // Update user agent untuk sesi baru
      this.currentUserAgent = UserAgentManager.getRandomUserAgent();
      console.log(`🔄 Using User-Agent: ${this.currentUserAgent.slice(0, 70)}...`);

      this.browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1920, height: 1080 },
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
          '--enable-gpu',
          '--enable-webgl',
          '--ignore-gpu-blacklist',
          '--enable-gpu-rasterization',
          '--enable-zero-copy',
          '--enable-gpu-compositing',
          '--enable-accelerated-2d-canvas',
          '--enable-accelerated-video',
          '--use-gl=desktop',
          '--window-size=1920,1080',
          `--user-agent=${this.currentUserAgent}`
        ],
        executablePath: process.env.NODE_ENV === 'production' ? '/usr/bin/chromium' : process.env.CHROME_PATH
      });

      const context = await this.browser.createBrowserContext();
      this.page = await context.newPage();
      
      await this.page.setCacheEnabled(false);
      
      // Set user agent di level page
      await this.page.setUserAgent(this.currentUserAgent);
      
      // Setup cookies awal
      await CookieManager.generateCookieStorage(this.page);
      
      // Inject device fingerprint
      await FingerprintManager.injectFingerprint(this.page);
      
      // Log fingerprint untuk tracking
      const fingerprint = FingerprintManager.generateFingerprint();
      console.log(`🔐 Device Fingerprint: ${fingerprint.slice(0, 16)}...`);

      await this.page.setViewport({ 
        width: 1920, 
        height: 1080,
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: true
      });

      await this.page.setRequestInterception(true);
      this.page.on('request', (request: any) => {
        if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });

      console.log('🚀 Hardware acceleration enabled');
      console.log('💻 GPU features activated');

    } catch (error) {
      console.error('❌ Error during initialization:', error);
      throw error;
    }
  }

  async selectNetwork(): Promise<void> {
    try {
      if (!this.page) throw new Error('Page not initialized');

      await new Promise(resolve => setTimeout(resolve, getRandomDelay(500, 1500)));

      // Clear dan set cookies baru sebelum load page
      await CookieManager.rotateCookies(this.page);
      
      // Rotate fingerprint sebelum load page
      await FingerprintManager.injectFingerprint(this.page);
      console.log(`🔄 Rotating device fingerprint...`);

      await this.page.goto('https://faucet.circle.com/', { 
        waitUntil: 'networkidle0',
        timeout: 20000 
      });

      // Rotate cookies setelah page load
      await CookieManager.rotateCookies(this.page);

      await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 800)));

      await this.page.waitForSelector('button[id="downshift-0-toggle-button"]', { timeout: 15000 });
      await this.page.click('button[id="downshift-0-toggle-button"]');
      
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 800)));

      await this.page.waitForSelector('.cb-select-list-item', { timeout: 15000 });
      
      // Pilih network berdasarkan networkType
      const networkName = this.networkType === 'unichain' ? 'Unichain Sepolia' : 'Base Sepolia';
      
      await this.page.evaluate((network) => {
        const elements = Array.from(document.querySelectorAll('.cb-select-list-item'));
        const element = elements.find(el => el.textContent?.includes(network));
        if (element) (element as HTMLElement).click();
      }, networkName);

      console.log(`🌐 Selected network: ${networkName}`);
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(500, 1000)));
    } catch (error) {
      console.error('❌ Error during network selection:', error);
      throw error;
    }
  }

  async inputWalletAddress(walletAddress: string): Promise<void> {
    try {
      if (!this.page) throw new Error('Page not initialized');
      
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 800)));

      await this.page.waitForSelector('input[placeholder="Wallet address"]', { timeout: 15000 });
      
      for (const char of walletAddress) {
        await this.page.type('input[placeholder="Wallet address"]', char, { delay: getRandomDelay(10, 50) });
      }
      
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(500, 1300)));

      // Rotate cookies dan fingerprint sebelum submit
      await CookieManager.rotateCookies(this.page);
      await FingerprintManager.injectFingerprint(this.page);
      console.log(`🔄 Rotating device fingerprint before submit...`);

      await this.page.waitForSelector('button[type="submit"]', { timeout: 15000 });
      await this.page.click('button[type="submit"]');
      
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(1000, 2000)));
    } catch (error) {
      console.error('❌ Error during wallet input:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      try {
        // Reset tracking sebelum close
        FingerprintManager.resetTracking();
        await this.browser.close();
        this.browser = null;
        this.page = null;
      } catch (error) {
        console.error('❌ Error closing browser:', error);
      }
    }
  }

  async resetSession(): Promise<void> {
    await this.close();
    await new Promise(resolve => setTimeout(resolve, getRandomDelay(2000, 4000)));
    await this.initialize();
  }
}

export { CircleFaucet };

// Fungsi untuk mendapatkan delay acak
function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
