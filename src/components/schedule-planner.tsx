"use client";

import type { ScheduleItem } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, PlusCircle, Trash2, Edit3, CheckCircle2, XCircle } from 'lucide-react';
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

const scheduleItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  deadline: z.date({ required_error: "Deadline is required." }),
});

type ScheduleFormValues = z.infer<typeof scheduleItemSchema>;

interface SchedulePlannerProps {
  initialItems?: ScheduleItem[]; // For potential future use with server-side data
}

export function SchedulePlanner({ initialItems = [] }: SchedulePlannerProps) {
  const [items, setItems] = useState<ScheduleItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const { toast } = useToast();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleItemSchema),
    defaultValues: {
      title: '',
      description: '',
      deadline: undefined,
    },
  });

  useEffect(() => {
    const storedItems = localStorage.getItem('scheduleItems');
    if (storedItems) {
      setItems(JSON.parse(storedItems).map((item: ScheduleItem) => ({...item, deadline: new Date(item.deadline)})));
    } else if (initialItems.length > 0) {
        setItems(initialItems);
        localStorage.setItem('scheduleItems', JSON.stringify(initialItems));
    }
  }, [initialItems]);

  useEffect(() => {
    if (items.length > 0 || localStorage.getItem('scheduleItems')) { // Only update if items exist or have been loaded
        localStorage.setItem('scheduleItems', JSON.stringify(items));
    }
  }, [items]);


  const onSubmit: SubmitHandler<ScheduleFormValues> = (data) => {
    if (editingItem) {
      setItems(items.map(item => item.id === editingItem.id ? { ...editingItem, ...data, deadline: data.deadline } : item));
      toast({ title: "Task Updated", description: `"${data.title}" has been updated.` });
      setEditingItem(null);
    } else {
      const newItem: ScheduleItem = {
        id: Date.now().toString(),
        ...data,
        deadline: data.deadline,
        completed: false,
      };
      setItems([...items, newItem]);
      toast({ title: "Task Added", description: `"${data.title}" has been added to your schedule.` });
    }
    form.reset();
  };

  const toggleComplete = (id: string) => {
    setItems(
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    setItems(items.filter(item => item.id !== id));
    if (itemToDelete) {
      toast({ title: "Task Deleted", description: `"${itemToDelete.title}" has been removed.`, variant: "destructive" });
    }
  };

  const startEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      description: item.description,
      deadline: new Date(item.deadline),
    });
  };

  const sortedItems = [...items].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{editingItem ? 'Edit Task' : 'Add New Task'}</CardTitle>
          <CardDescription>{editingItem ? 'Update the details of your task.' : 'Plan your study activities and set deadlines.'}</CardDescription>
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
                      <Input placeholder="e.g., Chapter 5 Reading" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Focus on key concepts and examples" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {editingItem && (
                <Button type="button" variant="outline" onClick={() => { setEditingItem(null); form.reset(); }}>Cancel Edit</Button>
              )}
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editingItem ? <Edit3 className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {editingItem ? 'Update Task' : 'Add Task'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Tasks</h2>
        {sortedItems.length === 0 ? (
          <p className="text-muted-foreground">No tasks yet. Add some tasks to get started!</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sortedItems.map(item => (
              <Card key={item.id} className={cn("shadow-md", item.completed && "bg-muted/50")}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className={cn(item.completed && "line-through text-muted-foreground")}>{item.title}</span>
                    {item.completed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                  </CardTitle>
                  <CardDescription className={cn(item.completed && "line-through text-muted-foreground")}>
                    Deadline: {format(new Date(item.deadline), "PPP p")}
                  </CardDescription>
                </CardHeader>
                {item.description && (
                  <CardContent>
                    <p className={cn("text-sm", item.completed && "line-through text-muted-foreground")}>{item.description}</p>
                  </CardContent>
                )}
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`complete-${item.id}`}
                      checked={item.completed}
                      onCheckedChange={() => toggleComplete(item.id)}
                    />
                    <label htmlFor={`complete-${item.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {item.completed ? 'Completed' : 'Mark as complete'}
                    </label>
                  </div>
                  <div className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(item)} className="text-blue-500 hover:text-blue-700" title="Edit Task">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" title="Delete Task">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task "{item.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteItem(item.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
