# CS504-TeamProject

# MFA-Enabled Secure Notes App

This project is a secure note-taking application built using the MERN stack (MongoDB, Express.js, React, Node.js) with integrated **Multi-Factor Authentication (MFA)** using **Google Authenticator**. It helps users create, manage, and search encrypted notes while ensuring account security through TOTP-based authentication.

## INPUT
Users provide the following inputs through the app interface:

- **Registration**
  - Username
  - Password

- **MFA Setup**
  - QR code scan via Google Authenticator

- **Login**
  - Username and Password
  - TOTP code (6-digit from authenticator app)

- **Note Management**
  - Note title and content
  - Optional tags (for search/filtering)

## PROCESS

The app processes the input in several secure and functional layers:

- **User Authentication**
  - Passwords are hashed using `bcrypt` to ensure they are stored securely
  - TOTP secrets are generated with `speakeasy`
  - A QR code is generated using `qrcode` for MFA setup

- **MFA Verification**
  - On login, password is verified first using bcrypt.compare
  - Then, TOTP code is validated against stored secret
  - If successful, a JWT token is issued for session management
  - MFA tokens have a defined expiration window . After expiration, the 
    user must re-enter the TOTP code even if the session token is still valid this adds another layer of security against idle or hijacked sessions

- **Notes Handling**
  - Notes are encrypted before being stored in MongoDB
  - APIs allow CRUD operations on encrypted notes
  - Notes can be tagged for fast categorization
  - Users can search/filter notes by tags

- **Security Middleware**
  - Routes are protected using JWT-based middleware
  - Auto-logout happens when the token expires
  - MFA Timeout Enforcement ensures periodic re-authentication using  
    TOTP after the predefined MFA duration lapses


## OUTPUT

The application delivers the following outputs:

- **QR Code for MFA Setup** during signup
- **Secure Dashboard** with:
  - Personalized greeting
  - Encrypted notes displayed by tag/category
- **Real-time Feedback**
  - Snackbars and alerts for success/error
- **JWT Token** issued upon successful MFA login
- **Filtered Notes List** based on search input
- **Session Expiry Notification** when token is invalid/expired
- **MFA Expiration** when TOTP verification window has passed, requiring 
  re-entry of the latest code to maintain access
