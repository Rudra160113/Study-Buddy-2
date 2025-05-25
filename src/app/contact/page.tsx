
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Send, User, MessageSquare, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function ContactUsPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: result.message || "Thank you for your message! We'll get back to you soon.",
          className: "bg-green-500 text-white",
        });
        // Clear the form
        setName('');
        setEmail('');
        setMessage('');
      } else {
        toast({
          title: "Error Sending Message",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not send message. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                Fill out the form below to send us a message.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-muted-foreground" /> Your Name
                  </Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-card focus:ring-primary/50"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-muted-foreground" /> Your Email
                  </Label>
                  <Input 
                    id="email" 
                    placeholder="you@example.com" 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-card focus:ring-primary/50"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" /> Your Message
                  </Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us how we can help..." 
                    rows={5} 
                    required 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-card focus:ring-primary/50"
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
         <p className="text-center text-sm text-muted-foreground mt-10">
            Please note: The contact form currently simulates sending a message to a backend. For actual email delivery to warriorrudra2009@gmail.com, further backend setup with an email service is required.
        </p>
      </div>
    </AppShell>
  );
}
