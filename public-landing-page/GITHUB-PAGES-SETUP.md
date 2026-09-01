# 🔧 GitHub Pages Setup - Step by Step

## Current Issue
You're seeing the default Next.js README instead of your app because GitHub Pages needs to be configured to use GitHub Actions.

## ✅ Solution - Follow These Steps EXACTLY

### Step 1: Go to Repository Settings
Visit: **https://github.com/mayu1344/CIVIC1.1/settings/pages**

### Step 2: Configure Source
Under **"Build and deployment"** section:
- **Source**: Change from "Deploy from a branch" to **"GitHub Actions"**
- Click **Save** (if there's a save button)

### Step 3: Trigger the Workflow
After updating the workflow, we need to trigger a new build:

```bash
# Run this in your terminal from the civi1.1 folder
git add .
git commit -m "Fix GitHub Pages deployment"
git push
```

### Step 4: Monitor Deployment
1. Go to: **https://github.com/mayu1344/CIVIC1.1/actions**
2. You should see a workflow running called "Deploy to GitHub Pages"
3. Wait for it to complete (usually 2-3 minutes)
4. Look for a green checkmark ✅

### Step 5: View Your Site
Once the workflow completes successfully:
- Visit: **https://mayu1344.github.io/CIVIC1.1**
- You should see your CIVIC1.1 application!

## 🔍 Troubleshooting

### If you still see the README:
1. **Clear browser cache**: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Check Actions tab**: Make sure the workflow completed successfully
3. **Wait a few minutes**: GitHub Pages can take 5-10 minutes to update

### If the workflow fails:
1. Click on the failed workflow in the Actions tab
2. Check the error message
3. Common issues:
   - **npm ci fails**: Delete `package-lock.json` and run `npm install` locally, then push
   - **Build fails**: Check `build_err.log` for errors
   - **Permission denied**: Make sure Pages is enabled in repository settings

### If you see 404 errors on navigation:
- This is normal for Next.js static export with client-side routing
- The home page should load correctly
- Internal navigation will work once the app loads

## 📊 What Should You See?

After successful deployment, you should see:
- ✅ CIVIC1.1 landing page
- ✅ Navigation to Admin, Citizen, MLA, Officer portals
- ✅ Public transparency page
- ✅ All styling and images loaded correctly

## 🚨 Important Notes

1. **First deployment takes longer**: 5-10 minutes
2. **Subsequent deployments**: 2-3 minutes
3. **Always check Actions tab**: To see deployment status
4. **Source MUST be "GitHub Actions"**: Not "Deploy from a branch"

## 📞 Still Having Issues?

Check these:
- [ ] Repository is public (or you have GitHub Pro for private repos)
- [ ] GitHub Pages is enabled in settings
- [ ] Source is set to "GitHub Actions"
- [ ] Workflow completed successfully (green checkmark)
- [ ] Waited at least 5 minutes after workflow completion
- [ ] Cleared browser cache

---

**Next Step**: Run the commands in Step 3 above to push the updated workflow!
