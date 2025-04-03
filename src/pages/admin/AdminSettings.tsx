import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Loader2, Settings2, TrendingUp, Clock, DollarSign, Users, Percent, CheckCircle2, XCircle } from "lucide-react";

interface InvestmentPlan {
  id: string;
  name: string;
  price: number;
  daily_roi: number;
  min_withdrawal: number;
  features: string[];
  is_active: boolean;
}

interface SystemSetting {
  id: string;
  key: string;
  value: string;
}

const AdminSettings = () => {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les plans
      const { data: plansData, error: plansError } = await supabase
        .from('investment_plans')
        .select('*')
        .order('price');

      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Charger les paramètres
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');

      if (settingsError) throw settingsError;
      setSettings(settingsData || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (planId: string, updates: Partial<InvestmentPlan>) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('investment_plans')
        .update(updates)
        .eq('id', planId);

      if (error) throw error;

      setPlans(plans.map(plan => 
        plan.id === planId ? { ...plan, ...updates } : plan
      ));
      
      toast.success('Plan mis à jour avec succès');
      setEditingPlan(null);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du plan');
    } finally {
      setSaving(false);
    }
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    await updatePlan(planId, { is_active: !currentStatus });
  };

  const getSettingValue = (key: string) => {
    return settings.find(s => s.key === key)?.value || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres du Système</h1>
          <p className="mt-2 text-gray-600">Gérez les plans d'investissement et les paramètres globaux</p>
        </div>
        <Settings2 className="h-8 w-8 text-gray-400" />
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Cycle d'Investissement</p>
                <p className="text-2xl font-bold text-blue-900">{getSettingValue('investment_cycle_days')} Jours</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">ROI Moyen</p>
                <p className="text-2xl font-bold text-green-900">
                  {(plans.reduce((acc, plan) => acc + plan.daily_roi, 0) / plans.length).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Plans Actifs</p>
                <p className="text-2xl font-bold text-purple-900">
                  {plans.filter(p => p.is_active).length}/{plans.length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Investissement Min.</p>
                <p className="text-2xl font-bold text-orange-900">
                  {Math.min(...plans.map(p => p.price)).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans d'investissement */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Plans d'Investissement</CardTitle>
              <CardDescription>
                Gérez les différents plans d'investissement disponibles
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`overflow-hidden transition-all duration-200 ${
                plan.is_active ? 'border-green-200 bg-gradient-to-br from-white to-green-50' : 'border-red-200 bg-gradient-to-br from-white to-red-50'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.price.toLocaleString('fr-FR')} FCFA</CardDescription>
                    </div>
                    <Button
                      variant={plan.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                    >
                      {plan.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingPlan === plan.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">ROI Quotidien (%)</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={plan.daily_roi}
                          onChange={(e) => setPlans(plans.map(p => 
                            p.id === plan.id ? { ...p, daily_roi: parseFloat(e.target.value) } : p
                          ))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Prix (FCFA)</label>
                        <Input
                          type="number"
                          value={plan.price}
                          onChange={(e) => setPlans(plans.map(p => 
                            p.id === plan.id ? { ...p, price: parseInt(e.target.value) } : p
                          ))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Retrait Minimum (FCFA)</label>
                        <Input
                          type="number"
                          value={plan.min_withdrawal}
                          onChange={(e) => setPlans(plans.map(p => 
                            p.id === plan.id ? { ...p, min_withdrawal: parseInt(e.target.value) } : p
                          ))}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          className="w-full"
                          onClick={() => updatePlan(plan.id, {
                            daily_roi: plan.daily_roi,
                            price: plan.price,
                            min_withdrawal: plan.min_withdrawal
                          })}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sauvegarder'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setEditingPlan(null)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <Percent className="h-4 w-4 mr-1" />
                            ROI Quotidien
                          </p>
                          <p className="text-lg font-semibold">{plan.daily_roi}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Retrait Min.
                          </p>
                          <p className="text-lg font-semibold">{plan.min_withdrawal.toLocaleString('fr-FR')}</p>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setEditingPlan(plan.id)}
                        >
                          Modifier
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Paramètres globaux */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres Globaux</CardTitle>
          <CardDescription>
            Configurez les paramètres qui s'appliquent à l'ensemble du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Durée du Cycle d'Investissement (jours)
              </label>
              <Input
                type="number"
                value={getSettingValue('investment_cycle_days')}
                onChange={(e) => {
                  const newSettings = settings.map(s => 
                    s.key === 'investment_cycle_days' ? { ...s, value: e.target.value } : s
                  );
                  setSettings(newSettings);
                }}
              />
            </div>
          </div>
          <Button
            className="mt-6"
            onClick={async () => {
              try {
                setSaving(true);
                for (const setting of settings) {
                  const { error } = await supabase
                    .from('system_settings')
                    .update({ value: setting.value })
                    .eq('id', setting.id);
                  if (error) throw error;
                }
                toast.success('Paramètres mis à jour avec succès');
              } catch (error: any) {
                console.error('Erreur:', error);
                toast.error('Erreur lors de la mise à jour des paramètres');
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              'Sauvegarder les paramètres globaux'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
