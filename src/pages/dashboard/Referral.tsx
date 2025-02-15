import React, { useEffect, useState } from 'react';
import { useReferralStore } from '../../store/referralStore';
import { Users, Copy, TrendingUp, Award, Share2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';

const Referral = () => {
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
    loadReferrals();
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Programme de Parrainage</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Filleuls Actifs</h3>
              <p className="text-2xl font-bold text-blue-600">{activeReferrals}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Commissions Totales</h3>
              <p className="text-2xl font-bold text-green-600">
                {totalCommission.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Niveau</h3>
              <p className="text-2xl font-bold text-purple-600">
                {activeReferrals >= 10 ? 'Expert' : activeReferrals >= 5 ? 'Avancé' : 'Débutant'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Commission du Mois</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {(totalCommission * 0.1).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques par niveau */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Statistiques par Niveau</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { level: 1, commission: '5%', stats: level1Stats, color: 'blue' },
            { level: 2, commission: '2%', stats: level2Stats, color: 'green' },
            { level: 3, commission: '1%', stats: level3Stats, color: 'purple' }
          ].map((level) => (
            <div key={level.level} className={`bg-${level.color}-50 p-6 rounded-lg`}>
              <h3 className="text-lg font-semibold mb-2">Niveau {level.level}</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Commission: {level.commission}</p>
                <p className="text-sm text-gray-600">
                  Filleuls: <span className="font-semibold">{level.stats.count}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Commissions: <span className="font-semibold">
                    {level.stats.commission.toLocaleString('fr-FR')} FCFA
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lien de parrainage */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Votre Lien de Parrainage</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={getReferralLink()}
              readOnly
              className="w-full p-2 border rounded-lg bg-gray-50"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyReferralLink}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </button>
            <button
              onClick={shareReferralLink}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {showQR ? 'Masquer QR' : 'Afficher QR'}
            </button>
          </div>
        </div>
        {showQR && (
          <div className="mt-4 flex justify-center">
            <QRCode value={getReferralLink()} size={200} />
          </div>
        )}
      </div>

      {/* Liste des filleuls */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Vos Filleuls</h2>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="all">Tous les niveaux</option>
              <option value="1">Niveau 1</option>
              <option value="2">Niveau 2</option>
              <option value="3">Niveau 3</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4">
                    <div className="text-center">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun filleul</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Commencez à partager votre lien de parrainage pour gagner des commissions.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((referral) => (
                  <tr key={referral.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {referral.referred.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {referral.referred.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${referral.level === 1 ? 'bg-blue-100 text-blue-800' :
                          referral.level === 2 ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'}`}>
                        Niveau {referral.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        referral.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {referral.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {referral.total_commission.toLocaleString('fr-FR')} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(referral.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Referral;