import type { TimeManagementTip } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Clock, Zap, CheckSquare, Users } from 'lucide-react';
import AnalogClock from './analog-clock'; // Import the new AnalogClock component

const tips: TimeManagementTip[] = [
  {
    id: '1',
    title: 'Prioritize Tasks with the Eisenhower Matrix',
    content: 'Categorize tasks into four quadrants: Urgent/Important, Not Urgent/Important, Urgent/Not Important, Not Urgent/Not Important. Focus on Urgent/Important first.',
    icon: Zap,
  },
  {
    id: '2',
    title: 'Use the Pomodoro Technique',
    content: 'Work in focused 25-minute intervals (Pomodoros) separated by short 5-minute breaks. After four Pomodoros, take a longer 15-30 minute break.',
    icon: Clock,
  },
  {
    id: '3',
    title: 'Time Blocking',
    content: 'Schedule specific blocks of time for each task in your calendar, just like appointments. This helps allocate dedicated focus time.',
    icon: CheckSquare,
  },
  {
    id: '4',
    title: 'Minimize Distractions',
    content: 'Identify your common distractions (social media, notifications) and actively minimize them during study sessions. Use website blockers if necessary.',
    icon: Lightbulb,
  },
  {
    id: '5',
    title: 'Regularly Review Your Schedule',
    content: 'At the end of each day or week, review what you accomplished and adjust your schedule for the upcoming period. This helps stay on track and adapt to changes.',
    icon: Users,
  },
];

export function TimeManagementTips() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-accent/20 p-3 rounded-full w-fit mb-2">
             <BookOpenText className="h-10 w-10 text-accent" />
          </div>
          <CardTitle className="text-3xl font-bold">Master Your Time</CardTitle>
          <CardDescription className="text-lg">
            Discover effective strategies to manage your study time and boost productivity.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8"> {/* Adjusted padding and centered content */}
            <AnalogClock size={280} /> {/* Replaced Image with AnalogClock, size can be adjusted */}
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tips.map(tip => (
          <Card key={tip.id} className="shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              {tip.icon && <tip.icon className="h-8 w-8 text-primary" />}
              <CardTitle className="text-xl">{tip.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tip.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// A fallback icon if needed - already present in the file
const BookOpenText = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    <path d="M6 8h2"></path>
    <path d="M6 12h2"></path>
    <path d="M16 8h2"></path>
    <path d="M16 12h2"></path>
  </svg>
);
