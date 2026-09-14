/**
 * AdminProgramModel — Model untuk manajemen Program Nutrisi (Builder) dari sisi Admin.
 */
export class AdminProgramModel {
  constructor() {
    this.storageKey = 'nutriflow_programs_draft';
    this.libKey = 'nutriflow_food_library';
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.libKey)) {
      localStorage.setItem(this.libKey, JSON.stringify([]));
    }
  }

  getPrograms() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  savePrograms(programs) {
    localStorage.setItem(this.storageKey, JSON.stringify(programs));
  }

  getProgramById(id) {
    return this.getPrograms().find(p => p.id === id);
  }

  addProgram(program) {
    const programs = this.getPrograms();
    programs.push(program);
    this.savePrograms(programs);
  }

  updateProgram(id, updates) {
    const programs = this.getPrograms();
    const index = programs.findIndex(p => p.id === id);
    if (index !== -1) {
      programs[index] = { ...programs[index], ...updates };
      this.savePrograms(programs);
      return true;
    }
    return false;
  }

  // Invitation link logic (FR-PROG-06, SEC-07)
  generateInvitationLink(programId, email) {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // 7 days expiry

    const invitesKey = 'nutriflow_program_invites';
    const invites = JSON.parse(localStorage.getItem(invitesKey) || '[]');
    
    invites.push({
      programId,
      email,
      token,
      expiresAt: expiry.toISOString(),
      revoked: false
    });

    localStorage.setItem(invitesKey, JSON.stringify(invites));

    // Return mock link
    return `${window.location.origin}/login.html?invite_token=${token}`;
  }

  // Food Library
  getFoodLibrary() {
    return JSON.parse(localStorage.getItem(this.libKey) || '[]');
  }
}

export const adminProgramModel = new AdminProgramModel();
