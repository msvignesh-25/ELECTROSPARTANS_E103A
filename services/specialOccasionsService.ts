// Special Occasions Service - Manages special occasion reminders for advertising

export interface SpecialOccasion {
  id: string;
  name: string;
  date: Date;
  type: 'holiday' | 'festival' | 'seasonal' | 'custom';
  reminderSent: boolean;
  advertisingReminders: {
    webpage: boolean;
    instagram: boolean;
  };
}

// Common special occasions
const COMMON_OCCASIONS: Omit<SpecialOccasion, 'id' | 'reminderSent' | 'advertisingReminders'>[] = [
  { name: 'New Year', date: new Date(new Date().getFullYear(), 0, 1), type: 'holiday' },
  { name: 'Valentine\'s Day', date: new Date(new Date().getFullYear(), 1, 14), type: 'holiday' },
  { name: 'Easter', date: new Date(new Date().getFullYear(), 3, 1), type: 'holiday' },
  { name: 'Independence Day', date: new Date(new Date().getFullYear(), 6, 4), type: 'holiday' },
  { name: 'Halloween', date: new Date(new Date().getFullYear(), 9, 31), type: 'holiday' },
  { name: 'Thanksgiving', date: new Date(new Date().getFullYear(), 10, 23), type: 'holiday' },
  { name: 'Christmas', date: new Date(new Date().getFullYear(), 11, 25), type: 'holiday' },
  { name: 'Diwali', date: new Date(new Date().getFullYear(), 9, 15), type: 'festival' },
  { name: 'Eid', date: new Date(new Date().getFullYear(), 3, 10), type: 'festival' },
  { name: 'Summer Sale', date: new Date(new Date().getFullYear(), 5, 1), type: 'seasonal' },
  { name: 'Winter Sale', date: new Date(new Date().getFullYear(), 11, 1), type: 'seasonal' },
];

// Check for upcoming special occasions (within 7 days)
export function checkUpcomingOccasions(): SpecialOccasion[] {
  const saved = loadOccasions();
  const today = new Date();
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  // Initialize with common occasions if not already saved
  if (saved.length === 0) {
    const occasions: SpecialOccasion[] = COMMON_OCCASIONS.map(occ => ({
      ...occ,
      id: `occasion_${occ.name}_${occ.date.getTime()}`,
      reminderSent: false,
      advertisingReminders: {
        webpage: false,
        instagram: false,
      },
    }));
    saveOccasions(occasions);
    return occasions.filter(occ => 
      occ.date >= today && occ.date <= sevenDaysFromNow && !occ.reminderSent
    );
  }

  return saved.filter(occ => {
    const occDate = new Date(occ.date);
    return occDate >= today && occDate <= sevenDaysFromNow && !occ.reminderSent;
  });
}

// Generate reminder message for special occasion
export function generateOccasionReminder(occasion: SpecialOccasion): string {
  const daysUntil = Math.ceil(
    (new Date(occasion.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return `🎉 Special Occasion Alert: ${occasion.name} is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}!
    
Don't forget to:
- Update your webpage with special ${occasion.name} promotions
- Post on Instagram about your ${occasion.name} special offers
- Prepare special products/services for ${occasion.name}

This is a great opportunity to boost sales!`;
}

// Mark occasion reminder as sent
export function markOccasionReminderSent(occasionId: string, platform: 'webpage' | 'instagram') {
  const occasions = loadOccasions();
  const updated = occasions.map(occ => 
    occ.id === occasionId 
      ? { 
          ...occ, 
          advertisingReminders: {
            ...occ.advertisingReminders,
            [platform]: true,
          },
          reminderSent: occ.advertisingReminders.webpage && occ.advertisingReminders.instagram,
        }
      : occ
  );
  saveOccasions(updated);
}

// Store occasions
export function saveOccasions(occasions: SpecialOccasion[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('specialOccasions', JSON.stringify(occasions));
  }
}

export function loadOccasions(): SpecialOccasion[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('specialOccasions');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
}

// Add custom occasion
export function addCustomOccasion(name: string, date: Date): SpecialOccasion {
  const occasions = loadOccasions();
  const newOccasion: SpecialOccasion = {
    id: `occasion_custom_${Date.now()}`,
    name,
    date,
    type: 'custom',
    reminderSent: false,
    advertisingReminders: {
      webpage: false,
      instagram: false,
    },
  };
  
  occasions.push(newOccasion);
  saveOccasions(occasions);
  return newOccasion;
}
