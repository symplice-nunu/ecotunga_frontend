# API Configuration Guide

## Problem
Your frontend is deployed on HTTPS (Vercel) but trying to connect to an HTTP backend, which causes mixed content errors.

## Solution

### Option 1: Set up HTTPS for your backend (Recommended)

1. **Set up SSL certificate for your backend server**
   - Use Let's Encrypt for free SSL certificates
   - Or use a reverse proxy like Nginx with SSL termination

2. **Update your backend to support HTTPS**
   - Install SSL certificates
   - Configure your server to listen on HTTPS port (443)

### Option 2: Configure Frontend Environment Variables

1. **Create a `.env` file in the frontend root directory:**
   ```bash
   cd ecotunga_frontend
   ```

2. **Add the following to your `.env` file:**
   ```env
   # For production with HTTPS backend (recommended)
   REACT_APP_API_URL=https://62.171.173.62/api
   
   # For development with HTTP backend
   # REACT_APP_API_URL=http://62.171.173.62/api
   
   # For local development
   # REACT_APP_API_URL=http://localhost:5001/api
   ```

3. **Redeploy your frontend to Vercel**

### Option 3: Use a Reverse Proxy (Quick Fix)

Set up a reverse proxy service like Cloudflare or Nginx to provide HTTPS for your HTTP backend.

## Environment Variables

The frontend now supports the following environment variables:

- `REACT_APP_API_URL`: The base URL for your API
- `NODE_ENV`: Automatically set by React (development/production)

## Testing

1. **Test HTTPS connection:**
   ```bash
   curl https://62.171.173.62/api/test
   ```

2. **Test HTTP connection:**
   ```bash
   curl http://62.171.173.62/api/test
   ```

## Deployment Steps

1. **For Vercel deployment:**
   - Add environment variables in Vercel dashboard
   - Set `REACT_APP_API_URL` to your HTTPS backend URL
   - Redeploy the application

2. **For local development:**
   - Create `.env` file with local API URL
   - Restart the development server

## Troubleshooting

### Mixed Content Error
- Ensure your backend supports HTTPS
- Check that `REACT_APP_API_URL` uses HTTPS in production
- Verify SSL certificate is valid

### CORS Issues
- Update your backend CORS configuration to allow your frontend domain
- Add your Vercel domain to allowed origins

### Network Errors
- Check if your backend server is running
- Verify the API URL is correct
- Test API endpoints directly with curl 