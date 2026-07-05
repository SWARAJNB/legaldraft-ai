const fs = require('fs');
const path = require('path');

// Helper to manually load env files
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const index = trimmed.indexOf('=');
    if (index === -1) return;
    const key = trimmed.slice(0, index).trim();
    let val = trimmed.slice(index + 1).trim();
    // Remove quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  });
}

// Load env files
loadEnvFile(path.join(__dirname, '../.env'));
loadEnvFile(path.join(__dirname, '../ai.env'));

console.log('\n============================================================');
console.log('         LegalDraft AI — Gemini AI Connectivity Diagnostics');
console.log('============================================================');
console.log(`Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash'}`);
console.log('============================================================\n');

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your_gemini_api_key_here') || apiKey.trim() === '') {
    console.log('❌ Gemini: [SKIPPED] No API key configured in ai.env');
    return false;
  }

  console.log('✨ Testing Gemini connection...');
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' });
    
    const start = Date.now();
    const result = await model.generateContent('Say "hello" and nothing else.');
    const duration = Date.now() - start;
    
    console.log(`✅ Gemini: [SUCCESS] Responded in ${duration}ms: "${result.response.text().trim()}"`);
    return true;
  } catch (err) {
    console.log('❌ Gemini: [FAILED]');
    const errMsg = err.message || '';
    if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('limit')) {
      console.log('   👉 Error: Quota exceeded or rate limit reached.');
      console.log('   👉 Solution: Check your API limits and billing at https://aistudio.google.com/.');
    } else if (errMsg.includes('API key') || errMsg.includes('key') || errMsg.includes('not found') || errMsg.includes('400') || errMsg.includes('403')) {
      console.log('   👉 Error: Invalid API key or key lacks authorization.');
      console.log('   👉 Solution: Re-check the key in your ai.env file or create a new key at https://aistudio.google.com/.');
    } else {
      console.log(`   👉 Error details: ${errMsg}`);
    }
    return false;
  }
}

async function run() {
  try {
    const geminiOk = await testGemini();
    console.log('\n============================================================');
    if (geminiOk) {
      console.log('🎉 Gemini AI Provider is configured correctly and working!');
    } else {
      console.log('💡 Tip: Please configure a valid and active Gemini API key in:');
      console.log(`   ${path.join(__dirname, '../ai.env')}`);
    }
    console.log('============================================================\n');
  } catch (e) {
    console.log(`⚠️  Error during diagnostics execution: ${e.message}`);
  }
}

run();
