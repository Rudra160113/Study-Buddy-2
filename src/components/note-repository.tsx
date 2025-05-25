"use client";

import type { Note } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2, Edit3, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  topics: z.string().optional(),
});

type NoteFormValues = z.infer<typeof noteSchema>;

export function NoteRepository() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
      topics: '',
    },
  });

  useEffect(() => {
    const storedNotes = localStorage.getItem('studyNotes');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes).map((note: Note) => ({...note, createdAt: new Date(note.createdAt)})));
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem('studyNotes')) {
        localStorage.setItem('studyNotes', JSON.stringify(notes));
    }
  }, [notes]);

  const onSubmit: SubmitHandler<NoteFormValues> = (data) => {
    if (editingNote) {
      setNotes(notes.map(note => note.id === editingNote.id ? { ...editingNote, ...data, createdAt: new Date() } : note));
      toast({ title: "Note Updated", description: `"${data.title}" has been updated.` });
      setEditingNote(null);
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
      };
      setNotes([newNote, ...notes]); // Add new notes to the top
      toast({ title: "Note Added", description: `"${data.title}" has been added.` });
    }
    form.reset();
  };

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find(note => note.id === id);
    setNotes(notes.filter(note => note.id !== id));
    if (noteToDelete) {
      toast({ title: "Note Deleted", description: `"${noteToDelete.title}" has been removed.`, variant: "destructive" });
    }
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    form.reset({
      title: note.title,
      content: note.content,
      topics: note.topics,
    });
  };
  
  const sortedNotes = [...notes].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{editingNote ? 'Edit Note' : 'Add New Note'}</CardTitle>
          <CardDescription>{editingNote ? 'Update your note details.' : 'Upload and organize your study materials.'}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Photosynthesis Summary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write your notes here..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topics (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Biology, Cellular Respiration" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {editingNote && (
                <Button type="button" variant="outline" onClick={() => { setEditingNote(null); form.reset(); }}>Cancel Edit</Button>
              )}
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editingNote ? <Edit3 className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {editingNote ? 'Update Note' : 'Add Note'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Notes</h2>
        {sortedNotes.length === 0 ? (
          <p className="text-muted-foreground">No notes yet. Add some notes to get started!</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sortedNotes.map(note => (
              <Card key={note.id} className="shadow-md flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {note.title}
                  </CardTitle>
                  {note.topics && <CardDescription>Topics: {note.topics}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm line-clamp-4 whitespace-pre-wrap">{note.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center mt-auto pt-4 border-t">
                   <p className="text-xs text-muted-foreground">
                    Created: {format(new Date(note.createdAt), "PPP p")}
                  </p>
                  <div className="space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(note)} className="text-blue-500 hover:text-blue-700" title="Edit Note">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" title="Delete Note">
                           <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the note "{note.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteNote(note.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
