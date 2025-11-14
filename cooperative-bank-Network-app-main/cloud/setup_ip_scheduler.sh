#!/bin/bash

# Settings
PROJECT_ID="cooperative-bank-network"
REGION="us-west1"
FUNCTION_URL="https://us-west1-cooperative-bank-network.cloudfunctions.net/manage-ip"
TIMEZONE="Asia/Kolkata"

# Create Cloud Scheduler job to ATTACH IP at 9:00 AM IST (03:30 UTC)
echo "📅 Creating job to ATTACH IP at 9:00 AM IST..."
gcloud scheduler jobs create http attach-ip-job \
  --location=$REGION \
  --schedule="30 3 * * *" \
  --uri="$FUNCTION_URL?action=attach" \
  --http-method=GET \
  --time-zone=$TIMEZONE \
  --project=$PROJECT_ID

# Create Cloud Scheduler job to DETACH IP at 7:30 PM IST (14:00 UTC)
echo "📅 Creating job to DETACH IP at 7:30 PM IST..."
gcloud scheduler jobs create http detach-ip-job \
  --location=$REGION \
  --schedule="0 14 * * *" \
  --uri="$FUNCTION_URL?action=detach" \
  --http-method=GET \
  --time-zone=$TIMEZONE \
  --project=$PROJECT_ID

echo "✅ Cloud Scheduler jobs created successfully!"

