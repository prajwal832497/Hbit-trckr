// User Profile Management System - User-Specific Storage
const UserProfile = {
    STORAGE_KEY_PREFIX: 'habitTrackerUser_',

    // Adjectives and nouns for username generation
    adjectives: [
        'Brave', 'Swift', 'Bright', 'Noble', 'Mighty', 'Crystal', 'Golden', 'Silver',
        'Bold', 'Fierce', 'Gentle', 'Wise', 'Cosmic', 'Stellar', 'Radiant', 'Epic',
        'Mystic', 'Thunder', 'Shadow', 'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Wolf',
        'Arctic', 'Blazing', 'Lunar', 'Solar', 'Storm', 'Ocean', 'Mountain', 'Forest'
    ],

    nouns: [
        'Warrior', 'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Lion', 'Falcon', 'Wolf',
        'Ninja', 'Samurai', 'Knight', 'Champion', 'Hero', 'Legend', 'Guardian', 'Sage',
        'Thunder', 'Lightning', 'Storm', 'Flame', 'Frost', 'Shadow', 'Star', 'Moon',
        'Sun', 'Comet', 'Aurora', 'Nebula', 'Galaxy', 'Cosmos', 'Ranger', 'Voyager'
    ],

    avatars: ['😊', '🚀', '⭐', '🎯', '💪', '🔥', '✨', '🌟', '🦁', '🦅', '🐺', '🐉', '⚡', '🌈', '🎨', '🎵'],

    // Get current user ID (same logic as HabitData)
    getCurrentUserId() {
        const authData = JSON.parse(localStorage.getItem('habitTrackerAuth') || '{}');

        if (authData.sub) {
            return authData.sub;
        } else if (authData.provider === 'guest') {
            if (!authData.guestId) {
                authData.guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('habitTrackerAuth', JSON.stringify(authData));
            }
            return authData.guestId;
        } else {
            return 'temp_user';
        }
    },

    // Get user-specific storage key
    getUserStorageKey() {
        const userId = this.getCurrentUserId();
        return this.STORAGE_KEY_PREFIX + userId;
    },

    // Initialize user system
    init() {
        const user = this.getUser();
        if (!user) {
            // First time user - will show welcome modal
            return null;
        }
        return user;
    },

    // Get current user (user-specific)
    getUser() {
        try {
            const key = this.getUserStorageKey();
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading user:', error);
            return null;
        }
    },

    // Save user (user-specific)
    saveUser(user) {
        try {
            const key = this.getUserStorageKey();
            localStorage.setItem(key, JSON.stringify(user));
            return true;
        } catch (error) {
            console.error('Error saving user:', error);
            return false;
        }
    },

    // Create new user
    createUser(customName = null, selectedAvatar = null) {
        const username = customName || this.generateUsername();
        const avatar = selectedAvatar || this.getRandomAvatar();

        const user = {
            username: username,
            avatar: avatar,
            joinDate: new Date().toISOString(),
            totalCheckIns: 0,
            totalHabits: 0,
            longestStreak: 0,
            preferences: {
                greeting: true,
                animations: true
            }
        };

        this.saveUser(user);
        return user;
    },

    // Generate unique username
    generateUsername() {
        const adjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
        const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
        const number = Math.floor(Math.random() * 100);

        return `${adjective}${noun}${number}`;
    },

    // Get random avatar
    getRandomAvatar() {
        return this.avatars[Math.floor(Math.random() * this.avatars.length)];
    },

    // Update user profile
    updateUser(updates) {
        const user = this.getUser();
        if (!user) return false;

        const updatedUser = { ...user, ...updates };
        return this.saveUser(updatedUser);
    },

    // Update user statistics
    updateStats() {
        const user = this.getUser();
        if (!user) return;

        const habits = HabitData.getHabits();
        let totalCheckIns = 0;
        let maxStreak = 0;

        habits.forEach(habit => {
            totalCheckIns += habit.checkIns.length;
            const currentStreak = StreakCalculator.getCurrentStreak(habit.checkIns, habit.type);
            const longestStreak = StreakCalculator.getLongestStreak(habit.checkIns, habit.type);
            maxStreak = Math.max(maxStreak, currentStreak, longestStreak);
        });

        this.updateUser({
            totalCheckIns: totalCheckIns,
            totalHabits: habits.length,
            longestStreak: maxStreak
        });
    },

    // Get greeting based on time of day
    getGreeting() {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return 'Good morning';
        } else if (hour >= 12 && hour < 17) {
            return 'Good afternoon';
        } else if (hour >= 17 && hour < 21) {
            return 'Good evening';
        } else {
            return 'Good night';
        }
    },

    // Get full greeting with username
    getFullGreeting() {
        const user = this.getUser();
        if (!user) return 'Welcome!';

        const greeting = this.getGreeting();
        return `${greeting}, ${user.username}!`;
    },

    // Get motivational message
    getMotivationalMessage() {
        const messages = [
            "Let's build great habits today! 🔥",
            "One day at a time, one habit at a time! ✨",
            "Consistency is the key to success! 💪",
            "You're doing amazing! Keep it up! 🌟",
            "Small steps lead to big changes! 🚀",
            "Make today count! 🎯",
            "Your future self will thank you! 💫",
            "Progress, not perfection! 🌈"
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    },

    // Get days since joined
    getDaysSinceJoined() {
        const user = this.getUser();
        if (!user) return 0;

        const joinDate = new Date(user.joinDate);
        const today = new Date();
        const diffTime = Math.abs(today - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    },

    // Reset user (for testing or user request)
    resetUser() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};
