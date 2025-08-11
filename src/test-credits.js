// Simple test to verify credit system
console.log('Testing Credit System...');

// Test guest credits
localStorage.clear();

// Should have 1 credit initially
console.log('Initial guest credits:', localStorage.getItem('fresherhub_guest_credit') ? 0 : 1);

// Use guest credit
localStorage.setItem('fresherhub_guest_credit', 'used');
const resetTime = new Date(Date.now() + 3 * 60 * 60 * 1000);
localStorage.setItem('fresherhub_guest_reset', resetTime.toISOString());

console.log('After using credit:', localStorage.getItem('fresherhub_guest_credit') ? 0 : 1);
console.log('Reset time:', new Date(localStorage.getItem('fresherhub_guest_reset')).toLocaleTimeString());

// Test reset
localStorage.setItem('fresherhub_guest_reset', new Date(Date.now() - 1000).toISOString());
const now = new Date();
const reset = new Date(localStorage.getItem('fresherhub_guest_reset'));

if (now >= reset) {
  localStorage.removeItem('fresherhub_guest_credit');
  localStorage.removeItem('fresherhub_guest_reset');
  console.log('Credits reset! Available:', 1);
}

console.log('Credit system test complete!');