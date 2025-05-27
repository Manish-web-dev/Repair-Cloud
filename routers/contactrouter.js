import express from "express";
import Contact from "../model/contactschema.js";
import sendEmail from "../Mail/sendEmail.js";
const router = express.Router();

// Handle contact form submissions
router.post('/', async (req, res) => {
  try {
    const { Name, Email, Phone, Servicetype, Message } = req.body;
    // Basic field check
    if (!Name || !Email || !Phone || !Servicetype || !Message) {
      return res.status(400).send('All fields are required');
    }
    // Save contact form submission to the database
    const newContact = new Contact({
      Name,
      Email,
      Phone,
      Servicetype,
      Message
    });
    await newContact.save();
    // Send email notification to the specified email address
    const subject = 'Contact Form Submission';
    const text = `You have received a new message from \n${Name} \n (${Email})\n(${Phone}) \n (${Servicetype}):\n${Message}`;
    await sendEmail('sanjeetkumarthakur864@gmail.com', subject, text); // Use sendEmail function
    res.send('Message send successfully');
  } catch (error) {
    console.error('Error processing contact form submission:', error);
    res.status(500).send('Failed to process contact form submission');
  }
});

export default router;