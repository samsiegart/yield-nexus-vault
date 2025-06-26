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

## Step 5: Update the React Component
1. Open `src/components/FeedbackForm.tsx`
2. Replace `YOUR_DEPLOYMENT_ID` in the `GOOGLE_SCRIPT_URL` with your actual deployment URL
3. The URL will look like: `https://script.google.com/macros/s/AKfycbx7nd2e1xq-gl0jXZ0NGddN6afeBzcB8giS9mvUPr9UuwtX8aA7XVJKuFPZ3gi23P5Z/exec`

# https://script.google.com/a/macros/agoric.com/s/AKfycbx7nd2e1xq-gl0jXZ0NGddN6afeBzcB8giS9mvUPr9UuwtX8aA7XVJKuFPZ3gi23P5Z/exec
# AKfycbx7nd2e1xq-gl0jXZ0NGddN6afeBzcB8giS9mvUPr9UuwtX8aA7XVJKuFPZ3gi23P5Z

## Step 6: Test the Integration
1. Deploy your app
2. Click the feedback button
3. Fill out and submit the form
4. Check your Google Sheet to see if the data appears

## Security Notes
- The script accepts data from anyone (no authentication)
- Consider adding basic validation or rate limiting if needed
- The email addresses will be stored in your Google Sheet

## Troubleshooting
- If you get CORS errors, make sure the deployment is set to "Anyone" access
- Check the Apps Script execution logs for any errors
- Ensure the Google Sheet has the correct headers in row 1