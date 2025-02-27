import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

interface Investment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  transaction_id: string;
  profiles: {
    full_name: string;
  };
  investment_plans: {
    name: string;
    daily_roi: number;
  };
}

const AdminInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    const fetchInvestments = async () => {
      const { data, error } = await supabase
        .from('user_investments')
        .select(`
          id,
          amount,
          status,
          created_at,
          transaction_id,
          profiles (
            full_name
          ),
          investment_plans (
            name,
            daily_roi
          )
        `);

      if (error) {
        console.error('Erreur lors de la récupération des investissements:', error);
      } else {
        setInvestments(data || []);
      }
    };

    fetchInvestments();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Investissements des Utilisateurs</h1>
      {investments.map((investment) => (
        <Card key={investment.id} className="mb-4">
          <CardHeader>
            <CardTitle>{investment.profiles.full_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Montant: {investment.amount.toLocaleString('fr-FR')} FCFA</p>
            <p>Statut: {investment.status}</p>
            <p>Date de création: {new Date(investment.created_at).toLocaleDateString('fr-FR')}</p>
            <p>Plan: {investment.investment_plans.name}</p>
            <p>ROI Journalier: {investment.investment_plans.daily_roi}%</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminInvestments;
