import React, { Fragment, useEffect, useState } from 'react';
import { useReferralStore } from '../../store/referralStore';
import { Users, Copy, TrendingUp, Award, Share2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  level: number;
  is_active: boolean;
  total_investment: number;
  total_commission: number;
  last_investment_date: string | null;
  created_at: string;
  updated_at: string;
  referred: {
    full_name: string;
    email: string;
  };
}

const ReferralDashboard = () => {
  const {
    referrals,
    referralsByLevel,
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
        console.log('Données de parrainage:', {
          referrals,
          referralsByLevel,
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

  const calculateLevelStats = (levelReferrals: Referral[]) => {
    const activeReferrals = levelReferrals.filter(r => r.is_active);
    
    return {
      count: levelReferrals.length,
      activeCount: activeReferrals.length,
      commission: levelReferrals.reduce((sum, r) => sum + (r.total_commission || 0), 0),
      totalInvestment: levelReferrals.reduce((sum, r) => sum + (r.total_investment || 0), 0)
    };
  };

  const level1Stats = calculateLevelStats(referralsByLevel[1] || []);
  const level2Stats = calculateLevelStats(referralsByLevel[2] || []);

  console.log('Statistiques globales:', {
    niveau1: level1Stats,
    niveau2: level2Stats,
    totalCommission,
    activeReferrals
  });

  const filteredReferrals = selectedLevel === 'all' 
    ? referrals 
    : (referralsByLevel[parseInt(selectedLevel) as 1 | 2] || []);

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
          {filteredReferrals.map((referral: Referral, index: number) => {
            const commissionRate = referral.level === 1 ? '5%' : referral.level === 2 ? '2%' : '1%';
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
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        referral.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className={`font-medium ${
                        referral.is_active ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {referral.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    {referral.total_investment > 0 && (
                      <div className="text-sm text-gray-600">
                        <div className="font-medium">Investissement total:</div>
                        <div className="ml-2 text-xs">
                          {referral.total_investment.toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {(referral.total_commission || 0) > 0 ? (
                      <Fragment>
                        <div className="text-green-600 font-semibold">
                          {(referral.total_commission || 0).toLocaleString('fr-FR')} FCFA
                        </div>
                        <div className="text-xs text-gray-500">
                          ({commissionRate})
                        </div>
                      </Fragment>
                    ) : (
                      <span className="text-gray-500 text-sm">Aucune commission</span>
                    )}
                  </div>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Vos Filleuls</h2>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Tous les niveaux</option>
              <option value="1">Niveau 1</option>
              <option value="2">Niveau 2</option>
            </select>
          </div>

          {/* Résumé des statistiques */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Niveau 1 (5%)</div>
              <div className="mt-1 space-y-2">
                <div>
                  <div className="text-xs text-gray-500">Total Filleuls (Actifs)</div>
                  <div className="text-lg font-semibold text-blue-700">{level1Stats.count} ({level1Stats.activeCount})</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Total investi</div>
                  <div className="text-sm font-medium text-blue-600">
                    {(level1Stats.totalInvestment || 0).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Commission</div>
                  <div className="text-sm font-medium text-blue-600">
                    {(level1Stats.commission || 0).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Niveau 2 (2%)</div>
              <div className="mt-1 space-y-2">
                <div>
                  <div className="text-xs text-gray-500">Total Filleuls (Actifs)</div>
                  <div className="text-lg font-semibold text-green-700">{level2Stats.count} ({level2Stats.activeCount})</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Total investi</div>
                  <div className="text-sm font-medium text-green-600">
                    {(level2Stats.totalInvestment || 0).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Commission</div>
                  <div className="text-sm font-medium text-green-600">
                    {(level2Stats.commission || 0).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de progression des commissions */}
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Répartition des commissions</div>
            {(totalCommission || 0) > 0 && (
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div 
                    className="bg-blue-500" 
                    style={{ width: `${(level1Stats.commission / totalCommission) * 100}%` }}
                    title={`Niveau 1: ${level1Stats.commission.toLocaleString('fr-FR')} FCFA`}
                  />
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(level2Stats.commission / totalCommission) * 100}%` }}
                    title={`Niveau 2: ${level2Stats.commission.toLocaleString('fr-FR')} FCFA`}
                  />
                </div>
              </div>
            )}
            {(totalCommission || 0) > 0 ? (
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Niveau 1: {(((level1Stats.commission || 0) / totalCommission) * 100).toFixed(1)}%</span>
                <span>Niveau 2: {(((level2Stats.commission || 0) / totalCommission) * 100).toFixed(1)}%</span>
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-1 text-center">
                Aucune commission pour le moment
              </div>
            )}
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