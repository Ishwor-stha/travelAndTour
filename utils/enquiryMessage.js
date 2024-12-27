module.exports.enquiryMessage = (name, email, phone, question) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #007BFF;
            color: #fff;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            color: #007BFF;
        }
        .details {
            margin: 15px 0;
            line-height: 1.6;
        }
        .details strong {
            color: #333;
        }
        .footer {
            background-color: #f1f1f1;
            padding: 10px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Client Enquiry</h1>
        </div>
        <div class="content">
            <h2>Details:</h2>
            <div class="details">
                <p><strong>Client Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone Number:</strong> ${phone}</p>
                <p><strong>Question/Message:</strong><br>${question}</p>
            </div>
        </div>
        <div class="footer">
            <p>This is an automated notification. Please respond  to the client.</p>
        </div>
    </div>
</body>
</html>
    `;
};
