export const dictionary = {
  it: {
    nav: {
      title: "Noty",
      login: "Accedi",
      register: "Registrati",
      dashboard: "Dashboard",
    },
    hero: {
      title1: "Il tuo spazio di lavoro,",
      title2: "semplice e fulmineo.",
      subtitle: "Noty è lo strumento definitivo per organizzare le tue idee, sincronizzare i tuoi appunti e mantenere il focus su ciò che conta davvero. Nessuna distrazione, solo produttività.",
      ctaPrimary: "Inizia gratis ora",
      ctaSecondary: "Accedi al tuo account",
    },
    features: {
      title: "Tutto ciò di cui hai bisogno",
      subtitle: "Progettato per la velocità e costruito per la sicurezza.",
      items: {
        performance: {
          title: "Prestazioni Estreme",
          description: "Nessun tempo di caricamento infinito. La tua dashboard e i tuoi dati sono sempre pronti in una frazione di secondo.",
        },
        security: {
          title: "Massima Sicurezza",
          description: "Proteggiamo le tue informazioni sensibili con crittografia avanzata e le migliori pratiche di sicurezza.",
        },
        sync: {
          title: "Sempre Sincronizzato",
          description: "Inizia a scrivere sul PC e continua sul telefono. I tuoi dati ti seguono ovunque tu vada, senza interruzioni.",
        },
      },
    },
  },

  en: {
    nav: {
      title: "Noty",
      login: "Log in",
      register: "Sign up",
      dashboard: "Dashboard",
    },
    hero: {
      title1: "Your workspace,",
      title2: "simple and lightning fast.",
      subtitle: "Noty is the ultimate tool to organize your ideas, sync your notes, and keep your focus on what truly matters. No distractions, just productivity.",
      ctaPrimary: "Start for free now",
      ctaSecondary: "Log into your account",
    },
    features: {
      title: "Everything you need",
      subtitle: "Designed for speed and built for security.",
      items: {
        performance: {
          title: "Blazing Performance",
          description: "No more endless loading times. Your dashboard and data are always ready in a fraction of a second.",
        },
        security: {
          title: "Top-tier Security",
          description: "We protect your sensitive information with advanced encryption and industry best practices.",
        },
        sync: {
          title: "Always in Sync",
          description: "Start writing on your PC and continue on your phone. Your data follows you everywhere, seamlessly.",
        },
      },
    },
  },

  es: {
    nav: {
      title: "Noty",
      login: "Iniciar sesión",
      register: "Registrarse",
      dashboard: "Panel",
    },
    hero: {
      title1: "Tu espacio de trabajo,",
      title2: "simple y ultrarrápido.",
      subtitle: "Noty es la herramienta definitiva para organizar tus ideas, sincronizar tus notas y mantener el enfoque en lo que realmente importa. Sin distracciones, solo productividad.",
      ctaPrimary: "Empieza gratis ahora",
      ctaSecondary: "Accede a tu cuenta",
    },
    features: {
      title: "Todo lo que necesitas",
      subtitle: "Diseñado para la velocidad y creado para la seguridad.",
      items: {
        performance: {
          title: "Rendimiento Extremo",
          description: "Olvídate de las cargas infinitas. Tu panel y tus datos están siempre listos en una fracción de segundo.",
        },
        security: {
          title: "Máxima Seguridad",
          description: "Protegemos tu información sensible con cifrado avanzado y las mejores prácticas de seguridad.",
        },
        sync: {
          title: "Siempre Sincronizado",
          description: "Empieza a escribir en tu PC y continúa en tu móvil. Tus datos te siguen a donde vayas, sin interrupciones.",
        },
      },
    },
  },

  jap: {
    nav: {
      title: "ノーティ",
      login: "ログイン",
      register: "登録",
      dashboard: "ダッシュボード",
    },
    hero: {
      title1: "あなたのワークスペース、",
      title2: "シンプルで高速。",
      subtitle: "Notyは、アイデアの整理、ノートの同期、本当に重要なことに集中するための最適なツールです。無駄なものはなく、生産性だけ。",
      ctaPrimary: "今すぐ無料で始める",
      ctaSecondary: "アカウントにログイン",
    },
    features: {
      title: "必要なものがすべて揃っています",
      subtitle: "高速性を重視し、安全性を前提に設計されています。",
      items: {
        performance: {
          title: "圧倒的なパフォーマンス",
          description: "長い読み込み時間は不要。ダッシュボードとデータは常に一瞬で表示されます。",
        },
        security: {
          title: "最高レベルのセキュリティ",
          description: "高度な暗号化と業界標準のベストプラクティスで、機密情報を保護します。",
        },
        sync: {
          title: "常に同期",
          description: "PCで書き始めて、スマホで続けられます。データはどこでもシームレスに利用できます。",
        },
      },
    },
  },
};

export type Language = keyof typeof dictionary;