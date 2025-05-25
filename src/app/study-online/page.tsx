
"use client";

import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Youtube, PlayCircle, BookOpen } from 'lucide-react';

interface VideoPlaceholder {
  id: string;
  title: string;
  description: string;
  thumbnailPlaceholder: React.ReactNode; // For a visual placeholder
  gradeCategory: string;
}

const placeholderVideos: VideoPlaceholder[] = [
  // Elementary
  { id: 'elem1', title: 'Fun with Addition!', description: 'Mathematics - Grade 2', thumbnailPlaceholder: <PlayCircle className="h-16 w-16 text-muted-foreground" />, gradeCategory: 'elementary' },
  { id: 'elem2', title: 'Exploring Plant Life', description: 'Science - Grade 3', thumbnailPlaceholder: <PlayCircle className="h-16 w-16 text-muted-foreground" />, gradeCategory: 'elementary' },
  { id: 'elem3', title: 'Reading Adventures: Short Stories', description: 'English - Grade 4', thumbnailPlaceholder: <PlayCircle className="h-16 w-16 text-muted-foreground" />, gradeCategory: 'elementary' },
  // Middle School
  { id: 'mid1', title: 'Introduction to Algebra', description: 'Mathematics - Grade 7', thumbnailPlaceholder: <PlayCircle className="h-16 w-16 text-muted-foreground" />, gradeCategory: 'middle' },
  { id: 'mid2', title: 'The Solar System Explained', description: 'Science - Grade 6', thumbnailPlaceholder: <PlayCircle className="h-16 w-16 text-muted-foreground" />, gradeCategory: 'middle' },
  { id: 'mid3', title: 'American History: The Revolution', description: 'History - Grade 8', thumbnailPlaceholder: <PlayCircle className="h-16 w-16 text-muted-foreground" />, gradeCategory: 'middle' },
  // High School
  { id: 'high1', title: 'Calculus Basics: Derivatives', description: 'Mathematics - Grade 11', thumbnailPlaceholder: <PlayCircle className="h-16 w-16 text-muted-foreground" />, gradeCategory: 'high' },
  { id: 'high2', title: 'Understanding Chemical Reactions', description: 'Chemistry - Grade 10', thumbnailPlaceholder: <PlayCircle className="h-16 w-16 text-muted-foreground" />, gradeCategory: 'high' },
  { id: 'high3', title: 'Shakespearean Sonnets Analysis', description: 'Literature - Grade 12', thumbnailPlaceholder: <PlayCircle className="h-16 w-16 text-muted-foreground" />, gradeCategory: 'high' },
];

const VideoCard: React.FC<{ video: VideoPlaceholder }> = ({ video }) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="pb-2">
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-3">
          {video.thumbnailPlaceholder}
        </div>
        <CardTitle className="text-lg leading-tight">{video.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{video.description}</p>
      </CardContent>
      <CardFooter>
        {/* Later, you can replace this with an actual link or embed functionality */}
        <p className="text-xs text-primary">Watch on YouTube (Placeholder)</p>
      </CardFooter>
    </Card>
  );
};

export default function StudyOnlinePage() {
  const elementaryVideos = placeholderVideos.filter(v => v.gradeCategory === 'elementary');
  const middleSchoolVideos = placeholderVideos.filter(v => v.gradeCategory === 'middle');
  const highSchoolVideos = placeholderVideos.filter(v => v.gradeCategory === 'high');

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-8">
        <header className="text-center mb-8">
          <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
            <Youtube className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Study Online
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Curated video lessons to help you learn and revise.
          </p>
        </header>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="text-accent h-6 w-6" />Content Note</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    The videos listed below are placeholders to demonstrate how educational content could be organized. 
                    To make this feature functional, you would need to curate actual YouTube videos and embed them here.
                    You can replace these placeholders with iframe embed codes from YouTube.
                </p>
            </CardContent>
        </Card>

        <Tabs defaultValue="middle" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
            <TabsTrigger value="elementary">Elementary (Grades 1-5)</TabsTrigger>
            <TabsTrigger value="middle">Middle School (Grades 6-8)</TabsTrigger>
            <TabsTrigger value="high">High School (Grades 9-12)</TabsTrigger>
          </TabsList>

          <TabsContent value="elementary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elementaryVideos.length > 0 ? (
                elementaryVideos.map(video => <VideoCard key={video.id} video={video} />)
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-10">No placeholder videos for this category yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="middle">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {middleSchoolVideos.length > 0 ? (
                middleSchoolVideos.map(video => <VideoCard key={video.id} video={video} />)
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-10">No placeholder videos for this category yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="high">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highSchoolVideos.length > 0 ? (
                highSchoolVideos.map(video => <VideoCard key={video.id} video={video} />)
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-10">No placeholder videos for this category yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
