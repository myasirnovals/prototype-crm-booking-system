/* ============================================
   PhysioCare - Auth Controller
   Handles login, register, and forgot password
   ============================================ */

const AuthController = {
    /**
     * Patient login page
     */
    login(params) {
        MountView(LoginView, params);
    },

    /**
     * Register new account page
     */
    register(params) {
        MountView(RegisterView, params);
    },

    /**
     * Forgot password page
     */
    forgotPassword(params) {
        MountView(ForgotPasswordView, params);
    }
};
