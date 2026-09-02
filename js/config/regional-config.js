/**
 * Cliniva — Regional & Compliance Configuration
 * SOLID: Open for extension with new regional compliance rules and templates
 */

export const REGIONAL_CONFIG = {
  sg: {
    country: "Singapore",
    flag: "🇸🇬",
    currency: "SGD",
    currencySymbol: "SGD $",
    dialCode: "+65",
    privacyNotice: "PDPA Compliance Notice: Patient data processed per Singapore Personal Data Protection Act 2012.",
    paymentMethods: ["PayNow QR", "Credit Card (Stripe)", "GrabPay"]
  },
  my: {
    country: "Malaysia",
    flag: "🇲🇾",
    currency: "MYR",
    currencySymbol: "RM",
    dialCode: "+60",
    privacyNotice: "PDPA Compliance Notice: Data governed by Malaysia Personal Data Protection Act 2010.",
    paymentMethods: ["DuitNow QR", "FPX Online Banking", "Touch 'n Go eWallet"]
  },
  id: {
    country: "Indonesia",
    flag: "🇮🇩",
    currency: "IDR",
    currencySymbol: "Rp",
    dialCode: "+62",
    privacyNotice: "Kepatuhan UU PDP No. 27/2022 tentang Perlindungan Data Pribadi.",
    paymentMethods: ["QRIS", "BCA / Mandiri Virtual Account", "GoPay / OVO"]
  }
};

export const DEMO_CREDENTIALS = {
  staff: {
    email: "admin@orchardclinic.sg",
    roles: [
      "Super Admin / Owner",
      "Branch Admin",
      "Receptionist / Front Desk",
      "Practitioner / Doctor / Therapist"
    ]
  },
  patient: {
    demoOtp: "123456"
  }
};

export const NOTIFICATION_TEMPLATES = {
  bookingConfirmed: {
    whatsapp: (booking) =>
      `*Cliniva Official Confirmation*\n\nHi ${booking.patientName || "Amanda Tan"}, your appointment at *${booking.branchName}* is confirmed for *${booking.schedule}* with *${booking.practitionerName}*.\n\nBooking ID: \`${booking.code}\`\nDeposit: ${booking.depositPaid}\n\nTap below to manage:`,
    emailSubject: (booking) => `Confirmed: Appointment at ${booking.branchName} (${booking.code})`
  },
  reminderH24: {
    whatsapp: (booking) =>
      `*Cliniva Reminder (H-24 Hours)*\n\nHi ${booking.patientName}, gentle reminder for your ${booking.serviceName} session tomorrow at ${booking.schedule}. Please arrive 10 minutes early for check-in.`
  },
  reminderH3: {
    whatsapp: (booking) =>
      `*Cliniva Live Reminder (H-3 Hours)*\n\nYour session starts soon at ${booking.schedule}. Room: ${booking.room}. Present your digital QR upon kiosk arrival.`
  }
};
