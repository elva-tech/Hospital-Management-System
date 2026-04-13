import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

console.log('[WHATSAPP SERVICE] MODULE LOADING...');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
        puppeteer: {
            executablePath: '/usr/bin/chromium-browser',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ],
        },
        authTimeoutMs: 60000,
    });

let isReady = false;

client.on('qr', (qr) => {
    console.log('\n[WHATSAPP SETUP] PLEASE SCAN THIS CODE TO LINK YOUR CLINIC PHONE:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n[WHATSAPP STATUS] Client is ready! Automated messaging active.');
    isReady = true;
});

client.on('authenticated', () => {
    console.log('\n[WHATSAPP STATUS] Authenticated successfully.');
});

client.on('auth_failure', (msg) => {
    console.error('\n[WHATSAPP ERROR] Authentication failure:', msg);
});

console.log('[WHATSAPP SERVICE] Initializing client (timeout 60s)...');
try {
    client.initialize().then(() => {
        console.log('[WHATSAPP SERVICE] initialize() call finished.');
    }).catch(err => {
        console.error('[WHATSAPP SERVICE] initialize() error:', err);
    });
} catch (e) {
    console.error('[WHATSAPP SERVICE] Fatal error during initialize:', e);
}

/**
 * sendWhatsAppMessage: Automated backend delivery via bridged WA account
 */
export const sendWhatsAppMessage = async (phone: string, message: string): Promise<void> => {
  if (isReady) {
    try {
      // Clean phone number (remove non-digits, ensure 91 prefix)
      const cleanPhone = phone.replace(/\D/g, '');
      const waId = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      
      await client.sendMessage(`${waId}@c.us`, message);
      console.log(`[REAL WA SENT] Automated msg to +${waId}`);
      return;
    } catch (error) {
      console.error('[WHATSAPP ERROR] Failed to send automated message:', error);
    }
  }

  // Backup / Mock logic (Logs to terminal console for history)
  console.log(`\n================= [NOTIFICATION LOG] =================`);
  console.log(`To: +91${phone}`);
  console.log(`Message:\n${message}`);
  console.log(`Status: ${isReady ? 'Failed (Check logs)' : 'Pending (WA Client Not Ready)'}`);
  console.log(`======================================================\n`);
  
  return new Promise((resolve) => setTimeout(resolve, 500));
};
