import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'uz' | 'ru';

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

// Translation keys and values
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.timeline': 'Timeline',
    'nav.growth': 'Growth',
    'nav.reminders': 'Reminders',
    'nav.nutrition': 'Nutrition',
    'nav.multimedia': 'Media',
    'nav.illness': 'Illness Info',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.welcome': 'Welcome back! Sign in to manage your child\'s health.',
    'auth.createAccount': 'Create your account to start managing your child\'s health.',
    'auth.chooseRole': 'Choose Your Role',
    'auth.parent': 'Parent',
    'auth.admin': 'Healthcare Professional',
    'auth.parentDesc': 'Track your children\'s health and development',
    'auth.adminDesc': 'Manage content and monitor patient data',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back! Here\'s an overview of your child\'s health today.',
    'dashboard.childProfile': 'Child Profile',
    'dashboard.pendingReminders': 'Pending Reminders',
    'dashboard.mealsPlanned': 'Meals Planned',
    'dashboard.healthCheck': 'Health Check',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.today': 'Today',
    'common.yesterday': 'Yesterday',
    'common.tomorrow': 'Tomorrow',
    
    // Child Profile
    'child.name': 'Child\'s Name',
    'child.dateOfBirth': 'Date of Birth',
    'child.gender': 'Gender',
    'child.male': 'Male',
    'child.female': 'Female',
    'child.bloodType': 'Blood Type',
    'child.allergies': 'Allergies',
    'child.noAllergies': 'No known allergies',
    'child.addChild': 'Add New Child',
    'child.selectChild': 'Select a child',
    
    // Growth Tracker
    'growth.title': 'Growth Tracker',
    'growth.height': 'Height',
    'growth.weight': 'Weight',
    'growth.addRecord': 'Add Record',
    'growth.currentHeight': 'Current Height',
    'growth.currentWeight': 'Current Weight',
    'growth.totalRecords': 'Total Records',
    'growth.measurements': 'measurements',
    
    // Health Reminders
    'reminders.title': 'Health Reminders',
    'reminders.addReminder': 'Add Reminder',
    'reminders.medicine': 'Medicine',
    'reminders.water': 'Water',
    'reminders.sleep': 'Sleep',
    'reminders.meal': 'Meal',
    'reminders.pending': 'Pending',
    'reminders.completed': 'Completed',
    'reminders.markDone': 'Mark Done',
    
    // Time
    'time.daily': 'Daily',
    'time.weekly': 'Weekly',
    'time.monthly': 'Monthly',
    'time.years': 'years',
    'time.months': 'months',
    'time.year': 'year',
    'time.month': 'month',
    'time.old': 'old',
  },
  
  uz: {
    // Navigation
    'nav.dashboard': 'Bosh sahifa',
    'nav.profile': 'Profil',
    'nav.timeline': 'Vaqt chizig\'i',
    'nav.growth': 'O\'sish',
    'nav.reminders': 'Eslatmalar',
    'nav.nutrition': 'Ovqatlanish',
    'nav.multimedia': 'Media',
    'nav.illness': 'Kasallik ma\'lumoti',
    'nav.settings': 'Sozlamalar',
    'nav.logout': 'Chiqish',
    
    // Auth
    'auth.signIn': 'Kirish',
    'auth.signUp': 'Ro\'yxatdan o\'tish',
    'auth.email': 'Email manzil',
    'auth.password': 'Parol',
    'auth.confirmPassword': 'Parolni tasdiqlang',
    'auth.fullName': 'To\'liq ism',
    'auth.welcome': 'Xush kelibsiz! Bolangizning sog\'ligini boshqarish uchun kiring.',
    'auth.createAccount': 'Bolangizning sog\'ligini boshqarishni boshlash uchun hisob yarating.',
    'auth.chooseRole': 'Rolingizni tanlang',
    'auth.parent': 'Ota-ona',
    'auth.admin': 'Tibbiyot xodimi',
    'auth.parentDesc': 'Bolalaringizning sog\'ligi va rivojlanishini kuzating',
    'auth.adminDesc': 'Kontentni boshqaring va bemor ma\'lumotlarini nazorat qiling',
    
    // Dashboard
    'dashboard.title': 'Bosh sahifa',
    'dashboard.welcome': 'Xush kelibsiz! Bugun bolangizning sog\'ligi haqida umumiy ma\'lumot.',
    'dashboard.childProfile': 'Bola profili',
    'dashboard.pendingReminders': 'Kutilayotgan eslatmalar',
    'dashboard.mealsPlanned': 'Rejalashtirilgan ovqatlar',
    'dashboard.healthCheck': 'Sog\'lik tekshiruvi',
    
    // Common
    'common.save': 'Saqlash',
    'common.cancel': 'Bekor qilish',
    'common.edit': 'Tahrirlash',
    'common.delete': 'O\'chirish',
    'common.add': 'Qo\'shish',
    'common.loading': 'Yuklanmoqda...',
    'common.error': 'Xato',
    'common.success': 'Muvaffaqiyat',
    'common.today': 'Bugun',
    'common.yesterday': 'Kecha',
    'common.tomorrow': 'Ertaga',
    
    // Child Profile
    'child.name': 'Bolaning ismi',
    'child.dateOfBirth': 'Tug\'ilgan sana',
    'child.gender': 'Jins',
    'child.male': 'Erkak',
    'child.female': 'Ayol',
    'child.bloodType': 'Qon guruhi',
    'child.allergies': 'Allergiyalar',
    'child.noAllergies': 'Ma\'lum allergiyalar yo\'q',
    'child.addChild': 'Yangi bola qo\'shish',
    'child.selectChild': 'Bolani tanlang',
    
    // Growth Tracker
    'growth.title': 'O\'sish kuzatuvi',
    'growth.height': 'Bo\'y',
    'growth.weight': 'Vazn',
    'growth.addRecord': 'Yozuv qo\'shish',
    'growth.currentHeight': 'Hozirgi bo\'y',
    'growth.currentWeight': 'Hozirgi vazn',
    'growth.totalRecords': 'Jami yozuvlar',
    'growth.measurements': 'o\'lchovlar',
    
    // Health Reminders
    'reminders.title': 'Sog\'liq eslatmalari',
    'reminders.addReminder': 'Eslatma qo\'shish',
    'reminders.medicine': 'Dori',
    'reminders.water': 'Suv',
    'reminders.sleep': 'Uyqu',
    'reminders.meal': 'Ovqat',
    'reminders.pending': 'Kutilayotgan',
    'reminders.completed': 'Bajarilgan',
    'reminders.markDone': 'Bajarildi deb belgilash',
    
    // Time
    'time.daily': 'Har kuni',
    'time.weekly': 'Har hafta',
    'time.monthly': 'Har oy',
    'time.years': 'yosh',
    'time.months': 'oy',
    'time.year': 'yosh',
    'time.month': 'oy',
    'time.old': 'da',
  },
  
  ru: {
    // Navigation
    'nav.dashboard': 'Главная',
    'nav.profile': 'Профиль',
    'nav.timeline': 'Временная шкала',
    'nav.growth': 'Рост',
    'nav.reminders': 'Напоминания',
    'nav.nutrition': 'Питание',
    'nav.multimedia': 'Медиа',
    'nav.illness': 'Информация о болезнях',
    'nav.settings': 'Настройки',
    'nav.logout': 'Выйти',
    
    // Auth
    'auth.signIn': 'Войти',
    'auth.signUp': 'Регистрация',
    'auth.email': 'Email адрес',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Подтвердите пароль',
    'auth.fullName': 'Полное имя',
    'auth.welcome': 'Добро пожаловать! Войдите для управления здоровьем вашего ребенка.',
    'auth.createAccount': 'Создайте аккаунт для управления здоровьем вашего ребенка.',
    'auth.chooseRole': 'Выберите вашу роль',
    'auth.parent': 'Родитель',
    'auth.admin': 'Медицинский работник',
    'auth.parentDesc': 'Отслеживайте здоровье и развитие ваших детей',
    'auth.adminDesc': 'Управляйте контентом и мониторьте данные пациентов',
    
    // Dashboard
    'dashboard.title': 'Главная',
    'dashboard.welcome': 'Добро пожаловать! Вот обзор здоровья вашего ребенка на сегодня.',
    'dashboard.childProfile': 'Профиль ребенка',
    'dashboard.pendingReminders': 'Ожидающие напоминания',
    'dashboard.mealsPlanned': 'Запланированные приемы пищи',
    'dashboard.healthCheck': 'Проверка здоровья',
    
    // Common
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.edit': 'Редактировать',
    'common.delete': 'Удалить',
    'common.add': 'Добавить',
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успех',
    'common.today': 'Сегодня',
    'common.yesterday': 'Вчера',
    'common.tomorrow': 'Завтра',
    
    // Child Profile
    'child.name': 'Имя ребенка',
    'child.dateOfBirth': 'Дата рождения',
    'child.gender': 'Пол',
    'child.male': 'Мужской',
    'child.female': 'Женский',
    'child.bloodType': 'Группа крови',
    'child.allergies': 'Аллергии',
    'child.noAllergies': 'Известных аллергий нет',
    'child.addChild': 'Добавить ребенка',
    'child.selectChild': 'Выберите ребенка',
    
    // Growth Tracker
    'growth.title': 'Отслеживание роста',
    'growth.height': 'Рост',
    'growth.weight': 'Вес',
    'growth.addRecord': 'Добавить запись',
    'growth.currentHeight': 'Текущий рост',
    'growth.currentWeight': 'Текущий вес',
    'growth.totalRecords': 'Всего записей',
    'growth.measurements': 'измерений',
    
    // Health Reminders
    'reminders.title': 'Напоминания о здоровье',
    'reminders.addReminder': 'Добавить напоминание',
    'reminders.medicine': 'Лекарство',
    'reminders.water': 'Вода',
    'reminders.sleep': 'Сон',
    'reminders.meal': 'Еда',
    'reminders.pending': 'Ожидающие',
    'reminders.completed': 'Выполненные',
    'reminders.markDone': 'Отметить выполненным',
    
    // Time
    'time.daily': 'Ежедневно',
    'time.weekly': 'Еженедельно',
    'time.monthly': 'Ежемесячно',
    'time.years': 'лет',
    'time.months': 'месяцев',
    'time.year': 'год',
    'time.month': 'месяц',
    'time.old': '',
  },
};

interface LocalizationProviderProps {
  children: React.ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};