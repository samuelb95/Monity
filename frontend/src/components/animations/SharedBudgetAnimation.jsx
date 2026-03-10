import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, ArrowRight } from "lucide-react";
import { useInViewAnimation } from "../../hooks/useInViewAnimation";

export function SharedBudgetAnimation() {
  const [step, setStep] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const { ref, isInView, hasBeenInView } = useInViewAnimation();

  useEffect(() => {
    if (!hasBeenInView || animationComplete) return;

    // Délai initial de 800ms avant le démarrage de l'animation
    const timeout = setTimeout(() => {
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setStep(currentStep);
        // Arrêter après 5 étapes (0, 1, 2, 3, 4)
        if (currentStep >= 4) {
          clearInterval(interval);
          setAnimationComplete(true);
        }
      }, 2000);
      return () => clearInterval(interval);
    }, 800);

    return () => clearTimeout(timeout);
  }, [hasBeenInView, animationComplete]);

  const members = [
    { name: "Marie", color: "#f59e0b", avatar: "M", spent: 250 },
    { name: "Paul", color: "#3b82f6", avatar: "P", spent: 180 },
    { name: "Sophie", color: "#ec4899", avatar: "S", spent: 320 }
  ];

  const totalSpent = 750;
  const perPerson = totalSpent / 3; // 250 each

  const balances = members.map(member => ({
    ...member,
    balance: perPerson - member.spent
  }));

  return (
    <div ref={ref} className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold">Budget Vacances</h3>
          </div>

          {/* Members */}
          <div className="flex justify-center gap-4 mb-8">
            {members.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: step >= 0 ? 1 : 0,
                  opacity: step >= 0 ? 1 : 0,
                  y: step === 1 ? [0, -10, 0] : 0
                }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 shadow-lg"
                  style={{ backgroundColor: member.color }}
                >
                  {member.avatar}
                </div>
                <div className="text-sm font-medium">{member.name}</div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: step >= 1 ? 1 : 0 }}
                  className="text-xs text-gray-500"
                >
                  {member.spent} €
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Total Group Expense */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 20 }}
            className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6 text-center"
          >
            <div className="text-sm text-gray-600 mb-1">Total dépensé</div>
            <div className="text-3xl font-bold text-purple-700">{totalSpent} €</div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 3 ? 1 : 0 }}
              className="text-sm text-gray-600 mt-2"
            >
              Par personne : {perPerson.toFixed(0)} €
            </motion.div>
          </motion.div>

          {/* Balance Calculation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 4 ? 1 : 0 }}
            className="space-y-3"
          >
            <div className="text-sm font-medium text-gray-700 mb-3">
              Contributions à faire :
            </div>
            {balances.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: step >= 4 ? 0 : -50, opacity: step >= 4 ? 1 : 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.avatar}
                  </div>
                  <span className="font-medium">{member.name}</span>
                </div>
                {member.balance < 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-semibold">
                      Doit {Math.abs(member.balance).toFixed(0)} €
                    </span>
                    <ArrowRight className="w-4 h-4 text-red-600" />
                  </div>
                ) : member.balance > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-semibold">
                      Recevra {member.balance.toFixed(0)} €
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500 font-semibold">
                    À jour ✓
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Auto calculation badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: step >= 4 ? 1 : 0,
              scale: step >= 4 ? 1 : 0.8
            }}
            className="mt-4 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
              Calcul automatique
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}