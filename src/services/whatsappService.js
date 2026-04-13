const sendMessage = async (phone, message) => {
  // In a real application, you would connect to WhatsApp Business API or Twilio here.
  console.log('----------------------------------------');
  console.log(`💬 WHATSAPP MESSAGE SENT TO: ${phone}`);
  console.log(`📄 MESSAGE CONTENT:`);
  console.log(message);
  console.log('----------------------------------------');
  
  return true;
};

module.exports = {
  sendMessage
};
