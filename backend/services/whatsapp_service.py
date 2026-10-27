import os
import urllib.parse
import json
from config import Config

try:
    import requests
    _has_requests = True
except ImportError:
    _has_requests = False

class WhatsAppService:
    @staticmethod
    def create_click_to_chat_link(mobile_number: str = None, message: str = "") -> str:
        """
        Generates direct WhatsApp click-to-chat URL.
        If a dummy/placeholder number (e.g. 9876543210) or no number is provided,
        returns a universal WhatsApp share link:
        https://api.whatsapp.com/send?text=<url_encoded_message>
        which opens WhatsApp and allows sending to oneself or any contact without
        'The phone number isn't on WhatsApp' errors.
        """
        clean_num = ''.join(c for c in (mobile_number or '') if c.isdigit())
        encoded_msg = urllib.parse.quote(message)

        # Check for placeholder/dummy seed numbers
        dummy_numbers = {'9876543210', '919876543210', '1234567890', '9999999999', '0000000000', '1111111111'}

        if not clean_num or clean_num in dummy_numbers or len(clean_num) < 10:
            return f"https://api.whatsapp.com/send?text={encoded_msg}"

        if len(clean_num) == 10:
            clean_num = '91' + clean_num

        return f"https://api.whatsapp.com/send?phone={clean_num}&text={encoded_msg}"

    @staticmethod
    def send_whatsapp_message(mobile_number: str, message: str, template_type: str = "custom") -> dict:
        """
        Dispatches WhatsApp notification via Meta WhatsApp Cloud API (if configured),
        and generates an instant Click-to-Chat web URL for immediate testing.
        """
        chat_link = WhatsAppService.create_click_to_chat_link(mobile_number, message)
        api_sent = False
        api_response = None

        # Check for Meta Cloud API credentials
        api_key = Config.WHATSAPP_API_KEY
        phone_id = Config.WHATSAPP_PHONE_NUMBER_ID

        if _has_requests and api_key and phone_id:
            try:
                url = f"https://graph.facebook.com/v19.0/{phone_id}/messages"
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": mobile_number if mobile_number.startswith("+") else f"+91{mobile_number[-10:]}",
                    "type": "text",
                    "text": {"preview_url": True, "body": message}
                }
                res = requests.post(url, headers=headers, json=payload, timeout=5)
                api_sent = (res.status_code in [200, 201])
                api_response = res.json()
            except Exception as e:
                print(f"[WhatsApp API] Cloud API error: {e}")

        print(f"\n[WHATSAPP MESSAGE] To: {mobile_number} | Template: {template_type}")
        try:
            print(f"Message Content:\n{message}")
            print(f"Direct Chat Link: {chat_link}\n")
        except UnicodeEncodeError:
            safe_msg = message.encode('ascii', 'replace').decode('ascii')
            print(f"Message Content:\n{safe_msg}")
            print(f"Direct Chat Link: {chat_link}\n")

        return {
            'success': True,
            'mobile_number': mobile_number,
            'template_type': template_type,
            'message': message,
            'chat_link': chat_link,
            'meta_cloud_api_sent': api_sent,
            'api_response': api_response
        }

    @staticmethod
    def format_slot_booking_msg(farmer_name: str, token_number: str, centre_name: str,
                                booking_date: str, time_slot: str, wait_mins: float, crop: str, qty: float) -> str:
        """
        WhatsApp template for Slot & Token confirmation.
        """
        return (
            f"🌾 *Kisan AI Procurement Confirmation* 🌾\n\n"
            f"Namaskar *{farmer_name}*, your procurement slot is confirmed!\n\n"
            f"📋 *Token Number:* `{token_number}`\n"
            f"🏢 *Procurement Centre:* {centre_name}\n"
            f"📅 *Arrival Date:* {booking_date}\n"
            f"⏰ *Slot Time:* {time_slot}\n"
            f"📦 *Crop Details:* {crop} ({qty} Quintals)\n"
            f"⏳ *Expected Waiting Time:* ~{round(wait_mins)} minutes\n\n"
            f"Please show your QR Code / Token at the gate upon arrival for priority check-in.\n\n"
            f"_Govt. of India - Smart India Hackathon (SIH)_"
        )

    @staticmethod
    def format_shift_alert_msg(farmer_name: str, token_number: str, old_centre: str,
                               new_centre: str, wait_mins: float) -> str:
        """
        WhatsApp template for Centre Rebalancing Shift notice.
        """
        return (
            f"⚠️ *Important: Centre Rebalancing Alert* ⚠️\n\n"
            f"Namaskar *{farmer_name}*,\n"
            f"Due to heavy queue congestion at *{old_centre}*, your token *{token_number}* has been AI-shifted to reduce your waiting time.\n\n"
            f"🆕 *New Centre:* {new_centre}\n"
            f"⏳ *New Estimated Wait:* ~{round(wait_mins)} minutes\n\n"
            f"Your slot reservation and priority remain fully intact. Please proceed to *{new_centre}*.\n\n"
            f"_Agri AI Smart Procurement Network_"
        )

    @staticmethod
    def format_payment_dbt_msg(farmer_name: str, token_number: str, crop: str,
                               qty: float, amount: float, utr: str) -> str:
        """
        WhatsApp template for MSP Direct Benefit Transfer payment.
        """
        return (
            f"💰 *Kisan Samman MSP Payment Receipt* 💰\n\n"
            f"Namaskar *{farmer_name}*, payment for your accepted crop has been initiated!\n\n"
            f"💵 *Amount Credited:* ₹{amount:,.2f}\n"
            f"🌾 *Crop:* {crop} ({qty} Quintals)\n"
            f"🔖 *Token:* {token_number}\n"
            f"🏦 *Transaction UTR:* `{utr}`\n"
            f"Status: *Direct Benefit Transfer (DBT) Success*\n\n"
            f"Thank you for your contribution to the nation's granary!\n\n"
            f"_Department of Agriculture & Farmers Welfare_"
        )
