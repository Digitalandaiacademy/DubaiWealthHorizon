import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useInvestmentStore } from '../../store/investmentStore';
import { useTransactionStore } from '../../store/transactionStore';
import { User, Phone, Mail, Key, Copy, Shield, Clock, Wallet, TrendingUp, AlertCircle, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/card';

const Profile = () => {
  const { profile, loading: profileLoading } = useAuthStore();
  const { userInvestments, loadUserInvestments } = useInvestmentStore();
  const { transactions, totalReceived, totalWithdrawn, loadTransactions } = useTransactionStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phoneNumber: profile?.phone_number || '',
    email: profile?.email || '',
    notifications: {
      email: true,
      push: true,
      investment: true,
      security: true
    }
  });

  useEffect(() => {
    loadUserInvestments();
    loadTransactions();
  }, []);

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast.success('Code de parrainage copié !');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter la mise à jour du profil
    setIsEditing(false);
    toast.success('Profil mis à jour avec succès');
  };

  const getAccountStats = () => {
    const activeInvestments = userInvestments.filter(inv => inv.status === 'active').length;
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const lastActivity = transactions[0]?.created_at ? new Date(transactions[0].created_at).toLocaleDateString() : 'Aucune';
    
    return { activeInvestments, totalInvested, lastActivity };
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getAccountStats();

  return (
    <div className="space-y-8">
      {/* En-tête du profil */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-500">Gérez vos informations personnelles et vos préférences</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isEditing ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      {/* Statistiques du compte */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center space-x-4">
            <Wallet className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Total Investi</p>
              <p className="text-xl font-bold">{stats.totalInvested.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center space-x-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Gains Totaux</p>
              <p className="text-xl font-bold">{totalReceived.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center space-x-4">
            <Clock className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Investissements Actifs</p>
              <p className="text-xl font-bold">{stats.activeInvestments}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white">
          <div className="flex items-center space-x-4">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-500">Dernière Activité</p>
              <p className="text-xl font-bold">{stats.lastActivity}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Informations personnelles */}
      <Card className="overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations Personnelles</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <div className="mt-1 flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{profile?.full_name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Numéro de téléphone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <div className="mt-1 flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{profile?.phone_number}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <div className="mt-1 flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900">{profile?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Code de parrainage
                </label>
                <div className="mt-1 flex items-center">
                  <Key className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900">{profile?.referral_code}</span>
                  <button
                    type="button"
                    onClick={copyReferralCode}
                    className="ml-2 text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enregistrer les modifications
                </button>
              </div>
            )}
          </form>
        </div>
      </Card>

      {/* Sécurité */}
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Authentification à deux facteurs</h3>
                <p className="text-sm text-gray-500">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
              </div>
              <button
                onClick={() => setShowSecurityModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Configurer
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Mot de passe</h3>
                <p className="text-sm text-gray-500">Dernière modification il y a 3 mois</p>
              </div>
              <button
                onClick={() => {
                  const newPassword = window.prompt('Entrez votre nouveau mot de passe (minimum 8 caractères):');
                  if (newPassword) {
                    if (newPassword.length < 8) {
                      toast.error('Le mot de passe doit contenir au moins 8 caractères');
                      return;
                    }
                    try {
                      useAuthStore.getState().updatePassword(newPassword);
                      toast.success('Mot de passe mis à jour avec succès');
                    } catch (error: any) {
                      toast.error(error.message || 'Erreur lors de la mise à jour du mot de passe');
                    }
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Préférences de notification */}
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Préférences de notification</h2>
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div className="space-y-4">
            {Object.entries(formData.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {`Notifications ${key === 'email' ? 'par email' : key === 'push' ? 'push' : 
                      key === 'investment' ? 'sur les investissements' : 'de sécurité'}`}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        [key]: !value
                      }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Activité récente */}
      <Card className="overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h2>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {transaction.type === 'investment' ? 'Investissement' :
                     transaction.type === 'return' ? 'Retour sur investissement' :
                     transaction.type === 'withdrawal' ? 'Retrait' :
                     transaction.type === 'referral' ? 'Commission de parrainage' : 'Transaction'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`font-semibold ${
                  transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'withdrawal' ? '-' : '+'}
                  {transaction.amount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
