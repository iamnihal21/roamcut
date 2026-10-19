import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

// Safely import notifications (only outside Expo Go)
let Notifications: any = null;
if (Constants.appOwnership !== 'expo') {
  Notifications = require('expo-notifications');
}

// Language keys we support
type LanguageKey = 'en' | 'hi' | 'ja' | 'de' | 'ar';

// Notification types from SOW Section 10
export type NotificationType =
  | 'unfinished_reel'
  | 'weekly_inspiration'
  | 'new_template'
  | 'travel_memory'
  | 'pro_trial'
  | 'achievement';

type LocalizedCopy = Record<LanguageKey, string>;
type CopyMap = Record<NotificationType, LocalizedCopy>;

const COPY: CopyMap = {
  unfinished_reel: {
    en: 'Your Bali sunset is waiting to shine. Finish your reel?',
    hi: 'आपका बाली सूर्यास्त चमकने का इंतज़ार कर रहा है। अपनी रील पूरी करें?',
    ja: 'あなたのバリの夕日が輝くのを待っています。リールを完成させますか？',
    de: 'Dein Bali-Sonnenuntergang wartet. Reel fertigstellen?',
    ar: 'Ghuroub Bali yantziruoka. Hal tukmil al-reel?',
  },
  weekly_inspiration: {
    en: "Weekend vibes? Drop your clips, we'll make the magic.",
    hi: 'वीकेंड है! क्लिप्स डालो, मैजिक हम करेंगे।',
    ja: '週末の気分？クリップを入れて、魔法をかけます。',
    de: 'Wochenend-Vibes? Clips rein, wir machen die Magie.',
    ar: "Ajwaa' nihayat al-usbuu'? Alqi maqati'ak, sanas'na' al-sihr.",
  },
  new_template: {
    en: 'New template just landed: Neon Nights. Your city clips will thank you.',
    hi: 'नया टेम्पलेट आया है: Neon Nights।',
    ja: '新テンプレート登場：Neon Nights。',
    de: 'Neue Vorlage: Neon Nights.',
    ar: 'Qalab jadid: Neon Nights.',
  },
  travel_memory: {
    en: 'Remember that trip? Your videos are still here, ready to become reels.',
    hi: 'वो ट्रिप याद है? आपके वीडियो अभी भी यहाँ हैं।',
    ja: 'あの旅行を覚えていますか？',
    de: 'Erinnerst du dich an die Reise?',
    ar: 'Tatadhakkar tilka al-rihla?',
  },
  pro_trial: {
    en: 'Your Pro trial ends tomorrow. Keep all 20 templates unlocked?',
    hi: 'आपका Pro ट्रायल कल खत्म हो रहा है।',
    ja: 'Proトライアルは明日終了します。',
    de: 'Deine Pro-Testversion endet morgen.',
    ar: 'Tajribat Pro tantahi ghadan.',
  },
  achievement: {
    en: "5 reels and counting! You're officially a creator.",
    hi: '5 रील्स और गिनती जारी! आप अब एक क्रिएटर हैं।',
    ja: '5つのリール達成！あなたは正式にクリエイターです。',
    de: '5 Reels und es werden mehr! Du bist ein Creator.',
    ar: '5 reels wa al-adad yazdad!',
  },
};

function getLocalizedCopy(type: NotificationType, language: string): string {
  const copySet = COPY[type];
  const key: LanguageKey = (language as LanguageKey) in copySet ? (language as LanguageKey) : 'en';
  return copySet[key];
}

export async function registerForNotificationsAsync(): Promise<boolean> {
  if (!Notifications) {
    Alert.alert(
      'Expo Go Limitation',
      'Local notifications require a Development Build on Android SDK 53+.'
    );
    return false;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E17055',
      });
      console.log('[Notifications] Channel created');
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('[Notifications] Existing permission:', existingStatus);

    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      console.log('[Notifications] Requesting permission...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('[Notifications] New permission:', finalStatus);
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Notifications are blocked. Please enable them in system settings.'
      );
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('[Notifications] register error:', error);
    Alert.alert('Notification Error', error.message);
    return false;
  }
}

export async function triggerTestNotification(language: string = 'en') {
  if (!Notifications) {
    Alert.alert('Expo Go Limitation', 'Please use a Development Build to test notifications.');
    return;
  }

  try {
    const body = getLocalizedCopy('unfinished_reel', language);
    console.log('[Notifications] Scheduling test with body:', body);

    const perm = await Notifications.getPermissionsAsync();
    console.log('[Notifications] Permission before schedule:', perm.status);

    if (perm.status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      console.log('[Notifications] Requested, result:', requested.status);
      if (requested.status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please allow notifications in the emulator settings to test this.'
        );
        return;
      }
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'RoamCut',
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
      } as any,
    });

    console.log('[Notifications] Scheduled successfully. ID:', id);
    Alert.alert('Scheduled!', 'Notification will fire in 3 seconds. Press Home to background the app.');
  } catch (error: any) {
    console.error('[Notifications] trigger error:', error);
    Alert.alert('Failed to Trigger', error.message || String(error));
  }
}

export async function scheduleNotification(
  type: NotificationType,
  language: string = 'en',
  delaySeconds: number
) {
  if (!Notifications) return;
  const body = getLocalizedCopy(type, language);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'RoamCut',
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
    },
  });
}

export async function scheduleWeeklyInspiration(language: string = 'en') {
  if (!Notifications) return;
  const body = getLocalizedCopy('weekly_inspiration', language);

  const trigger =
    Platform.OS === 'ios'
      ? {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday: 1,
          hour: 10,
          minute: 0,
          repeats: true,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: 1,
          hour: 10,
          minute: 0,
        };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'RoamCut',
      body,
      sound: true,
    },
    trigger: trigger as any,
  });
}

export async function scheduleUnfinishedReel(language: string = 'en') {
  if (!Notifications) return;
  const body = getLocalizedCopy('unfinished_reel', language);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'RoamCut',
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 7200,
    },
  });
}