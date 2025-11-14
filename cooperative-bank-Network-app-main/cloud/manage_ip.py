import googleapiclient.discovery
import os

def manage_ip(request):
    action = request.args.get('action')  # 'detach' or 'attach'
    project = 'cooperative-bank-network'
    zone = 'us-west1-a'
    instance = 'CoNetX-server'
    ip_address = '34.168.230.178'

    compute = googleapiclient.discovery.build('compute', 'v1')

    if action == 'detach':
        compute.instances().deleteAccessConfig(
            project=project,
            zone=zone,
            instance=instance,
            accessConfig='external-nat',
            networkInterface='nic0'
        ).execute()
        return 'IP detached'
    elif action == 'attach':
        compute.instances().addAccessConfig(
            project=project,
            zone=zone,
            instance=instance,
            body={
                'name': 'external-nat',
                'natIP': ip_address
            },
            networkInterface='nic0'
        ).execute()
        return 'IP attached'
    else:
        return 'Invalid action'

