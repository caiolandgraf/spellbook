#!/usr/bin/env node

/**
 * Script para gerar NEXTAUTH_SECRET seguro
 * 
 * Uso:
 *   node scripts/generate-secret.js
 * 
 * Adicione o output ao seu arquivo .env:
 *   NEXTAUTH_SECRET="output_aqui"
 */

const crypto = require('crypto');

console.log('\n🔐 Gerando NEXTAUTH_SECRET...\n');

const secret = crypto.randomBytes(32).toString('base64');

console.log('Adicione esta linha ao seu arquivo .env:\n');
console.log(`NEXTAUTH_SECRET="${secret}"`);
console.log('\n✅ Secret gerado com sucesso!\n');
