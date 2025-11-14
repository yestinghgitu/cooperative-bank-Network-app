import googleapiclient.discovery
import os

def manage_ip(request):
    action = request.args.get('action')  # 'attach' or 'detach'
    project = 'cooperative-bank-network'
    zone = 'us-west1-a'
    instance = 'CoNetX-server'
    ip_address = '136.118.115.237'

    compute = googleapiclient.discovery.build('compute', 'v1')

    try:
        if action == 'detach':
            compute.instances().deleteAccessConfig(
                project=project,
                zone=zone,
                instance=instance,
                accessConfig='external-nat',
                networkInterface='nic0'
            ).execute()
            return 'IP detached', 200

        elif action == 'attach':
            compute.instances().addAccessConfig(
                project=project,
                zone=zone,
                instance=instance,
                networkInterface='nic0',
                body={
                    'name': 'external-nat',
                    'type': 'ONE_TO_ONE_NAT',
                    'natIP': ip_address
                }
            ).execute()
            return 'IP attached', 200

        else:
            return 'Invalid action', 400

    except Exception as e:
        return f'Error: {str(e)}', 500

