const ejs = require("ejs");
const path = require("path");

function renderRegistration(username, logo) {
    try {
        return ejs.renderFile(path.resolve(__dirname, "../templates/registration.ejs"), { username, logo });
    }catch (error) {
        console.error("Error rendering email template registration:", error);
        throw error;
    }
}

function renderConfirmationEmail  (logo, username, code) {
    try {
         return ejs.renderFile(path.resolve(__dirname, "../templates/login.ejs"), { logo, username, code });
    } catch (error) {
        console.error("Error rendering email template login:", error);
        throw error;
    }
}
function renderResetEmail  (logo, username, code) {
    try {
        return ejs.renderFile(path.resolve(__dirname, "../templates/reset.ejs"), { logo, username, code });
    } catch (error) {
        console.error("Error rendering email template reset:", error);
        throw error;
    }
}

module.exports = {
    renderRegistration,
    renderConfirmationEmail,
    renderResetEmail
};
