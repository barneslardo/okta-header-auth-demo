const express = require('express');
const app = express();
const PORT = process.env.PORT || 3080;

// Middleware to parse Okta Access Gateway headers
const parseOktaHeaders = (req, res, next) => {
  // Common headers passed by Okta Access Gateway
  req.oktaUser = {
    // Standard Okta headers
    username: req.headers['x-okta-user'] || req.headers['okta-user'],
    email: req.headers['x-okta-email'] || req.headers['okta-email'],
    firstName: req.headers['x-okta-firstname'] || req.headers['okta-firstname'],
    lastName: req.headers['x-okta-lastname'] || req.headers['okta-lastname'],
    displayName: req.headers['x-okta-displayname'] || req.headers['okta-displayname'],
    groups: req.headers['x-okta-groups'] || req.headers['okta-groups'],
    userId: req.headers['x-okta-userid'] || req.headers['okta-userid'],

    // Session info
    sessionId: req.headers['x-okta-session-id'],
    authTime: req.headers['x-okta-auth-time'],

    // Additional custom attributes (if configured)
    department: req.headers['x-okta-department'],
    title: req.headers['x-okta-title'],

    // Raw headers for debugging
    allOktaHeaders: Object.keys(req.headers)
      .filter(h => h.toLowerCase().includes('okta') || h.toLowerCase().startsWith('x-'))
      .reduce((acc, h) => { acc[h] = req.headers[h]; return acc; }, {})
  };

  next();
};

app.use(parseOktaHeaders);

// Home page - public
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Okta Header Auth Demo</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #e0e0e0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: rgba(30, 41, 59, 0.9);
          border-radius: 12px;
          padding: 40px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        h1 { color: #818cf8; margin-bottom: 20px; }
        p { color: #94a3b8; margin-bottom: 20px; line-height: 1.6; }
        a {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        a:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Okta Header Auth Demo</h1>
        <p>This application demonstrates header-based authentication via Okta Access Gateway.</p>
        <a href="/protected">View Protected Page</a>
      </div>
    </body>
    </html>
  `);
});

// Protected route - displays user info from headers
app.get('/protected', (req, res) => {
  const user = req.oktaUser;
  const isAuthenticated = user.username || user.email || user.userId;

  if (!isAuthenticated) {
    return res.status(401).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unauthorized - Okta Header Auth Demo</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #e0e0e0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: rgba(30, 41, 59, 0.9);
            border-radius: 12px;
            padding: 40px;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(239, 68, 68, 0.3);
          }
          h1 { color: #ef4444; margin-bottom: 20px; }
          p { color: #94a3b8; margin-bottom: 20px; line-height: 1.6; }
          .warning {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #fca5a5;
          }
          a {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Unauthorized</h1>
          <p>No authentication headers detected.</p>
          <div class="warning">
            This page requires authentication via Okta Access Gateway.
            Make sure you're accessing this application through the gateway.
          </div>
          <a href="/">Back to Home</a>
        </div>
      </body>
      </html>
    `);
  }

  const getInitial = () => {
    if (user.firstName) return user.firstName[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return '?';
  };

  const getDisplayName = () => {
    if (user.displayName) return user.displayName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.username) return user.username;
    if (user.email) return user.email;
    return 'Authenticated User';
  };

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Protected Page - Okta Header Auth Demo</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #e0e0e0;
          min-height: 100vh;
          padding: 40px 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header {
          background: rgba(30, 41, 59, 0.9);
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(34, 197, 94, 0.3);
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: white;
        }
        .user-info h1 { color: #22c55e; margin-bottom: 5px; }
        .user-info p { color: #94a3b8; }
        .card {
          background: rgba(30, 41, 59, 0.9);
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        .card h2 {
          color: #818cf8;
          margin-bottom: 15px;
          font-size: 1.2em;
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
          padding-bottom: 10px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 10px;
        }
        .info-label { color: #64748b; font-weight: 500; }
        .info-value { color: #e2e8f0; word-break: break-all; }
        .info-value.empty { color: #475569; font-style: italic; }
        pre {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 15px;
          overflow-x: auto;
          font-size: 0.85em;
          color: #94a3b8;
        }
        .back-link {
          display: inline-block;
          color: #818cf8;
          text-decoration: none;
          margin-top: 20px;
        }
        .back-link:hover { text-decoration: underline; }
        .status-badge {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: 600;
          margin-left: auto;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="avatar">${getInitial()}</div>
          <div class="user-info">
            <h1>${getDisplayName()}</h1>
            <p>${user.email || 'No email provided'}</p>
          </div>
          <span class="status-badge">Authenticated</span>
        </div>

        <div class="card">
          <h2>User Information</h2>
          <div class="info-grid">
            <span class="info-label">Username:</span>
            <span class="info-value ${!user.username ? 'empty' : ''}">${user.username || 'Not provided'}</span>

            <span class="info-label">Email:</span>
            <span class="info-value ${!user.email ? 'empty' : ''}">${user.email || 'Not provided'}</span>

            <span class="info-label">First Name:</span>
            <span class="info-value ${!user.firstName ? 'empty' : ''}">${user.firstName || 'Not provided'}</span>

            <span class="info-label">Last Name:</span>
            <span class="info-value ${!user.lastName ? 'empty' : ''}">${user.lastName || 'Not provided'}</span>

            <span class="info-label">Display Name:</span>
            <span class="info-value ${!user.displayName ? 'empty' : ''}">${user.displayName || 'Not provided'}</span>

            <span class="info-label">User ID:</span>
            <span class="info-value ${!user.userId ? 'empty' : ''}">${user.userId || 'Not provided'}</span>

            <span class="info-label">Groups:</span>
            <span class="info-value ${!user.groups ? 'empty' : ''}">${user.groups || 'Not provided'}</span>

            <span class="info-label">Department:</span>
            <span class="info-value ${!user.department ? 'empty' : ''}">${user.department || 'Not provided'}</span>

            <span class="info-label">Title:</span>
            <span class="info-value ${!user.title ? 'empty' : ''}">${user.title || 'Not provided'}</span>
          </div>
        </div>

        <div class="card">
          <h2>Session Information</h2>
          <div class="info-grid">
            <span class="info-label">Session ID:</span>
            <span class="info-value ${!user.sessionId ? 'empty' : ''}">${user.sessionId || 'Not provided'}</span>

            <span class="info-label">Auth Time:</span>
            <span class="info-value ${!user.authTime ? 'empty' : ''}">${user.authTime || 'Not provided'}</span>
          </div>
        </div>

        <div class="card">
          <h2>Raw Okta/Custom Headers</h2>
          <pre>${JSON.stringify(user.allOktaHeaders, null, 2)}</pre>
        </div>

        <a href="/" class="back-link">&larr; Back to Home</a>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Debug endpoint - shows all headers (useful for testing)
app.get('/debug/headers', (req, res) => {
  res.json({
    headers: req.headers,
    oktaUser: req.oktaUser
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Okta Header Auth Demo running on port ${PORT}`);
  console.log(`Protected route: http://localhost:${PORT}/protected`);
  console.log(`Debug headers: http://localhost:${PORT}/debug/headers`);
});
