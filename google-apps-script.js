/**
 * Bluro Technology — Google Apps Script
 * Paste this entire file into Google Apps Script editor.
 * 
 * Setup:
 *  1. Open your Google Sheet → Extensions → Apps Script
 *  2. Delete default code, paste this entire file
 *  3. Save → Deploy → New Deployment → Web App
 *  4. Execute as: Me | Who has access: Anyone
 *  5. Copy the deployment URL → paste into app.js APPS_SCRIPT_URL
 */

const SHEET_NAME = 'Inquiries';          // Sheet tab name
const ADMIN_EMAIL = 'blurotech.in@gmail.com'; // Your email

// ─── Column headers (Row 1) ───────────────────────────────────────────────────
function setupHeaders() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName(SHEET_NAME)
        || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Company', 'Project Type', 'Message']);
        sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#0a192f').setFontColor('#fcc419');
        sheet.setFrozenRows(1);
    }
}

// ─── Handle POST request from the website form ────────────────────────────────
function doPost(e) {
    try {
        setupHeaders();

        const data = JSON.parse(e.postData.contents);
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

        // Append the new row
        sheet.appendRow([
            new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            data.name || '',
            data.email || '',
            data.phone || '',
            data.company || '',
            data.project_type || '',
            data.message || ''
        ]);

        // Send email notification to admin
        MailApp.sendEmail({
            to: ADMIN_EMAIL,
            subject: `[Bluro Inquiry] ${data.project_type} — ${data.name}`,
            body:
                `New client inquiry received on Bluro website.\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Name         : ${data.name}\n` +
                `Email        : ${data.email}\n` +
                `Phone        : ${data.phone}\n` +
                `Company      : ${data.company}\n` +
                `Project Type : ${data.project_type}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `Message:\n${data.message}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `View all inquiries: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`
        });

        return ContentService
            .createTextOutput(JSON.stringify({ result: 'success' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// ─── Test function (run manually to verify setup) ─────────────────────────────
function testSubmission() {
    const mockEvent = {
        postData: {
            contents: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                phone: '+91 98765 43210',
                company: 'Test Corp',
                project_type: 'IoT Solutions',
                message: 'This is a test submission.'
            })
        }
    };
    const result = doPost(mockEvent);
    Logger.log(result.getContent());
}
