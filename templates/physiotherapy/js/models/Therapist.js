/* ============================================
   PhysioCare - Therapist Model
   ============================================ */

class Therapist extends Model {
    constructor() {
        super('data/therapists.json');
    }

    /**
     * Get therapists by status
     */
    async byStatus(status) {
        await this.load();
        return this.collection.filter(t => t.status === status);
    }

    /**
     * Get available therapists
     */
    async available() {
        return this.byStatus('available');
    }

    /**
     * Search therapists by specialization or name
     */
    async search(query) {
        await this.load();
        const q = query.toLowerCase();
        return this.collection.filter(t =>
            t.name.toLowerCase().includes(q) ||
            t.specialization.toLowerCase().includes(q) ||
            t.title.toLowerCase().includes(q)
        );
    }
}
