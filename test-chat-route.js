// Simple test script to verify /api/chat route works
// Run this AFTER starting the Next.js server: npm run next:dev

const testChatRoute = async () => {
  try {
    console.log('Testing /api/chat route...');
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }]
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.reply) {
      console.log('✅ SUCCESS: Route is working!');
    } else {
      console.log('❌ FAILED: Route returned unexpected response');
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Make sure the Next.js server is running: npm run next:dev');
  }
};

testChatRoute();

