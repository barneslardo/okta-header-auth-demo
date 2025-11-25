# Okta Header-Based Authentication Demo

This Node.js application demonstrates header-based authentication with Okta Access Gateway (OAG). It displays HTTP headers injected by OAG to show authenticated user information.

## Features

- Displays all Okta-injected headers from Access Gateway
- Shows user profile information (username, email, groups, etc.)
- Clean, modern UI for header visualization
- Ready for deployment behind Okta Access Gateway

## Prerequisites

- Node.js 14+ and npm
- Okta Access Gateway configured and running
- Access to an Okta tenant

## Installation

1. Clone this repository:
```bash
git clone https://github.com/barneslardo/okta-header-auth-demo.git
cd okta-header-auth-demo
```

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
node server.js
```

The app will start on port 3080 by default (configurable via PORT environment variable).

## Deployment

### Quick Deploy Script

Use the included deployment script for automated setup:

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

This will:
- Install Node.js if not present
- Install npm dependencies
- Create a systemd service
- Start the application
- Enable auto-start on boot

### Manual Deployment

1. Copy files to deployment directory
2. Install dependencies: `npm install`
3. Create systemd service (see deploy.sh for template)
4. Start service: `sudo systemctl start header-auth`
5. Enable on boot: `sudo systemctl enable header-auth`

## Configuration with Okta Access Gateway

1. In OAG admin console, create a new application
2. Set application type to "Header-based"
3. Configure backend URL to point to this app (http://localhost:3080)
4. Map Okta user attributes to HTTP headers:
   - x-okta-user → username
   - x-okta-email → email
   - x-okta-firstname → firstName
   - x-okta-lastname → lastName
   - x-okta-groups → groups
   - etc.

5. Assign users/groups in Okta

## Usage

Once configured behind OAG:
1. Access the app through the OAG URL (not directly)
2. OAG will handle authentication
3. After successful authentication, user information will be displayed

## Environment Variables

- `PORT`: Server port (default: 3080)

## License

MIT
