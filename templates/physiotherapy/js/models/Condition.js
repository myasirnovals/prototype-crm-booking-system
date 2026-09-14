/* ============================================
   PhysioCare - Condition Model
   ============================================ */

class Condition extends Model {
    constructor() {
        super('data/conditions.json');
    }

    /**
     * Get a condition by its slug
     * @param {string} slug 
     * @returns {Promise<Object>}
     */
    async bySlug(slug) {
        const items = await this.all();
        return items.find(item => item.slug === slug);
    }
    
    /**
     * Get conditions grouped by area
     * @returns {Promise<Object>}
     */
    async groupedByArea() {
        const items = await this.all();
        const grouped = {};
        
        items.forEach(item => {
            if (!grouped[item.areaLabel]) {
                grouped[item.areaLabel] = {
                    area: item.area,
                    icon: item.icon,
                    items: []
                };
            }
            grouped[item.areaLabel].items.push(item);
        });
        
        return grouped;
    }
}
