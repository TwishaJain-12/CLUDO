# CLUDO - Streamlit App

## 🚀 Quick Start (Local)

### 1. Install Dependencies
```bash
cd streamlit_app
pip install -r requirements.txt
```

### 2. Set Up Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Gemini API key
# Get key from: https://aistudio.google.com/app/apikey
```

### 3. Run the App
```bash
streamlit run app.py
```

Visit: http://localhost:8501

---

## 🌐 Deploy to Streamlit Cloud

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Streamlit app"
git push origin main
```

### Step 2: Deploy on Streamlit Cloud
1. Go to https://share.streamlit.io/
2. Click "New app"
3. Connect your GitHub repository
4. Set:
   - **Main file path:** `streamlit_app/app.py`
   - **Python version:** 3.11
5. Click "Advanced settings"
6. Add secrets:
   ```toml
   GEMINI_API_KEY = "your_actual_gemini_api_key"
   ```
7. Click "Deploy"

Your app will be live at: `https://[your-app-name].streamlit.app`

---

## 🎯 Features

### 🛰️ Satellite Environmental Auditing
- Fetches 2+ years of satellite imagery data
- Calculates NDVI (vegetation health)
- Analyzes moisture content
- Detects deforestation patterns

### 🤖 Gemini 3 AI Analysis
- Interprets complex satellite telemetry
- Generates risk assessments (low/medium/high/critical)
- Provides natural language summaries
- Creates actionable recommendations
- Confidence scoring

### 📊 Interactive Visualization
- Historical timeline slider
- NDVI trend charts
- Real-time data updates
- Downloadable audit certificates

---

## 🔑 Getting Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Add to `.env` file or Streamlit secrets

---

## 📝 Usage

1. **Fill in Issue Details** (Sidebar)
   - Issue title
   - Category (Deforestation, Pollution, etc.)
   - Description
   - Location (latitude, longitude)
   - Time range (start and end dates)

2. **Start Analysis**
   - Click "Start Satellite Analysis"
   - Wait 3-5 seconds for processing

3. **Explore Results**
   - View AI risk assessment
   - Slide through historical timeline
   - Check NDVI trends
   - Read recommendations
   - Generate audit certificate

---

## 🏗️ Architecture

```
User Input → Mock Satellite Data Generation → NDVI Calculation
                                                    ↓
                                            Gemini 3 AI Analysis
                                                    ↓
                                    Risk Assessment + Recommendations
                                                    ↓
                                        Interactive Visualization
```

---

## 🎨 Customization

### Change Theme
Edit `.streamlit/config.toml`:
```toml
[theme]
primaryColor="#your-color"
backgroundColor="#your-bg"
```

### Modify Analysis Logic
Edit `app.py`:
- `generate_mock_satellite_data()` - Satellite data generation
- `analyze_with_gemini()` - Gemini AI integration
- `generate_fallback_analysis()` - Fallback logic

---

## 🐛 Troubleshooting

### "Gemini API error"
- Check API key is correct
- Verify key has Gemini API enabled
- Check quota limits in Google AI Studio

### "Module not found"
```bash
pip install -r requirements.txt
```

### "Port already in use"
```bash
streamlit run app.py --server.port 8502
```

---

## 📦 Dependencies

- **streamlit** - Web framework
- **google-generativeai** - Gemini API
- **plotly** - Interactive charts
- **pandas** - Data manipulation
- **requests** - HTTP requests

---

## 🏆 Hackathon Submission

This app is built for the **Google DeepMind Gemini 3 Hackathon 2026**.

**Key Features:**
- ✅ Uses Gemini 2.0 Flash Exp
- ✅ Novel use case (satellite + AI + civic)
- ✅ Real-world problem (environmental monitoring)
- ✅ Production-ready code
- ✅ Easy deployment

---

## 📄 License

MIT License - Built for Gemini 3 Hackathon 2026
