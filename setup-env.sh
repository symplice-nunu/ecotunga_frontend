#!/bin/bash

# Setup script for Ecotunga Frontend Environment Variables

echo "🔧 Setting up Ecotunga Frontend Environment Variables"
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Create .env file
echo "📝 Creating .env file..."

cat > .env << EOF
# API Configuration
# For production with HTTPS backend (recommended)
REACT_APP_API_URL=https://62.171.173.62/api

# For development with HTTP backend (uncomment if needed)
# REACT_APP_API_URL=http://62.171.173.62/api

# For local development (uncomment if needed)
# REACT_APP_API_URL=http://localhost:5001/api

# Note: Make sure your backend supports HTTPS for production
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Test if your backend supports HTTPS:"
echo "   curl https://62.171.173.62/api/test"
echo ""
echo "2. If HTTPS doesn't work, uncomment the HTTP line in .env"
echo ""
echo "3. For Vercel deployment, add REACT_APP_API_URL to your environment variables"
echo ""
echo "4. Restart your development server:"
echo "   npm start" 