import { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle, Check } from 'lucide-react';
import { updateTransaction, deleteTransaction, getCategories, validateTransaction, unvalidateTransaction } from '../../services/supabaseService';

export default function EditTransactionModal({ 
  isOpen, 
  onClose, 
  transaction, 
  onTransactionUpdated 
}) {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    description: '',
    category_id: '',
    date: '',
    is_recurring: false,
    recurrence_pattern: '',
    notes: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && transaction) {
      setFormData({
        amount: transaction.amount || '',
        type: transaction.type || 'expense',
        description: transaction.description || '',
        category_id: transaction.category_id || '',
        date: transaction.date ? transaction.date.split('T')[0] : '',
        is_recurring: transaction.is_recurring || false,
        recurrence_pattern: transaction.recurrence_pattern || '',
        notes: transaction.notes || ''
      });
      loadCategories();
    }
  }, [isOpen, transaction]);

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.amount || !formData.description || !formData.date) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      await updateTransaction(transaction.id, formData);
      onTransactionUpdated();
      onClose();
    } catch (err) {
      console.error('Erreur mise à jour transaction:', err);
      setError('Erreur lors de la mise à jour de la transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteTransaction(transaction.id);
      onTransactionUpdated();
      onClose();
    } catch (err) {
      console.error('Erreur suppression transaction:', err);
      setError('Erreur lors de la suppression de la transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleValidation = async () => {
    try {
      setLoading(true);
      if (transaction.is_validated) {
        await unvalidateTransaction(transaction.id);
      } else {
        await validateTransaction(transaction.id);
      }
      onTransactionUpdated();
    } catch (err) {
      console.error('Erreur validation transaction:', err);
      setError('Erreur lors de la validation de la transaction');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Modifier la transaction</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {transaction?.is_occurrence && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Ceci est une occurrence d'une transaction récurrente. Les modifications s'appliqueront uniquement à cette occurrence.</p>
            </div>
          )}

          {/* Type de transaction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de transaction *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', category_id: '' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="font-medium">Dépense</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category_id: '' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.type === 'income'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="font-medium">Revenu</span>
              </button>
            </div>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant (€) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Courses, Salaire..."
              required
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sans catégorie</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Notes additionnelles..."
            />
          </div>

          {/* Statut validation */}
          {!transaction?.is_occurrence && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Statut</p>
                <p className="text-sm text-gray-600">
                  {transaction?.is_validated ? 'Transaction validée' : 'Transaction non validée'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleValidation}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  transaction?.is_validated
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {transaction?.is_validated ? 'Annuler validation' : 'Valider'}
              </button>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}