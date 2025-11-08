# utils.py
def mask_sensitive_info(data: dict) -> dict:
    """
    Masks sensitive fields like aadhar, pan, mobile, email.
    """
    masked = data.copy()

    if 'aadhar_number' in masked and masked['aadhar_number']:
        masked['aadhar_number'] = masked['aadhar_number'][:4] + "XXXX" + masked['aadhar_number'][-4:]
    
    if 'pan_number' in masked and masked['pan_number']:
        masked['pan_number'] = masked['pan_number'][:3] + "XXXX" + masked['pan_number'][-2:]
    
    if 'mobile_number' in masked and masked['mobile_number']:
        masked['mobile_number'] = masked['mobile_number'][:2] + "XXXXX" + masked['mobile_number'][-2:]
    
    if 'email' in masked and masked['email']:
        parts = masked['email'].split('@')
        if len(parts) == 2:
            name = parts[0]
            domain = parts[1]
            masked_name = name[0] + "****" + name[-1] if len(name) > 2 else "****"
            masked['email'] = f"{masked_name}@{domain}"

    return masked
