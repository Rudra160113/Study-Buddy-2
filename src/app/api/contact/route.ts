
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ** Email Sending Logic Placeholder **
    // In a real application, you would integrate an email sending service here.
    // For example, using Nodemailer:
    //
    // import nodemailer from 'nodemailer';
    //
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail', // Or your email provider
    //   auth: {
    //     user: process.env.EMAIL_USER, // Store these in .env.local
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });
    //
    // const mailOptions = {
    //   from: email, // Sender's email address (from the form)
    //   to: 'warriorrudra2009@gmail.com', // Your receiving email address
    //   subject: `New Contact Form Submission from ${name}`,
    //   text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    //   html: `<p><strong>Name:</strong> ${name}</p>
    //          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    //          <p><strong>Message:</strong></p>
    //          <p>${message.replace(/\n/g, '<br>')}</p>`,
    // };
    //
    // try {
    //   await transporter.sendMail(mailOptions);
    //   console.log('Email sent successfully');
    //   return NextResponse.json({ message: 'Message sent successfully!' }, { status: 200 });
    // } catch (error) {
    //   console.error('Error sending email:', error);
    //   return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 500 });
    // }

    // For now, we'll just log it to the server console as a simulation
    console.log('Received contact form submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Message:', message);
    console.log('--- Email would be sent to warriorrudra2009@gmail.com ---');

    return NextResponse.json({ message: 'Message received successfully! (Simulated Send)' }, { status: 200 });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
