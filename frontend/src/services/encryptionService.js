/**
 * Utilise SubtleCrypto (API native du navigateur)
 * Zéro dépendance externe = fonctionne sur tous les navigateurs
 */

/**
 * Génère une clé de chiffrement
 */
export async function generateEncryptionKey() {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
  
  const exported = await window.crypto.subtle.exportKey('jwk', key)
  return JSON.stringify(exported)
}

/**
 * Chiffre les données
 */
export async function encryptData(data, keyString) {
  try {
    const keyData = JSON.parse(keyString)
    const key = await window.crypto.subtle.importKey(
      'jwk',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const plaintext = new TextEncoder().encode(JSON.stringify(data))
    
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintext
    )
    
    return {
      iv: btoa(String.fromCharCode(...iv)),
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
    }
  } catch (error) {
    console.error('Erreur chiffrement:', error)
    throw error
  }
}

/**
 * Déchiffre les données
 */
export async function decryptData(encrypted, keyString) {
  try {
    const keyData = JSON.parse(keyString)
    const key = await window.crypto.subtle.importKey(
      'jwk',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )
    
    const iv = new Uint8Array(atob(encrypted.iv).split('').map(c => c.charCodeAt(0)))
    const ciphertext = new Uint8Array(atob(encrypted.ciphertext).split('').map(c => c.charCodeAt(0)))
    
    const plaintext = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )
    
    const decrypted = new TextDecoder().decode(plaintext)
    return JSON.parse(decrypted)
  } catch (error) {
    console.error('Erreur déchiffrement:', error)
    throw error
  }
}
