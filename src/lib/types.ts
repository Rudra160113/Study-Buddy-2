export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  deadline: Date;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Changed from fileUrl to content for simplicity
  topics?: string; // Changed from string[] to string for simplicity in form
  createdAt: Date;
}

export interface TimeManagementTip {
  id: string;
  title: string;
  content: string;
  icon?: React.ElementType;
}
