import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useInViewAnimation } from "../../hooks/useInViewAnimation";

export function BudgetPlanningAnimation() {
  const [step, setStep] = useState(0);
  const { ref, isInView } = useInViewAnimation();

  useEffect(() => {
    if (!isInView) return;

    // Délai initial de 800ms avant le démarrage de l'animation
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setStep((prev) => (prev + 1) % 4);
      }, 2500);
      return () => clearInterval(interval);
    }, 800);

    return () => clearTimeout(timeout);
  }, [isInView]);

  const categories = [
    { name: "Charge", color: "#3b82f6", amount: 1500, percentage: 60 },
    { name: "Épargne", color: "#10b981", amount: 700, percentage: 28 },
    { name: "Loisir", color: "#a855f7", amount: 300, percentage: 12 }
  ];

  return (
    <div ref={ref} className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 p-8 flex flex-col items-center justify-center">
      {/* Montant total */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: step >= 0 ? 1 : 0, opacity: step >= 0 ? 1 : 0 }}
        className="mb-8 text-center"
      >
        <div className="text-sm text-gray-600 mb-2">Revenu mensuel</div>
        <motion.div
          className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          animate={{ scale: step === 0 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5 }}
        >
          2,500 €
        </motion.div>
      </motion.div>

      {/* Flèches de répartition */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: step >= 1 ? 1 : 0 }}
        className="flex gap-4 mb-8"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: step >= 1 ? 0 : -20, opacity: step >= 1 ? 1 : 0 }}
            transition={{ delay: i * 0.2 }}
          >
            <div className="text-3xl">↓</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Catégories */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ y: 50, opacity: 0 }}
            animate={{
              y: step >= 2 ? 0 : 50,
              opacity: step >= 2 ? 1 : 0,
              scale: step === 3 ? [1, 1.05, 1] : 1
            }}
            transition={{ delay: index * 0.15 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div
              className="w-12 h-12 rounded-full mb-3 flex items-center justify-center"
              style={{ backgroundColor: category.color + '20' }}
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </div>
            <div className="font-semibold mb-2">{category.name}</div>
            <motion.div
              className="text-2xl font-bold mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 3 ? 1 : 0 }}
              style={{ color: category.color }}
            >
              {category.amount} €
            </motion.div>
            <div className="text-sm text-gray-500">{category.percentage}%</div>

            {/* Barre de progression */}
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: category.color }}
                initial={{ width: 0 }}
                animate={{ width: step >= 3 ? `${category.percentage}%` : 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Indicateur d'étape */}
      <div className="mt-8 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= step ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}