/* ============================================
   PhysioCare - Appointment Model
   ============================================ */

class Appointment extends Model {
    constructor() {
        super('data/appointments.json');
    }

    /**
     * Get appointments for a specific patient
     */
    async forPatient(patientId) {
        await this.load();
        return this.collection.filter(a => a.patientId === patientId);
    }

    /**
     * Get upcoming (confirmed) appointments
     */
    async upcoming() {
        await this.load();
        return this.collection.filter(a => a.status === 'confirmed');
    }

    /**
     * Get completed appointments
     */
    async completed() {
        await this.load();
        return this.collection.filter(a => a.status === 'completed');
    }

/**
     * Create a new appointment
     */
    async create({ patientId, patientName, serviceId, serviceName, therapistId, therapistName, date, time, location, price, currency = 'MYR', paymentMethod = 'qris' }) {
        const appointment = await this.insert({
            patientId,
            patientName,
            service: serviceName,
            serviceId,
            therapist: therapistName,
            therapistId,
            date,
            time,
            location,
            status: 'confirmed',
            price,
            currency,
            paymentMethod,
            assessment: null
        });
        return appointment;
    }

    /**
     * Update appointment status
     */
    async setStatus(id, status) {
        return this.update(id, { status });
    }
}
