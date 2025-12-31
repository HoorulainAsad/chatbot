const fetch = require('node-fetch');

async function testChat() {
    const ports = [3000, 3001];

    for (const port of ports) {
        console.log(`Trying port ${port}...`);
        try {
            const response = await fetch(`http://localhost:${port}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello, are you working?' }]
                })
            });

            if (response.ok) {
                console.log(`Port ${port}: Success! Status ${response.status}`);
                const text = await response.text();
                console.log('Response:', text.substring(0, 100) + '...');
                return;
            } else {
                console.log(`Port ${port}: Failed with status ${response.status}`);
                const text = await response.text();
                console.log('Error body:', text);
            }
        } catch (error) {
            console.log(`Port ${port}: Error connecting - ${error.message}`);
        }
    }
}

testChat();
