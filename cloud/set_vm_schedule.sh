#!/bin/bash

# VM and region settings
VM_NAME="CoNetX-server"
ZONE="us-west1-a"
REGION="us-west1"
POLICY_NAME="CoNetX-daily-schedule"

echo "🔍 Checking for existing schedule policies..."
POLICIES=$(gcloud compute instances describe $VM_NAME \
  --zone=$ZONE \
  --format="value(resourcePolicies)" | tr ';' '\n' | grep "resourcePolicies" | awk -F'/' '{print $NF}')

if [ -n "$POLICIES" ]; then
  echo "🧹 Removing attached policies from VM..."
  for POLICY in $POLICIES; do
    echo "→ Detaching $POLICY..."
    gcloud compute instances remove-resource-policies $VM_NAME \
      --zone=$ZONE \
      --resource-policies=$POLICY --quiet

    echo "→ Deleting $POLICY..."
    gcloud compute resource-policies delete $POLICY \
      --region=$REGION --quiet
  done
else
  echo "✅ No existing schedule policies attached."
fi

# Create new unified start/stop schedule
#echo "🕘 Creating new unified start/stop schedule..."
#gcloud compute resource-policies create instance-schedule $POLICY_NAME \
#  --region=$REGION \
#  --vm-start-schedule="30 3 * * *" \
#  --vm-stop-schedule="0 14 * * *" \
#  --timezone=UTC \
#  --description="Start at 9:00 AM IST, stop at 7:30 PM IST daily"

# Attach the new policy to the VM
#echo "🔗 Attaching new schedule policy to VM..."
#gcloud compute instances add-resource-policies $VM_NAME \
#  --zone=$ZONE \
#  --resource-policies=$POLICY_NAME

#echo "✅ Schedule successfully applied to $VM_NAME!"

