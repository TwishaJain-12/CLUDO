# 🚀 Deploy NOW - 3 Steps

## Your Gemini Key Setup Required!
🔑 Get your key from: https://aistudio.google.com/app/apikey

---

## Step 1: Push to GitHub (1 minute)

```bash
cd NagarSathi-master/NagarSathi-master

git add streamlit_app/
git commit -m "Add Streamlit app for Gemini 3 Hackathon"
git push origin main
```

---

## Step 2: Deploy to Streamlit Cloud (2 minutes)

### A. Go to Streamlit Cloud
1. Visit: **https://share.streamlit.io/**
2. Click **"Sign in with GitHub"**
3. Authorize Streamlit

### B. Create New App
1. Click **"New app"** button (top right)
2. Fill in:
   - **Repository:** Select your repo from dropdown
   - **Branch:** `main`
   - **Main file path:** `streamlit_app/app.py`
   - **App URL:** Choose a name (e.g., `terratrace-nagarsathi`)

### C. Add Gemini API Key
1. Click **"Advanced settings"** (bottom left)
2. In the **"Secrets"** text box, paste:
   ```toml
   GEMINI_API_KEY = "your_gemini_api_key_here"
   ```
3. Click **"Save"**

### D. Deploy!
1. Click **"Deploy!"** button
2. Wait 2-3 minutes
3. Your app will be live! 🎉

---

## Step 3: Test Your Deployed App (1 minute)

### Once deployed, test these features:

1. **Fill in the form** (sidebar):
   - Title: "Suspected Deforestation"
   - Category: Deforestation
   - Description: "Tree cutting observed"
   - Latitude: 28.6139
   - Longitude: 77.2090
   - Date range: Last 2 years

2. **Click "Start Satellite Analysis"**
   - Should complete in 3-5 seconds
   - Shows loading spinner

3. **Verify results appear**:
   - ✅ Risk assessment badge
   - ✅ Timeline slider
   - ✅ NDVI metric cards
   - ✅ Chart visualization
   - ✅ AI recommendations
   - ✅ Certificate download button

---

## 🎉 You're Done!

Your app is now live at:
```
https://[your-app-name].streamlit.app
```

Use this URL for:
- ✅ Devpost submission (Public Project Link)
- ✅ Demo video
- ✅ Social media sharing

---

## 🎥 Next: Record Demo Video

See `DEMO_SCRIPT.md` for video script

**Quick tips:**
- Keep under 3 minutes
- Show the deployed app (not localhost)
- Highlight Gemini AI analysis
- Upload to YouTube

---

## 📝 Then: Submit to Devpost

Go to: **https://gemini3.devpost.com/**

Fill in:
- **Project Title:** TerraTrace x NagarSathi
- **Demo URL:** Your Streamlit Cloud URL
- **Code URL:** Your GitHub repo
- **Video URL:** Your YouTube video
- **Description:** Copy from `HACKATHON_SUBMISSION.md`

---

## ⚠️ Troubleshooting

### "App won't start"
- Check Streamlit Cloud logs (click "Manage app" → "Logs")
- Verify `streamlit_app/app.py` path is correct
- Ensure secrets are saved

### "Gemini API error"
- Verify API key in secrets (no extra spaces)
- Check key format: `GEMINI_API_KEY = "AIza..."`
- Test key at: https://aistudio.google.com/

### "Module not found"
- Check `requirements.txt` is in `streamlit_app/` folder
- Redeploy app (click "Reboot app")

---

## 🆘 Need Help?

**Streamlit Community:**
- https://discuss.streamlit.io/

**Quick Fix:**
If deployment fails, try:
1. Go to app settings
2. Click "Reboot app"
3. Check logs for errors

---

**Your app is ready to deploy! Just follow the 3 steps above! 🚀**
