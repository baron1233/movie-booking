import crcmod

def crc16(payload: str):
    crc16_func = crcmod.mkCrcFun(0x11021, initCrc=0xFFFF, xorOut=0)
    return format(crc16_func(payload.encode("ascii")), "04X")

def generate_promptpay_qr(promptpay_id: str, amount: int):
    payload = (
        "000201010212"
        "29370016A000000677010111"
        f"01130066{promptpay_id}"
        "5802TH"
        f"5406{amount:06d}"
        "6304"
    )
    return payload + crc16(payload)
