import React, { useEffect, useState, useRef } from 'react';
import { MessageCircle, ThumbsUp, Share2 } from 'lucide-react';

interface Message {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  isTestimonial?: boolean;
}

const Community = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const testimonials = [
    {
      author: "Marie Nguembou",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      content: "Je suis tellement heureuse d'avoir investi avec DubaiWealth Horizon ! Mon investissement initial de 25,000 FCFA a déjà généré 5,000 FCFA en seulement 2 semaines. Le support est très réactif et professionnel. 🌟",
    },
    {
      author: "Paul Kamga",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      content: "Grâce au Plan Saphir, j'ai pu générer un revenu passif stable. Les paiements sont toujours à l'heure et le support WhatsApp est très efficace. Je recommande vivement ! 💎",
    },
    {
      author: "Sophie Fotso",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      content: "Le système de parrainage est excellent ! J'ai déjà parrainé 5 personnes et les commissions sont très intéressantes. C'est une vraie opportunité de croissance. 🚀",
    },
    {
      author: "Jean Tamba",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      content: "J'ai commencé avec le Plan Bronze et j'ai progressivement augmenté mes investissements. La plateforme est très intuitive et les rendements sont excellents. 📈",
    }
  ];

  const generateRandomMessage = () => {
    const randomMessages = [
    "Je viens de recevoir mon paiement quotidien via Orange Money, toujours à l'heure ! 🕒💸",
    "Le support WhatsApp est hyper réactif, ils répondent en moins de 2 minutes ! 🔥",
    "J'ai choisi le **Plan Suprême**, objectif 100,000 FCFA par jour ! 🚀💎",
    "Mon investissement de 50,000 FCFA a généré 10,000 FCFA en quelques jours ! 📈",
    "Le **Plan Rubis** est parfait pour commencer, petit investissement, gros bénéfices ! 💰",
    "Retrait instantané avec MTN Mobile Money, hyper pratique ! 🎯",
    "La plateforme est fluide et facile à utiliser, même pour les débutants ! 💫",
    "Les bonus de parrainage sont incroyables, j'ai déjà reçu 5,000 FCFA en primes ! 🌟",
    "Mon frère vient d'activer le **Plan Impérial**, on investit en famille ! 🤝",
    "Les paiements sont ultra-rapides, je reçois mon argent en moins de 5 minutes ! ⏳💵",
    "Je viens de passer au **Plan Diamant**, mon objectif est 50,000 FCFA par jour ! 💎",
    "Le **Plan Émeraude** est top pour débuter, je teste avec 20,000 FCFA ! ✨",
    "J'ai déjà triplé mon investissement avec le **Plan Légendaire** ! 🔥",
    "Les rendements quotidiens sont fiables et garantis, ça rassure ! ✅",
    "Chaque retrait se fait en un clic, zéro complication ! 📲",
    "Grâce au **Plan Or**, j’ai déjà récupéré mon capital initial ! 💰",
    "Le **Plan Bronze** est accessible à tous, même avec un petit budget ! 💡",
    "Mon premier retrait de 30,000 FCFA vient d'arriver sur mon compte ! 🚀",
    "J’ai activé le **Plan Platine**, objectif : indépendance financière ! 🔑",
    "Les paiements sont 100% automatiques, aucune intervention nécessaire ! 🤖",
    "Je reçois mon argent tous les jours sans aucun retard ! ⏰",
    "Grâce au **Plan Saphir**, j’ai pu commencer avec un bon retour sur investissement ! 💎",
    "Ma femme et moi avons activé le **Plan Royal**, on investit ensemble ! 💑",
    "J’ai gagné un bonus de 10,000 FCFA en parrainant 3 amis ! 🎁",
    "Le **Plan Suprême** est une machine à cash, les profits sont énormes ! 🔥",
    "Le support client est toujours disponible et super efficace ! 📞",
    "Je suis serein, les paiements arrivent toujours à temps ! 🕐",
    "Avec le **Plan Impérial**, mes revenus passifs explosent ! 💰",
    "Je viens de valider mon retrait, l'argent arrive en quelques minutes ! 💳",
    "Grâce à cette plateforme, je me fais un complément de revenu tous les jours ! 💵",
    "Les retraits sont faciles et rapides, j’adore ! 🚀",
    "J’ai déjà reçu plusieurs paiements, aucun souci jusqu’à présent ! ✅",
    "Mon parrain m’a conseillé le **Plan Émeraude**, et c'est un excellent choix ! 🌟",
    "J’ai réinvesti mes gains et augmenté mon capital, objectif : liberté financière ! 🚀",
    "Le **Plan Diamant** me permet de retirer plus chaque jour, c'est top ! 💎",
    "J'ai activé le **Plan Royal**, et les profits sont incroyables ! 👑",
    "J'investis mes gains au fur et à mesure, c'est un cercle vertueux ! 🔄",
    "Je viens de recevoir 50,000 FCFA en un seul retrait ! 🔥",
    "Les taux de retour sont imbattables, je recommande à tous ! 📈",
    "Je commence à préparer mon prochain investissement avec le **Plan Légendaire** ! 💡",
    "Avec le **Plan Platine**, mes gains augmentent chaque semaine ! 💸",
    "Je suis satisfait de cette plateforme, fiable et rentable ! 🎯",
    "Les témoignages étaient vrais, cette plateforme tient ses promesses ! 🙌",
    "J'ai convaincu mon cousin d'investir, il est déjà ravi ! 🤝",
    "Les gains sont constants et sécurisés, aucun stress ! 🏆",
    "J’ai reçu mon paiement plus vite que prévu, c'est incroyable ! ⏩",
    "Je vais passer au **Plan Suprême**, les rendements sont trop intéressants ! 🚀",
    "La gestion des retraits est impeccable, zéro souci ! ✅",
    "J’ai atteint mon premier objectif grâce au **Plan Or** ! 🥇",
    "Avec cette plateforme, chaque jour est une opportunité de gagner plus ! 📊",
    "Je viens de retirer mes bénéfices en quelques secondes, c’est impressionnant ! ⚡",
    "Mon premier retrait de 15,000 FCFA est arrivé sans problème ! 🎉",
    "Le **Plan Émeraude** est top pour ceux qui débutent ! 🌟",
    "Les gains quotidiens sont bien supérieurs à ce que j'imaginais ! 💰",
    "Je vais bientôt upgrader vers le **Plan Impérial** pour maximiser mes profits ! 👑",
    "Chaque retrait est une preuve que la plateforme est fiable ! 📑",
    "Ma meilleure décision de l’année : rejoindre cette plateforme ! 🚀",
    "Grâce au **Plan Bronze**, j'ai commencé petit et ça monte vite ! 📈",
    "Je viens de parrainer un ami, et j’ai reçu mon bonus instantanément ! 🎁",
    "Je suis impressionné par la stabilité des paiements ! 🔥",
    "Les retraits sont ultra-rapides, c’est du jamais vu ! ⏳",
    "Je recommande à tous ceux qui veulent des revenus passifs ! 💡",
    "Je viens d’augmenter mon investissement, ça devient sérieux ! 🚀",
    "Le **Plan Légendaire** porte bien son nom, les rendements sont incroyables ! 🏆",
    "Je suis en route pour l’indépendance financière grâce à cette plateforme ! 🌍",
    "Chaque jour, je gagne un peu plus, et ça fait plaisir ! 💸",
    "Le **Plan Saphir** me permet d’avoir des retraits réguliers ! 💎",
    "J’ai converti mes gains en nouvel investissement, c'est du solide ! 💡",
    "Le service client est super efficace, bravo à l’équipe ! 👏",
    "Je n’ai jamais eu de retard de paiement, c'est du sérieux ! ✅",
    "Grâce à cette plateforme, j’ai un revenu stable chaque jour ! 💰",
    "J’ai reçu mon bonus de bienvenue après mon premier dépôt, c’est génial ! 🎉",
    "Avec le **Plan Royal**, mes bénéfices sont passés à un autre niveau ! 👑",
    "Les retraits automatiques, c'est un vrai plus ! 🏦",
    "Ma famille et moi avons tous rejoint la plateforme, c’est du solide ! 🤝",
    "Je viens de retirer mes bénéfices, aucun souci ! 💸",
    "Les taux de rentabilité sont imbattables, j’adore ! 🔥",
    "Le **Plan Diamant** est parfait pour booster mes gains rapidement ! 💎",
    "Chaque jour, un nouveau retrait, c’est une habitude maintenant ! 🔄",
    "Cette plateforme me permet d’investir intelligemment et sereinement ! ✅",
    "Je viens de retirer mes gains en un clic, c'est trop simple ! 📲",
    "Les transactions sont instantanées et sécurisées, c'est top ! 🔒",
    "Mon ami m'a recommandé cette plateforme, et je ne regrette pas ! 🎯",
    "Chaque matin, je me réveille avec des gains, quel plaisir ! 🌞",
    "Je vise le **Plan Suprême**, car c’est là que ça devient intéressant ! 🚀",
    "Les bonus de fidélité sont un vrai avantage, ça motive ! 🎁",
    "Les paiements sont fiables et toujours ponctuels ! ✅",
    "Avec le **Plan Légendaire**, mes gains explosent chaque jour ! 💸"
];


    const randomAvatars = [
      "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1",
  "https://images.unsplash.com/photo-1530785602389-07594beb8b73",
  "https://images.unsplash.com/photo-1565884280295-98eb83e41c65",
  "https://images.unsplash.com/photo-1510736769521-207ed84f191e",
  "https://images.unsplash.com/photo-1539887523427-bb750641ad29",
  "https://images.unsplash.com/photo-1531300185372-b7cbe2eddf0b",
  "https://images.unsplash.com/photo-1593351799227-75df2026356b",
  "https://images.unsplash.com/photo-1563721573206-bd9a9fb33a37",
  "https://images.unsplash.com/photo-1531123414780-f74242c2b052",
  "https://images.unsplash.com/photo-1545291730-faff8ca1d4b0",
  "https://images.unsplash.com/photo-1539702169544-c0bcff87fcd7",
  "https://images.unsplash.com/photo-1529688530647-93a6e1916f5f",
  "https://images.unsplash.com/photo-1531727991582-cfd25ce79613",
  "https://images.unsplash.com/photo-1570158268183-d296b2892211",
  "https://images.unsplash.com/photo-1591251436930-a1e858c633a1",
  "https://images.unsplash.com/photo-1529123202249-4f6224196c9b",
  "https://images.unsplash.com/photo-1531384698654-7f6e477ca221",
  "https://images.unsplash.com/photo-1506634572416-48cdfe530110",
  "https://images.unsplash.com/photo-1551026395-44699d859bbb",
  "https://images.unsplash.com/photo-1532076904124-d4e8fe7fbbec",
  "https://images.unsplash.com/photo-1582876533492-51fd2f162272",
  "https://images.unsplash.com/photo-1531475925016-6d33cb7c8344",
  "https://images.unsplash.com/photo-1556300219-2d2fdd6266d3",
  "https://images.unsplash.com/photo-1527201987695-67c06571957e",
  "https://images.unsplash.com/photo-1626124295887-ca75ab69331c",
  "https://images.unsplash.com/photo-1543366749-ad19659450ef",
  "https://images.unsplash.com/photo-1508511267-5a04ee04ca95",
  "https://images.unsplash.com/photo-1583823129868-b59a5a9cbeb6",
  "https://images.unsplash.com/photo-1531901599143-df5010ab9438",
  "https://images.unsplash.com/photo-1512633017083-67231aba710d",
  "https://images.unsplash.com/photo-1586233829070-eb766ce733f5",
  "https://images.unsplash.com/photo-1632765854612-9b02b6ec2b15",
  "https://images.unsplash.com/photo-1509679708047-e0e562d21e44",
  "https://images.unsplash.com/photo-1504199367641-aba8151af406",
  "https://images.unsplash.com/photo-1529832394543-39c86aee0214",
  "https://images.unsplash.com/photo-1533469513-03bfed91f496",
  "https://images.unsplash.com/photo-1519164497992-65f6b58a2981",
  "https://images.unsplash.com/photo-1523297736436-356615162cc8"
    ];

    const randomNames = [
      'Jean', 'Marie', 'Pierre', 'Sophie', 'Lucas', 'Emma', 'Thomas', 'Julie', 'Nicolas', 'Laura',
  'Alexandre', 'Sarah', 'Mohammed', 'Fatima', 'John', 'Maria', 'David', 'Anna', 'Carlos', 'Yuki',
  'Aïcha', 'Abdoulaye', 'Aminata', 'Boubacar', 'Chantal', 'Djamila', 'El Hadj', 'Fanta', 'Ibrahima', 'Kadiatou',
  'Mamadou', 'Nafissatou', 'Oumar', 'Ramatoulaye', 'Sékou', 'Tidiane', 'Zainab', 'Yacouba', 'Ousmane', 'Awa',
  'Bintou', 'Cheick', 'Diarra', 'Fadel', 'Habib', 'Ismaël', 'Kadija', 'Lamine', 'Maimouna', 'Néné',
  'Pape', 'Rokhaya', 'Samba', 'Téné', 'Waly', 'Youssouf', 'Zalika', 'Adama', 'Bakary', 'Coumba',
  'Daouda', 'Faty', 'Gora', 'Hawa', 'Idrissa', 'Jelila', 'Kader', 'Lalla', 'Moussa', 'Nafi',
  'Ousmane', 'Penda', 'Rama', 'Saliou', 'Tahirou', 'Umar', 'Véronique', 'Wade', 'Yacine', 'Zara','Dupont', 'Laurent', 'Martin', 'Bernard', 'Dubois', 'Petit', 'Moreau', 'Leroy', 'Roux', 'Michel',
  'Chen', 'Al-Rashid', 'Hassan', 'Smith', 'Garcia', 'Kim', 'Kowalski', 'Rodriguez', 'Tanaka', 'Sow',
  'Diallo', 'Traoré', 'Keita', 'Cissé', 'Ba', 'Ndiaye', 'Diop', 'Fall', 'Gueye', 'Kane',
  'Sy', 'Mbaye', 'Diagne', 'Camara', 'Sarr', 'Thiam', 'Touré', 'Niang', 'Bâ', 'Diakhaté',
  'Faye', 'Mendy', 'Sane', 'Diaw', 'Sakho', 'Diouf', 'Ly', 'Badiane', 'Gassama', 'Coly',
  'Ndao', 'Sagna', 'Mané', 'Samb', 'Dione', 'Diatta', 'Sène', 'Gning', 'Diédhiou', 'Sall',
  'Ndour', 'Diouf', 'Gaye', 'Ndiaye', 'Sow', 'Diallo', 'Traoré', 'Keita', 'Cissé', 'Ba',
  'Ndiaye', 'Diop', 'Fall', 'Gueye', 'Kane', 'Sy', 'Mbaye', 'Diagne', 'Camara', 'Sarr',
  'Thiam', 'Touré', 'Niang', 'Bâ', 'Diakhaté', 'Faye', 'Mendy', 'Sane', 'Diaw', 'Sakho',
  'Diouf', 'Ly', 'Badiane', 'Gassama', 'Coly', 'Ndao', 'Sagna', 'Mané', 'Samb', 'Dione',
  'Diatta', 'Sène', 'Gning', 'Diédhiou', 'Sall', 'Ndour', 'Diouf', 'Gaye', 'Ndiaye', 'Sow',
  'Diallo', 'Traoré', 'Keita', 'Cissé', 'Ba', 'Ndiaye', 'Diop', 'Fall', 'Gueye', 'Kane',
  'Sy', 'Mbaye', 'Diagne', 'Camara', 'Sarr', 'Thiam', 'Touré', 'Niang', 'Bâ', 'Diakhaté',
  'Faye', 'Mendy'
    ];

    return {
      id: Date.now(),
      author: randomNames[Math.floor(Math.random() * randomNames.length)],
      avatar: `${randomAvatars[Math.floor(Math.random() * randomAvatars.length)]}?auto=format&fit=facearea&facepad=2&w=300&h=300&q=80`,
      content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
      timestamp: new Date(),
      likes: Math.floor(Math.random() * 50) + 1
    };
  };

  useEffect(() => {
    // Initial messages including testimonials
    const initialMessages = testimonials.map((testimonial, index) => ({
      id: index,
      ...testimonial,
      timestamp: new Date(Date.now() - index * 60000),
      likes: Math.floor(Math.random() * 50) + 20,
      isTestimonial: true
    }));

    setMessages(initialMessages);

    // Add new message every 2-5 seconds
    const interval = setInterval(() => {
      setMessages(prev => {
        const newMessage = generateRandomMessage();
        return [newMessage, ...prev.slice(0, 49)]; // Keep only last 50 messages
      });
    }, Math.random() * 3000 + 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current && autoScroll) {
      const scrollAnimation = chatContainerRef.current.animate(
        [
          { transform: 'translateY(20px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ],
        {
          duration: 500,
          easing: 'ease-out'
        }
      );

      scrollAnimation.onfinish = () => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = 0;
        }
      };
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      setAutoScroll(scrollTop === 0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-blue-600 text-white">
            <h1 className="text-2xl font-bold flex items-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              Communauté DubaiWealth Horizon
            </h1>
            <p className="mt-2 text-blue-100">
              Discussions en direct de notre communauté
            </p>
          </div>

          {/* Messages Feed */}
          <div 
            ref={chatContainerRef}
            className="h-[600px] overflow-y-auto scroll-smooth"
            onScroll={handleScroll}
          >
            <div className="space-y-4 p-6">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex space-x-4 p-4 rounded-lg transform transition-all duration-300 hover:scale-[1.02] ${
                    message.isTestimonial ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <img
                    src={message.avatar}
                    alt={message.author}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{message.author}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-600">{message.content}</p>
                    <div className="mt-2 flex items-center space-x-4">
                      <button className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span className="text-sm">{message.likes}</span>
                      </button>
                      <button className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                        <Share2 className="h-4 w-4 mr-1" />
                        <span className="text-sm">Partager</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;