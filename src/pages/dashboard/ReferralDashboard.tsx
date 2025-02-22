import React, { useEffect, useState } from 'react';
import { useReferralStore } from '../../store/referralStore';
import { Users, Copy, TrendingUp, Award, Share2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';

const ReferralDashboard = () => {
  const {
    referrals,
    loading,
    totalCommission,
    activeReferrals,
    loadReferrals,
    getReferralLink
  } = useReferralStore();

  const [showQR, setShowQR] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        await loadReferrals();
        
        // Logs de débogage détaillés
        console.log('Données de parrainage:', {
          referrals,
          totalCommission,
          activeReferrals,
          loading
        });
      } catch (error) {
        console.error('Erreur lors du chargement des filleuls:', error);
      }
    };

    fetchReferrals();
  }, []);

  // Ajouter un log supplémentaire pour vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Utilisateur connecté pour parrainage:', user);
    };

    checkAuth();
  }, []);

  const copyReferralLink = () => {
    const link = getReferralLink();
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('Lien de parrainage copié !');
    }
  };

  const shareReferralLink = async () => {
    const link = getReferralLink();
    if (link) {
      try {
        await navigator.share({
          title: 'DubaiWealth Horizon - Programme de Parrainage',
          text: 'Rejoignez-moi sur DubaiWealth Horizon et commencez à investir dans l\'immobilier à Dubai !',
          url: link
        });
      } catch (error) {
        console.error('Erreur lors du partage:', error);
      }
    }
  };

  const calculateLevelStats = (level: number) => {
    const levelReferrals = referrals.filter(r => r.level === level);
    return {
      count: levelReferrals.length,
      commission: levelReferrals.reduce((sum, r) => sum + r.total_commission, 0)
    };
  };

  const level1Stats = calculateLevelStats(1);
  const level2Stats = calculateLevelStats(2);
  const level3Stats = calculateLevelStats(3);

  const filteredReferrals = selectedLevel === 'all' 
    ? referrals 
    : referrals.filter(r => r.level === parseInt(selectedLevel));

  const renderReferrals = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (referrals.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Vous n'avez pas encore de filleuls.</p>
          <p>Partagez votre lien de parrainage pour commencer !</p>
        </div>
      );
    }

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Filleul
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Niveau
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Investissements
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Commissions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {referrals.map((referral, index) => {
            // Logs de débogage pour chaque filleul
            console.log(`Détails du filleul ${index}:`, referral);

            return (
              <tr key={referral.id || index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {referral.referred?.full_name || 'Nom non disponible'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {referral.referred?.email || 'Email non disponible'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Niveau {referral.level || 1}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {referral.status === 'active' ? (
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Investissement actif
                      </span>
                      {/* Afficher le montant de l'investissement si disponible */}
                      {referral.total_investment && (
                        <div className="mt-1 text-sm text-gray-600">
                          {referral.total_investment.toLocaleString('fr-FR')} FCFA
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Pas d'investissement actif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {referral.total_commission ? (
                    <div>
                      <span className="text-green-600 font-semibold">
                        {referral.total_commission.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Aucune commission</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const safeActiveReferrals = activeReferrals || 0;
  const safeTotalCommission = totalCommission || 0;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Parrainage</h1>
        <Link 
          to="/referral" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Voir le Programme
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Filleuls Actifs</h3>
              <p className="text-2xl font-bold text-blue-600">{safeActiveReferrals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Commissions Totales</h3>
              <p className="text-2xl font-bold text-green-600">
                {safeTotalCommission.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Niveau</h3>
              <p className="text-2xl font-bold text-purple-600">
                {safeActiveReferrals >= 10 ? 'Expert' : safeActiveReferrals >= 5 ? 'Avancé' : 'Débutant'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Commission Niveau 1</h3>
              <p className="text-2xl font-bold text-orange-600">5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lien de parrainage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Votre lien de parrainage</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                value={getReferralLink() || ''}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              />
              <button
                onClick={copyReferralLink}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>
          <button
            onClick={shareReferralLink}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Partager
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {showQR ? 'Masquer' : 'Afficher'} QR Code
          </button>
        </div>
        {showQR && (
          <div className="mt-4 flex justify-center">
            <QRCode value={getReferralLink() || ''} size={200} />
          </div>
        )}
      </div>

      {/* Liste des filleuls */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Vos Filleuls</h2>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Tous les niveaux</option>
              <option value="1">Niveau 1</option>
              <option value="2">Niveau 2</option>
              <option value="3">Niveau 3</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          {renderReferrals()}
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;