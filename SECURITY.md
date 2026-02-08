# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in CLUDO, please report it by emailing the maintainers. Do not create public GitHub issues for security vulnerabilities.

## Recent Security Updates

### February 2026 - Repository Cleanup

**Issue:** Node modules and environment files were accidentally committed to the repository.

**Actions Taken:**
1. ✅ Removed all `node_modules/` directories from git history
2. ✅ Removed `.env` file containing sensitive credentials from git history
3. ✅ Added comprehensive `.gitignore` file to prevent future commits
4. ✅ Force-pushed cleaned repository to GitHub

**What You Need to Do:**

If you cloned this repository before this security update:

1. **Delete your local clone:**
   ```bash
   cd ..
   rm -rf CLUDO
   ```

2. **Clone fresh copy:**
   ```bash
   git clone https://github.com/TwishaJain-12/CLUDO.git
   cd CLUDO
   ```

3. **Reinstall dependencies:**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   
   # Streamlit (if using)
   cd ../streamlit_app
   pip install -r requirements.txt
   ```

4. **Create new environment files:**
   ```bash
   # Backend
   cd server
   cp .env.example .env
   # Edit .env with your credentials
   
   # Frontend
   cd ../client
   cp .env.example .env
   # Edit .env with your credentials
   
   # Streamlit
   cd ../streamlit_app
   cp .env.example .env
   # Edit .env with your Gemini API key
   ```

5. **Rotate ALL credentials that were in the old .env file:**
   - MongoDB connection string
   - Clerk API keys (get new ones from Clerk dashboard)
   - Cloudinary credentials (regenerate from Cloudinary dashboard)
   - Gemini API key (create new one from Google AI Studio)

## Protected Files

The following files are now protected by `.gitignore` and will never be committed:

- `node_modules/` - All dependency folders
- `.env` - All environment variable files
- `*.log` - Log files
- `dist/` and `build/` - Build outputs
- `.DS_Store` - OS-specific files

## Best Practices

### For Contributors

1. **Never commit sensitive data:**
   - API keys
   - Database credentials
   - Private keys
   - Passwords
   - Access tokens

2. **Always use environment variables:**
   - Store secrets in `.env` files
   - Use `.env.example` as templates (with placeholder values)
   - Never commit actual `.env` files

3. **Check before committing:**
   ```bash
   git status
   git diff
   ```

4. **Use git hooks (optional):**
   Install pre-commit hooks to prevent accidental commits of sensitive files.

### For Deployment

1. **Use environment variables in production:**
   - Vercel: Add secrets in project settings
   - Render: Add environment variables in dashboard
   - Streamlit Cloud: Use secrets.toml

2. **Rotate credentials regularly:**
   - Change API keys every 90 days
   - Use different credentials for dev/staging/production

3. **Enable 2FA:**
   - GitHub account
   - Cloud provider accounts
   - Database access

## Dependency Security

### Automated Scanning

We recommend using:
- GitHub Dependabot (enabled by default)
- `npm audit` for Node.js dependencies
- `pip-audit` for Python dependencies

### Manual Checks

Run security audits regularly:

```bash
# Backend
cd server
npm audit
npm audit fix

# Frontend
cd client
npm audit
npm audit fix

# Streamlit
cd streamlit_app
pip-audit
```

## Secure Configuration

### MongoDB

- Use MongoDB Atlas with IP whitelisting
- Enable authentication
- Use strong passwords
- Regular backups

### Clerk

- Use production keys in production
- Enable MFA for admin accounts
- Configure allowed domains

### Cloudinary

- Restrict API access by IP (if possible)
- Use signed uploads for sensitive content
- Monitor usage for anomalies

## Incident Response

If credentials are compromised:

1. **Immediately rotate all affected credentials**
2. **Review access logs for unauthorized access**
3. **Notify users if data was accessed**
4. **Update security measures to prevent recurrence**

## Contact

For security concerns, contact the repository maintainer through GitHub.

---

**Last Updated:** February 2026
