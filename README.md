# Circle Faucet Bot

Bot otomatis untuk berinteraksi dengan Circle Faucet (https://faucet.circle.com/) menggunakan Bun dan Playwright.

## Fitur

- Otomatisasi pemilihan "Unichain Sepolia" dari dropdown
- Generate wallet address baru setiap kali dijalankan
- Menyimpan informasi wallet ke file JSON
- Screenshot error untuk debugging
- Handling timeout dan visibility issues
- Type-safe dengan TypeScript

## Prasyarat

- [Bun](https://bun.sh) (versi terbaru)
- Node.js (versi 16 atau lebih baru)

## Instalasi

1. Clone repository ini
2. Install dependencies:
```bash
bun install
```

## Penggunaan

1. Jalankan bot:
```bash
bun run start
```

Untuk development dengan hot reload:
```bash
bun run dev
```

## Struktur File

- `src/index.ts` - File utama implementasi bot
- `generated_wallets.json` - File untuk menyimpan informasi wallet yang di-generate
- `package.json` - Konfigurasi proyek dan dependencies

## Konfigurasi

Beberapa opsi yang bisa diubah di kode:

- `headless: false` di `initialize()` - Set `true` untuk menjalankan browser tanpa GUI
- Timeout values di berbagai fungsi bisa disesuaikan sesuai kebutuhan

## Error Handling

- Bot akan mengambil screenshot saat terjadi error dan menyimpannya sebagai `error_screenshot.png`
- Semua error akan di-log ke console dengan prefix ❌
- Successful operations ditandai dengan prefix ✅

## Keamanan

- Private key wallet disimpan secara lokal di `generated_wallets.json`
- Pastikan file tersebut tidak dibagikan atau di-commit ke repository

## Kontribusi

Silakan buat issue atau pull request untuk perbaikan atau peningkatan fitur.

## Lisensi

MIT 