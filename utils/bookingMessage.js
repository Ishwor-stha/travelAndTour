module.exports.bookMessage = (date, phone, email, time, age, nameOfTour) => {
    const ageKey = Object.keys(age);
    let dispAge = " ";
    for (let key in age) {
         dispAge = `\tAge range:${key} = ${age[key]} People`+"\n" + dispAge;
      
    }
 
    return `
     <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; border-radius: 8px; padding: 20px; max-width: 600px; margin: 20px auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
         <div style="text-align: center; margin-bottom: 20px;">
             <h2 style="color: #343a40; font-size: 24px; font-weight: bold; margin: 0;">📅 New Tour Booking Alert! 🌍</h2>
             <p style="font-size: 16px; color: #6c757d;">A customer has successfully booked a tour. Please find the details below.</p>
         </div>
 
         <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
             <ul style="list-style-type: none; padding: 0; margin: 0;">
                 <li style="font-size: 18px; color: #007bff; margin: 8px 0;"><strong>Tour Name:</strong> ${nameOfTour}</li>
                 <li style="font-size: 18px; color: #007bff; margin: 8px 0;"><strong>Booking Date:</strong> ${date}</li>
                 <li style="font-size: 18px; color: #007bff; margin: 8px 0;"><strong>Tour Time:</strong> ${time}</li>
                 <li style="font-size: 18px; color: #007bff; margin: 8px 0;"><strong>Age Details:</strong> <pre style="font-size: 16px; color: #333;">${dispAge}</pre></li>
                 <li style="font-size: 18px; color: #007bff; margin: 8px 0;"><strong>Contact Number:</strong> ${phone}</li>
                 <li style="font-size: 18px; color: #007bff; margin: 8px 0;"><strong>Email Address:</strong> <a href="mailto:${email}" style="color: #007bff;">${email}</a></li>
             </ul>
         </div>
 
         <div style="text-align: center; margin-top: 30px;">
             <p style="font-size: 16px; color: #28a745; font-weight: bold;">
                 Please confirm the booking and prepare for an amazing tour experience! ✨
             </p>
         </div>
         
         <div style="background-color: #f1f1f1; text-align: center; padding: 10px; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d;">
             <p>&copy; ${new Date().getFullYear()} ${process.env.company_name}. All rights reserved.</p>
         </div>
     </div>
     `;
 };
 