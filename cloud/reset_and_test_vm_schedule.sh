#!/bin/bash

# VM and region settings
VM_NAME="CoNetX-server"
ZONE="us-west1-a"
REGION="us-west1"
TEST_POLICY="CoNetX-test-now"

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
  done

  echo "🗑️ Deleting policies from region $REGION..."
  for POLICY in $POLICIES; do
    echo "→ Deleting $POLICY..."
    gcloud compute resource-policies delete $POLICY \
      --region=$REGION --quiet
  done
else
  echo "✅ No existing schedule policies attached."
fi

# Calculate UTC times for start and stop
START_UTC=$(date -u -d "+2 minutes" +"%M %H * * *")
STOP_UTC=$(date -u -d "+7 minutes" +"%M %H * * *")

echo "🕘 Creating new test schedule:"
echo "→ Start at: $START_UTC UTC"
echo "→ Stop at:  $STOP_UTC UTC"

gcloud compute resource-policies create instance-schedule $TEST_POLICY \
  --region=$REGION \
  --vm-start-schedule="$START_UTC" \
  --vm-stop-schedule="$STOP_UTC" \
  --timezone=UTC \
  --description="Test start/stop VM in next few minutes"

echo "🔗 Attaching test policy to VM..."
gcloud compute instances add-resource-policies $VM_NAME \
  --zone=$ZONE \
  --resource-policies=$TEST_POLICY

echo "✅ Test schedule applied. Monitor VM status in your log file."

