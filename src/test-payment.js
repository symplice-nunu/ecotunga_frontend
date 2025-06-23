// Test file for Flutterwave payment integration
import { initiateMobileMoneyPayment, testPaymentAPI } from './services/paymentService';

// Test payment data
const testPaymentData = {
  amount: 100, // RWF 100
  phone_number: '0790855945', // Test phone number
  email: 'test@ecotunga.com',
  tx_ref: `TEST_${Date.now()}`,
  consumer_id: 'test_user_123',
  customer_name: 'Test User',
  callback_url: 'https://ecotunga.com/payment/callback',
  redirect_url: 'https://ecotunga.com/payment/redirect'
};

// Test the payment API connection
const testPaymentAPIConnection = async () => {
  try {
    console.log('Testing payment API connection...');
    
    const response = await testPaymentAPI();
    console.log('Payment API test response:', response);
    
    if (response.success) {
      console.log('✅ Payment API is working!');
      console.log('Configuration:', response.config);
    } else {
      console.log('❌ Payment API test failed:', response.message);
    }
  } catch (error) {
    console.error('❌ Payment API test error:', error);
    console.error('Error details:', error.response?.data);
  }
};

// Test the payment initiation
const testPayment = async () => {
  try {
    console.log('Testing Flutterwave payment integration...');
    console.log('Payment data:', testPaymentData);
    
    const response = await initiateMobileMoneyPayment(testPaymentData);
    console.log('Payment response:', response);
    
    if (response.success && response.data) {
      console.log('✅ Payment initiated successfully!');
      console.log('Transaction reference:', response.data.tx_ref);
      
      // Check for CAPTCHA redirect
      if (response.data.meta && response.data.meta.authorization && response.data.meta.authorization.redirect) {
        console.log('🔐 CAPTCHA verification required');
        console.log('Redirect URL:', response.data.meta.authorization.redirect);
        console.log('📱 Instructions:');
        console.log('1. You will be redirected to a secure verification page');
        console.log('2. Enter the OTP sent to your phone via SMS/WhatsApp');
        console.log('3. Complete the CAPTCHA verification if prompted');
        console.log('4. Payment will be processed after verification');
        
        // Optionally redirect to CAPTCHA page
        const shouldRedirect = confirm('Do you want to proceed to the CAPTCHA verification page?');
        if (shouldRedirect) {
          window.location.href = response.data.meta.authorization.redirect;
        }
      } else if (response.data.link) {
        console.log('🔗 Direct payment link:', response.data.link);
      } else {
        console.log('📱 Check your phone for SMS prompt');
      }
    } else {
      console.log('❌ Payment initiation failed:', response.message);
    }
  } catch (error) {
    console.error('❌ Payment test error:', error);
    console.error('Error details:', error.response?.data);
  }
};

// Test different phone number formats
const testPhoneFormats = async () => {
  const phoneNumbers = [
    '0790855945',
    '+250790855945',
    '0785847049',
    '+250785847049'
  ];
  
  console.log('Testing different phone number formats...');
  
  for (const phone of phoneNumbers) {
    try {
      const testData = { ...testPaymentData, phone_number: phone };
      console.log(`Testing phone: ${phone}`);
      
      const response = await initiateMobileMoneyPayment(testData);
      console.log(`✅ ${phone}: Success`);
      console.log('Response:', response.data);
    } catch (error) {
      console.log(`❌ ${phone}: Failed - ${error.response?.data?.message || error.message}`);
    }
  }
};

// Export test functions
export {
  testPaymentAPIConnection,
  testPayment,
  testPhoneFormats,
  testPaymentData
};

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
  console.log('🧪 Payment Integration Test Suite');
  console.log('Available tests:');
  console.log('- testPaymentAPIConnection()');
  console.log('- testPayment()');
  console.log('- testPhoneFormats()');
  console.log('');
  console.log('💡 Tip: In sandbox mode, you may not receive real SMS.');
  console.log('   Instead, you will be redirected to a CAPTCHA verification page.');
  console.log('   This is normal for testing purposes.');
} 