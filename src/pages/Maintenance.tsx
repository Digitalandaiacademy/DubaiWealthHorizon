import { useEffect, useState } from "react";

export default function Maintenance() {
  // --- Date fixe + 15 jours ---
  const launchDate = new Date("2025-09-04T00:01:01");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    document.title = "🚀 DubaiWealth Horizon V2.0 - Maintenance";

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() + 15 * 24 * 60 * 60 * 1000 - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 8px #00d4ff, 0 0 16px #00d4ff, 0 0 24px #00d4ff; }
          50% { text-shadow: 0 0 16px #00d4ff, 0 0 32px #00d4ff, 0 0 48px #00d4ff; }
        }
        .glow-text { animation: glow 2s ease-in-out infinite; }
        .glass {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
        }
        .particle {
          position: absolute;
          background: #00d4ff;
          border-radius: 50%;
          opacity: 0.5;
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>

      <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white text-center p-6 overflow-hidden">
        {/* Particules en fond */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDelay: `${Math.random() * 6}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Titre */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 glow-text text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            🚀 DubaiWealth Horizon V2.0 🚀
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
            Le site est en maintenance depuis le{" "}
            <strong className="text-cyan-400">04/09/2025 à 00:01:01</strong>.<br />
            <strong className="text-green-400">Aucune donnée ne sera perdue</strong> : vos gains resteront intacts, ainsi que vos investissements.<br />
            Nous préparons une nouvelle version exceptionnelle avec des
            fonctionnalités innovantes, incluant la diminution du temps d'attente des retraits et le passage à la V2.0.<br />
            La maintenance prendra fin à la date affichée ci-dessous :
          </p>

          {/* Compte à rebours (horizontal) */}
          <div className="flex justify-center items-center gap-6 flex-wrap mb-12">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div
                key={unit}
                className="glass rounded-2xl px-6 py-4 shadow-xl min-w-[100px] transition transform hover:scale-110 duration-300"
              >
                <p className="text-5xl font-extrabold text-cyan-400 drop-shadow-lg">
                  {value}
                </p>
                <span className="uppercase text-sm tracking-widest text-gray-300">
                  {unit}
                </span>
              </div>
            ))}
          </div>

          {/* Footer avec icônes */}
          <div className="mt-6 md:mt-10">
            <p className="text-sm sm:text-base text-gray-400 italic mb-6">
              Merci de votre patience — la V2.0 arrive avec des innovations
              révolutionnaires !<br />
              Nous travaillons aussi à réduire le temps de retrait pour une
              meilleure expérience.
            </p>
            <p className="text-xs sm:text-sm text-red-400 italic mt-4">
              NB : Pendant la maintenance, merci de ne pas surcharger vos différents assistants avec des messages et des appels, afin de favoriser la bonne maintenance du site.
            </p>
            <div className="flex justify-center space-x-6 text-3xl">
              <span className="animate-bounce text-cyan-400">⚡</span>
              <span className="animate-pulse text-purple-400">🔮</span>
              <span className="animate-bounce text-blue-400">🚀</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
