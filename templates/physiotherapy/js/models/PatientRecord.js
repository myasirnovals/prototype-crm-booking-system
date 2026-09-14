/* ============================================
   PhysioCare - Patient Record Model
   ============================================ */

class PatientRecord extends Model {
    constructor() {
        super('data/appointments.json');
    }

/**
     * Get medical records for a patient (mapped for the records view)
     */
    async forPatient(patientId) {
        await this.load();
        return this.collection
            .filter(a => a.patientId === patientId)
            .map(a => ({
                id: a.id,
                title: a.service || 'Sesi Terapi',
                date: a.date,
                type: a.assessment && a.assessment.sessionType ? a.assessment.sessionType : 'Terapi',
                summary: a.assessment && a.assessment.notes
                    ? a.assessment.notes
                    : 'Belum ada catatan asesmen untuk sesi ini.',
                status: a.status
            }));
    }

    /**
     * Get medical history for a patient grouped by sessions
     */
    async history(patientId) {
        await this.load();
        return this.collection
            .filter(a => a.patientId === patientId && a.assessment)
            .map(a => ({
                date: a.date,
                time: a.time,
                therapist: a.therapist,
                sessionType: a.assessment.sessionType,
                notes: a.assessment.notes
            }));
    }

    /**
     * Get all records for admin dashboard
     */
    async allRecords() {
        await this.load();
        return this.collection.map(a => ({
            id: a.id,
            patientName: a.patientName,
            service: a.service,
            therapist: a.therapist,
            date: a.date,
            status: a.status,
            price: a.price
        }));
    }
}
