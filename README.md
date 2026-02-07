# CLUDO - Civic Issue Reporting & Environmental Monitoring Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)

> A comprehensive platform for civic issue reporting with AI-powered satellite environmental auditing, built for the Google DeepMind Gemini 3 Hackathon 2026.

## 🌟 Overview

CLUDO (formerly NagarSathi) is a full-stack civic engagement platform that combines traditional issue reporting with cutting-edge AI-powered environmental monitoring. Citizens can report local issues like potholes, garbage, and water leaks, while administrators leverage Gemini AI to analyze satellite imagery for environmental auditing.

### Key Features

- 🗺️ **Interactive Issue Mapping** - Real-time geolocation-based issue tracking
- 🛰️ **Satellite Environmental Auditing** - AI-powered analysis of satellite imagery
- 🤖 **Gemini AI Integration** - Advanced environmental risk assessment
- 👥 **Community Engagement** - Upvoting, commenting, and issue tracking
- 📊 **Admin Dashboard** - Comprehensive analytics and issue management
- 🔐 **Secure Authentication** - Clerk-powered user management
- 📱 **Responsive Design** - Works seamlessly on all devices

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLUDO Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React      │  │   Express    │  │  Streamlit   │      │
│  │   Frontend   │◄─┤   Backend    │  │  AI Auditor  │      │
│  │  (Vite)      │  │   (Node.js)  │  │  (Python)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         │                  │                  │              │
│  ┌──────▼──────┐  ┌───────▼────────┐  ┌─────▼──────┐      │
│  │   Clerk     │  │   MongoDB      │  │  Gemini AI │      │
│  │   Auth      │  │   Atlas        │  │  2.0 Flash │      │
│  └─────────────┘  └────────────────┘  └────────────┘      │
│                           │                                  │
│                   ┌───────▼────────┐                        │
│                   │   Cloudinary   │                        │
│                   │  Image Storage │                        │
│                   └────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+ (for Streamlit app)
- MongoDB Atlas account
- Clerk account
- Cloudinary account
- Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/TwishaJain-12/CLUDO.git
cd CLUDO
```

### 2. Setup Backend

```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials
```

**Required Environment Variables:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLIENT_URL=http://localhost:5173
```

```bash
# Start backend server
npm run dev
```

Server runs at: `http://localhost:5000`

### 3. Setup Frontend

```bash
cd client
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials
```

**Required Environment Variables:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

```bash
# Start frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Setup Streamlit AI Auditor (Optional)

```bash
cd streamlit_app
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your Gemini API key
```

```bash
# Start Streamlit app
streamlit run app.py
```

Streamlit app runs at: `http://localhost:8501`

---

## 📁 Project Structure

```
CLUDO/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
│
├── streamlit_app/        # AI Auditor
│   ├── app.py           # Streamlit application
│   ├── requirements.txt # Python dependencies
│   └── .streamlit/      # Streamlit config
│
└── docs/                # Documentation
    ├── API_DOCS.md      # API documentation
    └── DEPLOYMENT.md    # Deployment guide
```

---

## 🎯 Features in Detail

### 1. Civic Issue Reporting
- Report issues with photos, location, and description
- Real-time map visualization
- Category-based filtering (potholes, garbage, water leaks, etc.)
- Status tracking (reported → in progress → resolved)

### 2. Community Engagement
- Upvote issues to increase visibility
- Comment on issues for discussion
- User profiles and activity tracking
- Notification system

### 3. Admin Dashboard
- Comprehensive analytics and statistics
- Issue management and status updates
- User role management
- Resolution proof uploads
- Hotspot identification

### 4. AI-Powered Environmental Auditing
- Satellite imagery analysis using Gemini AI
- NDVI (vegetation health) calculations
- Deforestation detection
- Risk assessment (low/medium/high/critical)
- Automated audit certificate generation
- Historical timeline analysis

---

## 🔌 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/issues` - Get all issues (with filters)
- `GET /api/issues/:id` - Get issue details
- `GET /api/issues/map` - Get issues for map view

### Authenticated Endpoints
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update own issue
- `POST /api/issues/:id/upvote` - Toggle upvote
- `POST /api/issues/:id/comments` - Add comment

### Admin Endpoints
- `GET /api/admin/analytics` - Get analytics
- `PUT /api/admin/issues/:id/status` - Update issue status
- `POST /api/admin/issues/:id/resolve` - Mark as resolved

For complete API documentation, see [API_DOCS.md](docs/API_DOCS.md)

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Tanstack Query** - Data fetching
- **Leaflet/Mapbox** - Maps
- **Framer Motion** - Animations
- **Clerk** - Authentication

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Clerk** - Authentication
- **Cloudinary** - Image storage
- **Multer** - File uploads

### AI Auditor
- **Python 3.11** - Runtime
- **Streamlit** - Web framework
- **Gemini 2.0 Flash** - AI model
- **Plotly** - Visualizations
- **Pandas** - Data manipulation

---

## 🌐 Deployment

### Quick Deploy

**Frontend (Vercel):**
```bash
cd client
vercel --prod
```

**Backend (Render):**
- Connect GitHub repository
- Set root directory to `server`
- Add environment variables
- Deploy

**Streamlit (Streamlit Cloud):**
- Connect GitHub repository
- Set main file to `streamlit_app/app.py`
- Add Gemini API key to secrets
- Deploy

For detailed deployment instructions, see [DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 Hackathon Submission

Built for the **Google DeepMind Gemini 3 Hackathon 2026**

**Novel Features:**
- ✅ Gemini 2.0 Flash Exp integration
- ✅ Satellite imagery + AI analysis
- ✅ Real-world civic problem solving
- ✅ Production-ready architecture
- ✅ Comprehensive documentation

---

## 👥 Team

- **Developer:** Twisha Jain
- **GitHub:** [@TwishaJain-12](https://github.com/TwishaJain-12)

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

## 🙏 Acknowledgments

- Google DeepMind for Gemini AI
- Clerk for authentication
- MongoDB Atlas for database hosting
- Cloudinary for image storage
- Streamlit for rapid AI app development

---

## 📸 Screenshots

### Issue Reporting
![Issue Reporting](https://via.placeholder.com/800x400?text=Issue+Reporting+Interface)

### Interactive Map
![Interactive Map](https://via.placeholder.com/800x400?text=Interactive+Map+View)

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x400?text=Admin+Dashboard)

### AI Environmental Auditor
![AI Auditor](https://via.placeholder.com/800x400?text=AI+Environmental+Auditor)

---

**Made with ❤️ for a better civic future**
