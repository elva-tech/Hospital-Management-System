const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client;
let isReady = false;

const initWhatsApp = () => {
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
    });

    client.on('qr', (qr) => {
        console.log('\n======================================================');
        console.log('📱 SCAN THIS QR CODE WITH CLINIC WHATSAPP APP');
        console.log('======================================================');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('\n✅ WHATSAPP CLIENT IS READY! Service is active.');
        isReady = true;
    });

    client.on('auth_failure', () => {
        console.error('❌ WHATSAPP AUTHENTICATION FAILED');
    });

    console.log('Initializing WhatsApp Client...');
    client.initialize().catch(err => {
        console.error('WhatsApp Init Error:', err);
    });
};

const sendMessage = async (phone, message, pdfBuffer = null) => {
    if (!isReady || !client) {
        console.log('⚠️ WhatsApp Client not ready. Simulator fallback:');
        console.log(`[SIMULATED] To ${phone}: ${message}`);
        return false;
    }

    try {
        const defaultCountryCode = '91'; // Configurable country code
        let formattedPhone = phone.toString().replace(/\D/g, '');
        if (formattedPhone.length === 10) formattedPhone = `${defaultCountryCode}${formattedPhone}`;
        
        const chatId = `${formattedPhone}@c.us`;
        
        if (pdfBuffer) {
            const media = new MessageMedia('application/pdf', pdfBuffer.toString('base64'), 'Clinic_Receipt.pdf');
            await client.sendMessage(chatId, message, { media });
            console.log(`✅ WhatsApp message with PDF sent to ${phone}`);
        } else {
            await client.sendMessage(chatId, message);
            console.log(`✅ WhatsApp message sent to ${phone}`);
        }
        return true;
    } catch (error) {
        console.error(`❌ Failed to send WhatsApp to ${phone}:`, error);
        return false;
    }
};

module.exports = {
    initWhatsApp,
    sendMessage
};
