import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useInViewAnimation } from "../../hooks/useInViewAnimation";

export function RealTimeTrackingAnimation() {
  const [transactions, setTransactions] = useState([]);
  const [animationComplete, setAnimationComplete] = useState(false);
  const { ref, isInView, hasBeenInView } = useInViewAnimation();

  const categoryData = {
    Charge: { spent: 0, budget: 1500, color: "#3b82f6" },
    Épargne: { spent: 0, budget: 700, color: "#10b981" },
    Loisir: { spent: 0, budget: 300, color: "#a855f7" }
  };

  const [data, setData] = useState(categoryData);

  useEffect(() => {
    if (!hasBeenInView || animationComplete) return;
    const possibleTransactions = [
      { category: "Charge", amount: 120, name: "Loyer" },
      { category: "Charge", amount: 80, name: "Électricité" },
      { category: "Épargne", amount: 200, name: "Épargne" },
      { category: "Loisir", amount: 45, name: "Restaurant" },
      { category: "Charge", amount: 65, name: "Courses" },
      { category: "Loisir", amount: 30, name: "Cinéma" },
    ];

    let currentIndex = 0;
    
    // Délai initial de 800ms avant le démarrage de l'animation
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < possibleTransactions.length) {
          const transaction = possibleTransactions[currentIndex];
          const colors = {
            Charge: "#3b82f6",
            Épargne: "#10b981",
            Loisir: "#a855f7"
          };

          setTransactions((prev) => [
            ...prev,
            {
              id: Date.now(),
              category: transaction.category,
              amount: transaction.amount,
              color: colors[transaction.category]
            }
          ]);

          setData((prev) => ({
            ...prev,
            [transaction.category]: {
              ...prev[transaction.category],
              spent: prev[transaction.category].spent + transaction.amount
            }
          }));

          currentIndex++;
        } else {
          // Animation complète
          clearInterval(interval);
          setAnimationComplete(true);
        }
      }, 100);

      return () => clearInterval(interval);
    }, 800);

    return () => clearTimeout(timeout);
  }, [hasBeenInView, animationComplete]);

  return (
    <div ref={ref} className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold">Suivi en temps réel</h3>
          </div>

          {/* Categories progress */}
          <div className="space-y-4 mb-6">
            {Object.entries(data).map(([category, info], index) => {
              const percentage = (info.spent / info.budget) * 100;
              const isOverBudget = percentage > 100;

              return (
                <motion.div
                  key={category}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center gap-2">
                      <motion.span
                        key={info.spent}
                        initial={{ scale: 1.5, color: info.color }}
                        animate={{ scale: 1, color: "#000" }}
                        transition={{ duration: 0.3 }}
                        className="font-semibold"
                      >
                        {info.spent} €
                      </motion.span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">{info.budget} €</span>
                    </div>
                  </div>
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: info.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    {isOverBudget && (
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-red-500"
                        initial={{ width: "100%" }}
                        animate={{ width: "100%" }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isOverBudget ? "text-red-600" : "text-gray-500"}>
                      {percentage.toFixed(0)}%
                    </span>
                    <span className={isOverBudget ? "text-red-600" : "text-green-600"}>
                      {isOverBudget ? (
                        <span className="flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Dépassement
                        </span>
                      ) : (
                        `${info.budget - info.spent} € restants`
                      )}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Recent transactions */}
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-600 mb-3">Dernières transactions</div>
            <div className="space-y-2 max-h-32 overflow-hidden">
              {transactions.slice(-3).reverse().map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: transaction.color }}
                    />
                    <span className="text-sm">{transaction.category}</span>
                  </div>
                  <span className="font-semibold text-sm">-{transaction.amount} €</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}