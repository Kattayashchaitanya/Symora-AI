# 🚀 SymoraAI Deployment Guide

## Quick Deploy (5 Minutes)

### Option 1: Deploy Backend to Render.com

1. **Create Render Account**
   - Go to [render.com](https://render.com) and sign up (free)
   - Connect your GitHub account

2. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect to your `SymoraAI` repository
   - Configure:
     - **Name**: `symoraai-api`
     - **Root Directory**: `Backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Plan**: Free

3. **Add Environment Variables**
   - In Render dashboard, go to "Environment"
   - Add: `GROQ_API_KEY` = your_groq_api_key
   - Your backend will be at: `https://symoraai-api.onrender.com`

### Option 2: Deploy Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd Frontend
   vercel
   ```
   - Follow prompts (login, select project)
   - Set environment variable:
     ```
     VITE_API_BASE_URL=https://symoraai-api.onrender.com
     ```

3. **Your website will be live at**:
   ```
   https://symoraai.vercel.app
   ```

### Alternative: Deploy Frontend to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   cd Frontend
   npm run build
   netlify deploy --prod
   ```
   - Follow prompts
   - Set environment variable in Netlify dashboard:
     ```
     VITE_API_BASE_URL=https://symoraai-api.onrender.com
     ```

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Render
- [ ] `GROQ_API_KEY` added to Render environment
- [ ] Frontend environment variable updated with backend URL
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Test the live website
- [ ] Verify all features work (triage, analytics, hospitals, tips)
- [ ] Check mobile responsiveness
- [ ] Test offline mode (Service Worker)

---

## 🔧 Troubleshooting

**Backend Returns 500 Error:**
- Check Render logs for errors
- Verify GROQ_API_KEY is set correctly
- Check CORS settings allow your frontend domain

**Frontend Can't Connect to Backend:**
- Verify `VITE_API_BASE_URL` environment variable
- Check backend is running (visit backend URL in browser)
- Rebuild frontend after changing environment variables

**Service Worker Not Working:**
- Service Workers only work on HTTPS (production)
- Clear browser cache and reload
- Check browser console for SW errors

---

## 📊 Expected Costs

- **Backend (Render Free)**: $0/month
  - 750 hours/month free
  - Spins down after 15 min inactivity
  - Cold starts may take 30-60 seconds

- **Frontend (Vercel/Netlify Free)**: $0/month
  - Unlimited bandwidth
  - Global CDN
  - Automatic HTTPS

**Total Monthly Cost: $0** 🎉

---

## 🌐 Your Live URLs

After deployment, update these in your README:

```markdown
## 🌐 Live Demo

- **Website**: https://symoraai.vercel.app
- **API**: https://symoraai-api.onrender.com
```

---

## 🔄 Updates & Redeployment

Both Vercel and Render support automatic deployments:

1. **Vercel**: Automatically redeploys on every `git push` to main
2. **Render**: Automatically redeploys on every `git push` to main

Just push your changes to GitHub and both will update automatically!

```bash
git add .
git commit -m "Update features"
git push origin main
```

---

## ⚡ Performance Tips

1. **Backend Optimization**:
   - Consider upgrading to Render's paid plan ($7/month) to avoid cold starts
   - Use caching for analytics data
   - Implement rate limiting

2. **Frontend Optimization**:
   - Images already optimized (SVG logos)
   - Service Worker caching enabled
   - Bundle size already optimized (614 KB)

3. **Monitoring**:
   - Use Render's built-in logs
   - Use Vercel Analytics (free)
   - Monitor Groq API usage

---

Made with ❤️ for better healthcare
