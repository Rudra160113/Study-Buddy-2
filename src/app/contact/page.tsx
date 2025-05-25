
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Send, User, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactUsPage() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, you would handle form submission here (e.g., send an email or save to a database)
    toast({
      title: "Message Sent (Simulated)",
      description: "Thank you for your message! We'll get back to you soon.",
      className: "bg-green-500 text-white",
    });
    // Clear the form (optional)
    (event.target as HTMLFormElement).reset();
  };

  return (
    <AppShell>
      <div className="container mx-auto py-12 px-4 space-y-12">
        <header className="text-center">
          <div className="inline-block bg-primary/10 p-4 rounded-full mb-4 shadow-md">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-3">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions, feedback, or suggestions? We'd love to hear from you!
            Reach out via email or use the form below.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Send className="h-6 w-6 text-accent" />
                Contact Information
              </CardTitle>
              <CardDescription>
                The best way to reach us is via email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Email Us Directly:</p>
                  <a 
                    href="mailto:warriorrudra2009@gmail.com" 
                    className="text-primary hover:underline break-all"
                  >
                    warriorrudra2009@gmail.com
                  </a>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                We typically respond within 24-48 business hours.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-accent" />
                Send Us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below (this is a placeholder and not functional).
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-muted-foreground" /> Your Name
                  </Label>
                  <Input id="name" placeholder="John Doe" type="text" required disabled className="bg-muted/30"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-muted-foreground" /> Your Email
                  </Label>
                  <Input id="email" placeholder="you@example.com" type="email" required disabled className="bg-muted/30"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" /> Your Message
                  </Label>
                  <Textarea id="message" placeholder="Tell us how we can help..." rows={5} required disabled className="bg-muted/30"/>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled>
                  <Send className="mr-2 h-4 w-4" /> Send Message (Disabled)
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
         <p className="text-center text-sm text-muted-foreground mt-10">
            Please note: The contact form is a visual placeholder and does not send messages. For inquiries, please use the email address provided.
        </p>
      </div>
    </AppShell>
  );
}
