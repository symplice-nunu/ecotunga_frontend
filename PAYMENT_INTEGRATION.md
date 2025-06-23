# Flutterwave Payment Integration

## Overview
This document describes the Flutterwave mobile money payment integration for the EcoTunga waste collection platform.

## Features
- Mobile money payments for Rwanda (MTN, Airtel, etc.)
- Secure payment processing via Flutterwave API
- Real-time payment status updates
- User-friendly payment interface
- **Backend proxy to avoid CORS issues**

## Architecture

### Frontend → Backend → Flutterwave
To avoid CORS issues, the payment flow goes through our backend server:

1. **Frontend** → **Backend API** (`/api/payments/initiate-payment`)
2. **Backend** → **Flutterwave API** (`https://api.flutterwave.com/v3/charges`)
3. **Flutterwave** → **Backend** (response)
4. **Backend** → **Frontend** (response)

## Configuration

### Backend Environment Variables
The payment service uses the following Flutterwave configuration in the backend:

```javascript
const FLUTTERWAVE_API_URL = 'https://api.flutterwave.com/v3';
const FLUTTERWAVE_SECRET_KEY = 'FLWSECK_TEST-4583ca0ecf022faeae1c25051f0ded27-X';
```

**Note:** This is currently using the test secret key. For production, replace with the live secret key.

### Payment Flow
1. User books waste collection service
2. System calculates payment amount based on selected company
3. User proceeds to payment step
4. Frontend calls backend payment API
5. Backend calls Flutterwave mobile money API
6. User receives payment prompt on their phone
7. Payment is processed and confirmed

## API Endpoints

### Backend Payment Endpoints

#### Initiate Payment
- **URL:** `POST /api/payments/initiate-payment`
- **Description:** Initiates mobile money payment via Flutterwave

#### Verify Payment
- **URL:** `GET /api/payments/verify-payment/:transactionId`
- **Description:** Verifies payment status via Flutterwave

#### Test Endpoint
- **URL:** `GET /api/payments/test`
- **Description:** Tests payment API connectivity

### Flutterwave API Endpoints (Backend Only)

#### Payment Initiation
- **URL:** `https://api.flutterwave.com/v3/charges`
- **Method:** POST
- **Type:** `mobile_money_rwanda`

#### Payment Verification
- **URL:** `https://api.flutterwave.com/v3/transactions/{transaction_id}/verify`
- **Method:** GET

## Request Payload

### Frontend to Backend
```javascript
{
  "amount": 5000,
  "phone_number": "0785847049",
  "email": "user@example.com",
  "tx_ref": "ECOTUNGA_1234567890_abc123",
  "consumer_id": "user_id",
  "customer_name": "John Doe",
  "callback_url": "https://ecotunga.com/payment/callback",
  "redirect_url": "https://ecotunga.com/payment/redirect"
}
```

### Backend to Flutterwave
```javascript
{
  "type": "mobile_money_rwanda",
  "amount": 5000,
  "currency": "RWF",
  "phone_number": "0785847049",
  "email": "user@example.com",
  "tx_ref": "ECOTUNGA_1234567890_abc123",
  "callback_url": "https://ecotunga.com/payment/callback",
  "redirect_url": "https://ecotunga.com/payment/redirect",
  "meta": {
    "consumer_id": "user_id",
    "consumer_mac": "92a3-912ba-1192a"
  },
  "customer": {
    "email": "user@example.com",
    "phone_number": "0785847049",
    "name": "John Doe"
  },
  "customizations": {
    "title": "EcoTunga Waste Collection",
    "description": "Payment for waste collection service",
    "logo": "https://ecotunga.com/logo.png"
  }
}
```

## Response Format

### Backend Response
```javascript
{
  "success": true,
  "data": {
    "status": "success",
    "message": "Charge initiated",
    "data": {
      "id": 123456,
      "tx_ref": "ECOTUNGA_1234567890_abc123",
      "flw_ref": "FLW-MOCK-1234567890",
      "amount": 5000,
      "currency": "RWF",
      "status": "pending",
      "payment_type": "mobilemoneyrw",
      "link": "https://checkout.flutterwave.com/v3/hosted/pay/1234567890"
    }
  }
}
```

### Error Response
```javascript
{
  "success": false,
  "message": "Payment initiation failed",
  "error": "Invalid phone number"
}
```

## Error Handling

The payment service includes comprehensive error handling for:
- Network errors
- API errors
- Invalid phone numbers
- Insufficient funds
- Payment timeouts
- CORS issues (resolved via backend proxy)

## Security Considerations

1. **Secret Key Protection:** The Flutterwave secret key is stored in the backend only
2. **HTTPS:** All payment requests should be made over HTTPS
3. **Input Validation:** Phone numbers and amounts are validated before submission
4. **Transaction References:** Unique transaction references are generated for each payment
5. **CORS Protection:** Backend proxy prevents direct frontend access to Flutterwave API

## Testing

### Test Phone Numbers
- MTN: 0785847049
- Airtel: 0735847049

### Test Amounts
- Minimum: 100 RWF
- Maximum: 1,000,000 RWF

### Test Endpoints
```bash
# Test payment API connection
GET http://localhost:5001/api/payments/test

# Test payment initiation
POST http://localhost:5001/api/payments/initiate-payment
```

## Files Modified

### Backend
1. **`routes/paymentRoutes.js`** - Payment API endpoints
2. **`server.js`** - Payment routes mounting

### Frontend
1. **`src/services/paymentService.js`** - Updated to use backend API
2. **`src/pages/Collection.jsx`** - Payment UI integration
3. **`src/test-payment.js`** - Payment testing utility

## Usage

### Initiating Payment (Frontend)
```javascript
import { initiateMobileMoneyPayment } from '../services/paymentService';

const paymentData = {
  amount: 5000,
  phone_number: '0785847049',
  email: 'user@example.com',
  tx_ref: 'ECOTUNGA_1234567890_abc123',
  consumer_id: 'user_id',
  customer_name: 'John Doe'
};

const response = await initiateMobileMoneyPayment(paymentData);
```

### Verifying Payment (Frontend)
```javascript
import { verifyPayment } from '../services/paymentService';

const verification = await verifyPayment(transactionId);
```

### Testing API Connection
```javascript
import { testPaymentAPI } from '../services/paymentService';

const test = await testPaymentAPI();
```

## Production Deployment

Before deploying to production:

1. Replace test secret key with live secret key in backend
2. Update callback and redirect URLs to production domains
3. Test with real mobile money accounts
4. Implement webhook handling for payment notifications
5. Add payment logging and monitoring
6. Set up proper error tracking
7. Ensure backend is accessible from frontend domain

## Troubleshooting

### CORS Issues
- ✅ **Resolved:** Using backend proxy instead of direct frontend calls
- Backend handles all Flutterwave API communication

### Network Errors
- Check backend server is running on port 5001
- Verify Flutterwave API is accessible
- Check internet connectivity

### Payment Failures
- Verify phone number format (Rwanda format)
- Check sufficient funds in mobile money account
- Ensure valid transaction reference

## Support

For Flutterwave API support:
- Documentation: https://developer.flutterwave.com/
- Support: https://support.flutterwave.com/
- API Status: https://status.flutterwave.com/ 