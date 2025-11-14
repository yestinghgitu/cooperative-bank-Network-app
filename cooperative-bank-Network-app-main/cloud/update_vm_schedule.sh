#!/bin/bash

# VM and region settings
VM_NAME="CoNetX-server"
ZONE="us-west1-a"
REGION="us-west1"

# Old policy names
OLD_START="CoNetX-start-test-now"
OLD_STOP="CoNetX-stop-test-now"

# New policy names
NEW_START="CoNetX-start-daily"
NEW_STOP="CoNetX-stop-daily"

echo "🔄 Removing old resource policies from VM..."
gcloud compute instances remove-resource-policies $VM_NAME \
  --zone=$ZONE \
  --resource-policies=$OLD_START

gcloud compute instances remove-resource-policies $VM_NAME \
  --zone=$ZONE \
  --resource-policies=$OLD_STOP

echo "🗑️ Deleting old resource policies..."
gcloud compute resource-policies delete $OLD_START --region=$REGION
gcloud compute resource-policies delete $OLD_STOP --region=$REGION

echo "🕘 Creating new start schedule for 9:00 AM IST (3:30 AM UTC)..."
gcloud compute resource-policies create instance-schedule $NEW_START \
  --region=$REGION \
  --vm-start-schedule="30 3 * * *" \
  --timezone=UTC \
  --description="Start $VM_NAME at 9:00 AM IST daily"

echo "🕢 Creating new stop schedule for 7:30 PM IST (2:00 PM UTC)..."
gcloud compute resource-policies create instance-schedule $NEW_STOP \
  --region=$REGION \
  --vm-stop-schedule="0 14 * * *" \
  --timezone=UTC \
  --description="Stop $VM_NAME at 7:30 PM IST daily"

echo "🔗 Attaching new policies to VM..."
gcloud compute instances add-resource-policies $VM_NAME \
  --zone=$ZONE \
  --resource-policies=$NEW_START,$NEW_STOP

echo "✅ Schedule update complete!"

