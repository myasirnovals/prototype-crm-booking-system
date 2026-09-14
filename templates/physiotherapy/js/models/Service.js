/* ============================================
   PhysioCare - Service Model
   ============================================ */

class Service extends Model {
    constructor() {
        super('data/services.json');
    }

    /**
     * Get service by slug/id
     */
    async bySlug(slug) {
        await this.load();
        return this.collection.find(s => s.id === slug) || null;
    }

    /**
     * Format price for display (default MYR)
     */
    static formatPrice(price, currency = 'MYR') {
        if (currency === 'MYR') {
            return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(price);
        }
        if (currency === 'IDR') {
            return 'Rp' + Number(price).toLocaleString('id-ID');
        }
        return '$' + Number(price).toFixed(2);
    }

    /**
     * Search services
     */
    async search(query) {
        await this.load();
        const q = query.toLowerCase();
        return this.collection.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.shortDescription.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q)
        );
    }
}
