import { Protocol } from 'puppeteer';
import crypto from 'crypto';

export class CookieManager {
  private static readonly DOMAINS = [
    'circle.com',
    'faucet.circle.com',
    'www.circle.com'
  ];

  private static readonly PATHS = [
    '/',
    '/faucet',
    '/api',
    '/assets'
  ];

  /**
   * Generate random cookie value
   */
  private static generateRandomValue(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate random expiry date (1-7 hari ke depan)
   */
  private static generateExpiryDate(): number {
    const days = Math.floor(Math.random() * 7) + 1;
    return Date.now() + (days * 24 * 60 * 60 * 1000);
  }

  /**
   * Generate cookie palsu yang terlihat natural
   */
  private static generateFakeCookie(): Protocol.Network.CookieParam {
    const domain = this.DOMAINS[Math.floor(Math.random() * this.DOMAINS.length)];
    const path = this.PATHS[Math.floor(Math.random() * this.PATHS.length)];
    
    // Common cookie names
    const cookieNames = [
      '_ga',
      '_gid',
      'session',
      'csrf',
      'visitor_id',
      'user_pref',
      'theme',
      'lang',
      'region'
    ];
    
    const name = cookieNames[Math.floor(Math.random() * cookieNames.length)];
    
    return {
      name: `${name}_${this.generateRandomValue(8)}`,
      value: this.generateRandomValue(),
      domain: domain,
      path: path,
      expires: this.generateExpiryDate(),
      httpOnly: Math.random() > 0.5,
      secure: true,
      sameSite: 'Lax'
    };
  }

  /**
   * Generate set cookies palsu untuk satu sesi
   */
  static generateFakeCookies(minCount: number = 3, maxCount: number = 7): Protocol.Network.CookieParam[] {
    const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    const cookies: Protocol.Network.CookieParam[] = [];
    
    for (let i = 0; i < count; i++) {
      cookies.push(this.generateFakeCookie());
    }
    
    // Tambah cookie wajib
    cookies.push({
      name: 'circle_session',
      value: this.generateRandomValue(),
      domain: 'faucet.circle.com',
      path: '/',
      expires: this.generateExpiryDate(),
      httpOnly: true,
      secure: true,
      sameSite: 'Lax'
    });
    
    return cookies;
  }

  /**
   * Generate cookie storage untuk puppeteer
   */
  static async generateCookieStorage(page: any): Promise<void> {
    const cookies = this.generateFakeCookies();
    await page.setCookie(...cookies);
  }

  /**
   * Clear semua cookies di page
   */
  static async clearCookies(page: any): Promise<void> {
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await page.deleteCookie();
  }

  /**
   * Rotate cookies - clear lama dan set baru
   */
  static async rotateCookies(page: any): Promise<void> {
    await this.clearCookies(page);
    await this.generateCookieStorage(page);
  }
} 