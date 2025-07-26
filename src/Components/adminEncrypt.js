import CryptoJS from 'crypto-js';

export function encryptData(data) {
    const key = CryptoJS.enc.Utf8.parse('ccabf24af8038b4df19f6bb569b3439e36cd57deb07fff4a1a3256534fd32831');
    const iv = CryptoJS.lib.WordArray.random(16); // add randomness
    const input_data = JSON.stringify(data);
  
  const encrypted = CryptoJS.AES.encrypt(input_data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC
  });
  
  return iv.toString() + ':' + encrypted.toString();
}

export function decryptData(combined) {
  const [ivString, encryptedString] = combined.split(':');
  const key = CryptoJS.enc.Utf8.parse('ccabf24af8038b4df19f6bb569b3439e36cd57deb07fff4a1a3256534fd32831');
  const iv = CryptoJS.enc.Hex.parse(ivString);
  
  const decrypted = CryptoJS.AES.decrypt(encryptedString, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC
  });
  
  return decrypted.toString(CryptoJS.enc.Utf8);
}