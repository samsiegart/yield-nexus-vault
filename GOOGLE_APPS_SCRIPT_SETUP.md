# Google Apps Script Setup for Feedback Form

## Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Feedback Data" or similar
4. Add headers in row 1: `Timestamp`, `Name`, `Email`, `Category`, `Message`, `User Agent`, `URL`

## Step 2: Create Google Apps Script
1. In your Google Sheet, go to **Extensions** > **Apps Script**
2. Replace the default code with the script below
3. Save the project (give it a name like "Feedback Handler")

## Step 3: Google Apps Script Code

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Parse the POST data
    const data = JSON.parse(e.postData.contents);
    
    // Extract data from the request
    const timestamp = data.timestamp || new Date().toISOString();
    const name = data.name || '';
    const email = data.email || '';
    const category = data.category || '';
    const message = data.message || '';
    const userAgent = data.userAgent || '';
    const url = data.url || '';
    
    // Add data to the sheet
    sheet.appendRow([timestamp, name, email, category, message, userAgent, url]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Feedback submitted successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Feedback API is running')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

## Step 4: Deploy the Script
1. Click **Deploy** > **New deployment**
2. Choose **Web app** as the type
3. Set the following options:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Copy the **Web app URL** that appears

## Step 5: Configure Environment Variables

### For Development
1. Create a `.env.local` file in your project root
2. Add your Google Apps Script URL:
   ```
   VITE_FEEDBACK_ENDPOINT=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
3. Replace `YOUR_DEPLOYMENT_ID` with your actual deployment ID from Step 4

### For Production
1. Set the environment variable in your deployment platform:
   - **Fly.io**: `fly secrets set VITE_FEEDBACK_ENDPOINT=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`
   - **Docker**: `docker build --build-arg VITE_FEEDBACK_ENDPOINT=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec .`
   - **Vercel**: Add in dashboard or use `vercel env add VITE_FEEDBACK_ENDPOINT`
   - **Netlify**: Add in site settings or use `netlify env:set VITE_FEEDBACK_ENDPOINT`

### Example URLs
- Production URL format: `https://script.google.com/macros/s/AKfycbx7nd2e1xq-gl0jXZ0NGddN6afeBzcB8giS9mvUPr9UuwtX8aA7XVJKuFPZ3gi23P5Z/exec`
- Google Workspace URL format: `https://script.google.com/a/macros/yourdomain.com/s/DEPLOYMENT_ID/exec`

## Step 6: Test the Integration
1. Start your development server: `npm run dev` or `yarn dev`
2. Click the feedback button
3. Fill out and submit the form
4. Check your Google Sheet to see if the data appears

**Note**: If the environment variable is not set, the application will use the default production endpoint. For development and testing, it's recommended to set up your own Google Apps Script endpoint.

## Security Notes
- The script accepts data from anyone (no authentication)
- Consider adding basic validation or rate limiting if needed
- The email addresses will be stored in your Google Sheet

## Troubleshooting
- If you get CORS errors, make sure the deployment is set to "Anyone" access
- Check the Apps Script execution logs for any errors
- Ensure the Google Sheet has the correct headers in row 1