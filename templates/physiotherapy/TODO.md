# Translation Consistency Fix - TODO

Goal: Eliminate mixed EN/ID language and make translations consistent.

## Steps
- [x] Analyze codebase (i18n.js + all views/components)
- [x] Fix first batch of `id` dict entries (nav.bookNow, nav.myBookings, nav.bookingsSm, admin.newAppointment)
- [ ] Add missing i18n keys (booking.summaryTitle, summaryStartingPrice, booking.service, booking.consult60, booking.taxesIncluded, booking.cancelPolicy)
- [ ] Fix remaining `id` dict mixed-language entries (Book*, Appointment, Booking, Dashboard, Filter, Refund, Reschedule, Login/Password, Website, Export/Treatment, placeholders)
- [ ] Add new i18n keys for hardcoded strings (day labels, chat responses, exercise names, month labels, STR Verified, etc.)
- [ ] `js/components/*.js` - replace hardcoded labels (STR Verified, Notifications, Settings, footer address)
- [ ] `js/views/guest/service-detail.js` - replace hardcoded "STR Verified"
- [ ] `js/views/guest/booking.js` - replace hardcoded English (days, times, doctor, credit)
- [ ] `js/views/guest/contact.js` - "Open Now", "24 jam", branch addresses info
- [ ] `js/views/guest/ai-triage.js` - hardcoded chat responses
- [ ] `js/views/patient/*.js` - hardcoded English strings (dashboard, assessment, payment, booking-success, contact-confirmation, update-booking, teleconsultation)
- [ ] `js/views/admin/*.js` - hardcoded English strings (dashboard, therapists, branches, patients)
- [ ] Verify app loads without JS errors and language toggle works
