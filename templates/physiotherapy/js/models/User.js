/* ============================================
   PhysioCare - User Model
   ============================================ */

class User extends Model {
    constructor() {
        super('data/users.json');
    }

    /**
     * Authenticate a user by email & password
     */
    async authenticate(email, password) {
        await this.load();
        const user = this.collection.find(u =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password
        );
        return user || null;
    }

    /**
     * Find a user by email
     */
    async findByEmail(email) {
        await this.load();
        return this.collection.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    /**
     * Register a new user
     */
    async register(name, email, password) {
        const existing = await this.findByEmail(email);
        if (existing) {
            return { error: 'Email sudah terdaftar. Silakan gunakan email lain.' };
        }
        const user = await this.insert({
            name,
            email,
            password,
            role: 'patient',
            patientId: 'PC-' + Math.floor(1000 + Math.random() * 9000),
            activeTreatment: null,
            nextSession: null,
            recoveryProgress: 0,
            therapist: null,
            avatar: null
        });
        return { user };
    }

    /**
     * Get current logged-in user from localStorage
     */
    static getCurrentUser() {
        try {
            const raw = localStorage.getItem('physiocare_current_user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Set current logged-in user
     */
    static setCurrentUser(user) {
        if (user) {
            localStorage.setItem('physiocare_current_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('physiocare_current_user');
        }
    }

    /**
     * Logout
     */
    static logout() {
        localStorage.removeItem('physiocare_current_user');
    }
}
