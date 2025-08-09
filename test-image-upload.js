const fetch = require('node-fetch');

async function testImageUpload() {
  try {
    console.log('Testing image upload API...');
    
    // Test the image upload endpoint with a simple base64 image
    const testImage = {
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      alt: 'Test image',
      position: 1
    };

    const response = await fetch('http://localhost:3002/api/admin/test-image-upload', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Test result:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ API connection test successful');
      console.log('Product ID:', data.productId);
      console.log('Product Title:', data.productTitle);
      console.log('Images Count:', data.imagesCount);
    } else {
      console.log('❌ API connection test failed');
      console.log('Error:', data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testImageUpload(); 