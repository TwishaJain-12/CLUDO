# 🚀 Streamlit Deployment Guide

## Option 1: Streamlit Cloud (Recommended)

### Prerequisites
- GitHub account
- Gemini API key from https://aistudio.google.com/app/apikey

### Steps

#### 1. Prepare Repository
```bash
# Make sure all files are committed
git add streamlit_app/
git commit -m "Add Streamlit app for Gemini 3 Hackathon"
git push origin main
```

#### 2. Deploy on Streamlit Cloud

1. **Go to Streamlit Cloud**
   - Visit: https://share.streamlit.io/
   - Sign in with GitHub

2. **Create New App**
   - Click "New app" button
   - Select your repository
   - Branch: `main`
   - Main file path: `streamlit_app/app.py`
   - App URL: Choose a custom name (e.g., `terratrace-nagarsathi`)

3. **Configure Secrets**
   - Click "Advanced settings"
   - In the "Secrets" section, add:
   ```toml
   GEMINI_API_KEY = "your_gemini_api_key_here"
   ```
   - Replace with your actual Gemini API key

4. **Deploy**
   - Click "Deploy!"
   - Wait 2-3 minutes for deployment
   - Your app will be live at: `https://[your-app-name].streamlit.app`

---

## Option 2: Local Development

### Run Locally
```bash
cd streamlit_app

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your Gemini API key
nano .env

# Run app
streamlit run app.py
```

Visit: http://localhost:8501

---

## Option 3: Docker Deployment

### Create Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8501

CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

### Build and Run
```bash
docker build -t terratrace-app .
docker run -p 8501:8501 -e GEMINI_API_KEY=your_key terratrace-app
```

---

## 🔧 Configuration

### Environment Variables

**Required:**
- `GEMINI_API_KEY` - Your Gemini API key

**Optional:**
- `STREAMLIT_SERVER_PORT` - Port (default: 8501)
- `STREAMLIT_SERVER_HEADLESS` - Run headless (default: true)

### Streamlit Secrets

For Streamlit Cloud, add secrets in the dashboard:
```toml
# .streamlit/secrets.toml (for local)
GEMINI_API_KEY = "your_key_here"
```

Access in code:
```python
import streamlit as st
api_key = st.secrets["GEMINI_API_KEY"]
```

---

## 🎯 Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Gemini API key is working
- [ ] Satellite analysis completes successfully
- [ ] Timeline slider works
- [ ] Charts render correctly
- [ ] Certificate download works
- [ ] Mobile responsive
- [ ] No console errors

---

## 🐛 Common Issues

### Issue: "Gemini API error"
**Solution:**
- Verify API key in secrets
- Check key has Gemini API enabled
- Verify quota limits

### Issue: "Module not found"
**Solution:**
- Check `requirements.txt` is complete
- Redeploy app
- Clear cache in Streamlit Cloud

### Issue: "App won't start"
**Solution:**
- Check logs in Streamlit Cloud dashboard
- Verify Python version (3.11)
- Check file paths are correct

---

## 📊 Monitoring

### Streamlit Cloud Dashboard
- View app logs
- Monitor resource usage
- Check deployment status
- Manage secrets

### Analytics
- Streamlit Cloud provides basic analytics
- View visitor count
- Monitor app performance

---

## 🔄 Updates

### Update Deployed App
```bash
# Make changes locally
git add .
git commit -m "Update app"
git push origin main

# Streamlit Cloud auto-deploys on push
```

### Manual Redeploy
- Go to Streamlit Cloud dashboard
- Click "Reboot app"

---

## 🌐 Custom Domain (Optional)

Streamlit Cloud supports custom domains:
1. Go to app settings
2. Add custom domain
3. Update DNS records
4. Verify domain

---

## 💰 Pricing

**Streamlit Cloud:**
- Free tier: 1 app, unlimited viewers
- Pro: $20/month for more apps
- Enterprise: Custom pricing

**Recommended for Hackathon:** Free tier is sufficient

---

## 📝 Hackathon Submission

### Public URL
After deployment, your app will be at:
```
https://[your-app-name].streamlit.app
```

Use this URL for:
- Devpost submission (Public Project Link)
- Demo video
- Social media sharing

### Make App Public
- Ensure repository is public
- App is automatically public on Streamlit Cloud
- No login required for viewers

---

## 🎥 Demo Video Tips

### Recording Your Deployed App
1. Open deployed app URL
2. Use screen recording software (OBS, Loom)
3. Show full workflow:
   - Fill in issue details
   - Start satellite analysis
   - Explore timeline
   - View AI analysis
   - Generate certificate

### Highlight Gemini Integration
- Show loading state during AI analysis
- Emphasize risk assessment
- Display recommendations
- Mention "Powered by Gemini 3"

---

## ✅ Final Checklist

Before submitting to hackathon:

- [ ] App deployed to Streamlit Cloud
- [ ] Public URL working
- [ ] Gemini API key configured
- [ ] All features working
- [ ] Mobile responsive
- [ ] No errors in logs
- [ ] README updated with deployment URL
- [ ] Demo video recorded
- [ ] GitHub repository public

---

## 🆘 Support

**Streamlit Documentation:**
- https://docs.streamlit.io/

**Streamlit Community:**
- https://discuss.streamlit.io/

**Gemini API:**
- https://ai.google.dev/docs

---

**Good luck with your deployment! 🚀**
