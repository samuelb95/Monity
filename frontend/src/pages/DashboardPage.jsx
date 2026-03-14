import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  PieChart, 
  Wallet,
  Target,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  MoreVertical,
  Eye,
  EyeOff,
  Loader
} from 'lucide-react';
import { getDashboardData } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage = () => {
  const { isAuthenticated } = useAuth();
  const [showAmounts, setShowAmounts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Récupérer le premier compte ou créer un structrue par défaut
        const data = await getDashboardData(null);
        setDashboardData({
          primary_account: data.accounts[0] || { 
            id: null, 
            name: 'Mon compte', 
            current_balance: 0, 
            type: 'personal' 
          },
          transactions: data.transactions || [],
          budgets: data.budgets || []
        });
        setError(null);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
        setError('Erreur lors du chargement du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-semibold">{error || 'Erreur lors du chargement'}</p>
          </div>
        </div>
      </div>
    );
  }

  const primaryAccount = dashboardData?.primary_account || { id: null, name: 'Mon compte', current_balance: 0, type: 'personal' };
  const transactions = dashboardData?.transactions || [];
  const budgets = dashboardData?.budgets || [];

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue! Voici votre aperçu financier.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Revenu</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {showAmounts ? `${totalIncome.toFixed(2)}€` : '****'}
            </span>
            <p className="text-sm text-gray-500 mt-2">Total</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Dépensé</h3>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {showAmounts ? `${totalExpenses.toFixed(2)}€` : '****'}
            </span>
            <p className="text-sm text-gray-500 mt-2">Total</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Solde</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <span className={`text-3xl font-bold ${primaryAccount.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {showAmounts ? `${primaryAccount.current_balance.toFixed(2)}€` : '****'}
            </span>
            <p className="text-sm text-gray-500 mt-2">Compte principal</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => setShowAmounts(!showAmounts)}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex items-center justify-center hover:shadow-xl transition-all"
          >
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                {showAmounts ? (
                  <EyeOff className="w-5 h-5 text-purple-600" />
                ) : (
                  <Eye className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <span className="font-medium text-sm text-gray-600">
                {showAmounts ? 'Masquer' : 'Afficher'}
              </span>
            </div>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {budgets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-blue-600" />
                  Vos budgets
                </h2>

                <div className="space-y-6">
                  {budgets.map((budget, index) => (
                    <motion.div
                      key={budget.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                          <p className="text-sm text-gray-600">
                            {showAmounts ? `${budget.spent.toFixed(2)}€ / ${budget.limit_amount.toFixed(2)}€` : '**** / ****'}
                          </p>
                        </div>
                        <span className={`text-sm font-bold ${budget.percentage > 80 ? 'text-red-600' : 'text-green-600'}`}>
                          {budget.percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                          className={`h-full rounded-full ${budget.percentage > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {transactions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Transactions récentes
                </h2>

                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowDownLeft className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{transaction.description}</h4>
                          <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{showAmounts ? transaction.amount.toFixed(2) : '****'}€
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all">
                  <Plus className="w-5 h-5" />
                  Ajouter une dépense
                </button>
                <button className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 px-4 rounded-lg">
                  <Target className="w-5 h-5" />
                  Nouvel objectif
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white"
            >
              <h3 className="text-xl font-bold mb-4">Compte principal</h3>
              <div className="space-y-2">
                <p className="text-sm text-blue-100">Nom: {primaryAccount.name}</p>
                <p className="text-sm text-blue-100">Type: {primaryAccount.type === 'personal' ? 'Personnel' : 'Partagé'}</p>
                <div className="pt-4 border-t border-blue-400">
                  <p className="text-sm text-blue-100 mb-1">Solde actuel:</p>
                  <p className="text-2xl font-bold">
                    {showAmounts ? `${primaryAccount.current_balance.toFixed(2)}€` : '****'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};