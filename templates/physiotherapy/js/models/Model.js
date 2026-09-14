/* ============================================
   PhysioCare - Base Model
   Handles data loading & persistence
   ============================================ */

class Model {
    constructor(dataFile) {
        this.dataFile = dataFile;
        this.collection = [];
        this.loaded = false;
    }

    /**
     * Load data from the JSON file. Since we're using a static file server,
     * we fetch from the data folder. Caches after first load.
     */
    async load() {
        if (this.loaded) return this.collection;
        try {
            const response = await fetch(this.dataFile);
            this.collection = await response.json();
            this.loaded = true;
        } catch (err) {
            console.error(`Failed to load ${this.dataFile}:`, err);
            this.collection = [];
        }
        return this.collection;
    }

    /**
     * Reset the model (useful after mutations in memory)
     */
    reset() {
        this.collection = [];
        this.loaded = false;
    }

    /**
     * Find a record by ID
     */
    async find(id) {
        await this.load();
        return this.collection.find(item => String(item.id) === String(id)) || null;
    }

    /**
     * Find records matching a predicate
     */
    async where(predicate) {
        await this.load();
        return this.collection.filter(predicate);
    }

    /**
     * Get all records
     */
    async all() {
        await this.load();
        return [...this.collection];
    }

    /**
     * Insert a new record (in-memory)
     */
    async insert(record) {
        await this.load();
        record.id = this.collection.length ? Math.max(...this.collection.map(i => i.id)) + 1 : 1;
        this.collection.push(record);
        this.persist();
        return record;
    }

    /**
     * Update existing record (in-memory)
     */
    async update(id, changes) {
        await this.load();
        const index = this.collection.findIndex(item => String(item.id) === String(id));
        if (index !== -1) {
            this.collection[index] = { ...this.collection[index], ...changes };
            this.persist();
            return this.collection[index];
        }
        return null;
    }

    /**
     * Remove a record (in-memory)
     */
    async remove(id) {
        await this.load();
        this.collection = this.collection.filter(item => String(item.id) !== String(id));
        this.persist();
    }

    /**
     * Persist to localStorage (lightweight backend)
     */
    persist() {
        const key = 'physiocare_' + this.dataFile;
        localStorage.setItem(key, JSON.stringify(this.collection));
    }
}
