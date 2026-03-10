import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Target, TrendingUp, Sparkles } from "lucide-react";
import { useInViewAnimation } from "../../hooks/useInViewAnimation";

export function SavingsGoalAnimation() {
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { ref, isInView } = useInViewAnimation();

  const goal = 2000;
  const currentAmount = Math.floor((progress / 100) * goal);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setShowConfetti(true);
          setTimeout(() => {
            setShowConfetti(false);
            return 0;
          }, 2000);
          return 0;
        }
        return prev + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isInView]);

  const milestones = [
    { percentage: 25, label: "25%", amount: 500 },
    { percentage: 50, label: "50%", amount: 1000 },
    { percentage: 75, label: "75%", amount: 1500 },
    { percentage: 100, label: "Objectif!", amount: 2000 }
  ];

  return (
    <div ref={ref} className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 p-6 flex items-center justify-center relative overflow-hidden">
      {/* Confetti effect */}
      {showConfetti && (
        <>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#10b981', '#3b82f6', '#a855f7', '#f59e0b'][i % 4],
                left: `${Math.random() * 100}%`,
                top: '-10%'
              }}
              initial={{ y: 0, opacity: 1, rotate: 0 }}
              animate={{
                y: 500,
                opacity: 0,
                rotate: 360,
                x: (Math.random() - 0.5) * 200
              }}
              transition={{ duration: 2, delay: i * 0.05 }}
            />
          ))}
        </>
      )}

      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-semibold">Vacances d'été</h3>
            </div>
            <motion.div
              animate={{ rotate: showConfetti ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </motion.div>
          </div>

          {/* Goal amount */}
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">Objectif</div>
            <div className="text-4xl font-bold text-emerald-700 mb-4">{goal} €</div>

            <motion.div
              className="text-2xl font-semibold text-emerald-600"
              key={currentAmount}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentAmount} € économisés
            </motion.div>
          </div>

          {/* Progress circle */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 502" }}
                  animate={{
                    strokeDasharray: `${(progress / 100) * 502} 502`
                  }}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center percentage */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  key={progress}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold text-emerald-700"
                >
                  {progress}%
                </motion.div>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-3">
            {milestones.map((milestone, index) => {
              const isReached = progress >= milestone.percentage;
              return (
                <motion.div
                  key={milestone.percentage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isReached ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isReached ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                      animate={isReached ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {isReached ? (
                        <span className="text-white text-lg">✓</span>
                      ) : (
                        <span className="text-white text-sm">{index + 1}</span>
                      )}
                    </motion.div>
                    <span className={`font-medium ${isReached ? 'text-emerald-700' : 'text-gray-600'}`}>
                      {milestone.label}
                    </span>
                  </div>
                  <span className={`font-semibold ${isReached ? 'text-emerald-700' : 'text-gray-500'}`}>
                    {milestone.amount} €
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Success message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: showConfetti ? 1 : 0,
              y: showConfetti ? 0 : 20
            }}
            className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-xl text-center"
          >
            <div className="flex items-center justify-center gap-2 font-semibold">
              <TrendingUp className="w-5 h-5" />
              <span>Objectif atteint ! 🎉</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}