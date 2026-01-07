// Scheduling Service - Manages calendar, reminders, and task scheduling

export interface ScheduledTask {
  id: string;
  task: string;
  day: string;
  time: string;
  assignedTo?: string; // Worker name or "You"
  category: 'daily' | 'weekly' | 'special';
  completed: boolean;
  reminderSent: boolean;
}

export interface Reminder {
  id: string;
  type: 'task' | 'stock' | 'special-occasion' | 'sales-alert';
  message: string;
  date: Date;
  sent: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Store scheduled tasks in localStorage
export function saveScheduledTasks(tasks: ScheduledTask[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('scheduledTasks', JSON.stringify(tasks));
  }
}

export function loadScheduledTasks(): ScheduledTask[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('scheduledTasks');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
}

// Schedule tasks from weekly plan
export function scheduleTasksFromWeeklyPlan(
  weeklyPlan: Array<{ day: string; tasks: string[] }>,
  workers: number
): ScheduledTask[] {
  const scheduledTasks: ScheduledTask[] = [];
  const defaultTimes = {
    'Monday': '09:00',
    'Tuesday': '09:00',
    'Wednesday': '09:00',
    'Thursday': '09:00',
    'Friday': '09:00',
    'Saturday': '10:00',
    'Sunday': '10:00',
  };

  weeklyPlan.forEach((dayPlan, dayIndex) => {
    dayPlan.tasks.forEach((taskText, taskIndex) => {
      // Determine assigned worker
      let assignedTo = 'You';
      if (workers > 1) {
        if (taskText.includes('Worker 1')) {
          assignedTo = 'Worker 1';
        } else if (taskText.includes('Worker 2')) {
          assignedTo = 'Worker 2';
        } else if (taskText.includes('Worker 3')) {
          assignedTo = 'Worker 3';
        }
      }

      // Clean task text (remove worker assignment prefix)
      const cleanTask = taskText.replace(/^(You|Worker \d+):\s*/, '');

      scheduledTasks.push({
        id: `task_${dayPlan.day}_${taskIndex}_${Date.now()}`,
        task: cleanTask,
        day: dayPlan.day,
        time: defaultTimes[dayPlan.day as keyof typeof defaultTimes] || '09:00',
        assignedTo,
        category: 'daily',
        completed: false,
        reminderSent: false,
      });
    });
  });

  saveScheduledTasks(scheduledTasks);
  return scheduledTasks;
}

// Check for tasks due today and send reminders
export function checkAndSendTaskReminders(): Reminder[] {
  const tasks = loadScheduledTasks();
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const reminders: Reminder[] = [];

  tasks.forEach((task) => {
    if (task.day === dayName && !task.completed && !task.reminderSent) {
      reminders.push({
        id: `reminder_${task.id}_${Date.now()}`,
        type: 'task',
        message: `Reminder: ${task.assignedTo || 'You'} - ${task.task}`,
        date: new Date(),
        sent: false,
        priority: 'medium',
      });

      // Mark reminder as sent
      task.reminderSent = true;
    }
  });

  saveScheduledTasks(tasks);
  return reminders;
}

// Get tasks for a specific day
export function getTasksForDay(day: string): ScheduledTask[] {
  const tasks = loadScheduledTasks();
  return tasks.filter(t => t.day === day && !t.completed);
}

// Mark task as completed
export function completeTask(taskId: string) {
  const tasks = loadScheduledTasks();
  const updated = tasks.map(t => 
    t.id === taskId ? { ...t, completed: true } : t
  );
  saveScheduledTasks(updated);
}

// Get upcoming tasks (next 7 days)
export function getUpcomingTasks(): ScheduledTask[] {
  const tasks = loadScheduledTasks();
  const today = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = today.getDay();
  
  const upcomingDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayIndex = (todayIndex + i) % 7;
    upcomingDays.push(days[dayIndex]);
  }

  return tasks.filter(t => 
    upcomingDays.includes(t.day) && !t.completed
  ).sort((a, b) => {
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
  });
}
