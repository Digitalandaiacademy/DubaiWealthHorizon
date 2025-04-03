import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SystemSetting {
  id: string;
  key: string;
  value: string;
}

const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (id: string, value: string) => {
    const newSettings = settings.map(setting =>
      setting.id === id ? { ...setting, value } : setting
    );
    setSettings(newSettings);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      for (const setting of settings) {
        const { error } = await supabase
          .from('system_settings')
          .update({ value: setting.value, updated_at: new Date().toISOString() })
          .eq('id', setting.id);

        if (error) throw error;
      }

      toast.success('Paramètres mis à jour avec succès');
      
      // Reload investment plans to reflect new ROI values
      const { error: plansError } = await supabase
        .from('investment_plans')
        .update({
          daily_roi: settings.find(s => s.key === 'bronze_daily_roi')?.value || '0.8'
        })
        .eq('name', 'Plan Bronze');

      const { error: silverError } = await supabase
        .from('investment_plans')
        .update({
          daily_roi: settings.find(s => s.key === 'silver_daily_roi')?.value || '1.0'
        })
        .eq('name', 'Plan Argent');

      const { error: goldError } = await supabase
        .from('investment_plans')
        .update({
          daily_roi: settings.find(s => s.key === 'gold_daily_roi')?.value || '1.2'
        })
        .eq('name', 'Plan Or');

      const { error: platinumError } = await supabase
        .from('investment_plans')
        .update({
          daily_roi: settings.find(s => s.key === 'platinum_daily_roi')?.value || '1.5'
        })
        .eq('name', 'Plan Platine');

      if (plansError || silverError || goldError || platinumError) {
        throw new Error('Erreur lors de la mise à jour des plans d\'investissement');
      }

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const getSettingLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      'investment_cycle_days': 'Durée du cycle d\'investissement (jours)',
      'bronze_daily_roi': 'ROI quotidien - Plan Bronze (%)',
      'silver_daily_roi': 'ROI quotidien - Plan Argent (%)',
      'gold_daily_roi': 'ROI quotidien - Plan Or (%)',
      'platinum_daily_roi': 'ROI quotidien - Plan Platine (%)',
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres Système</CardTitle>
          <CardDescription>
            Configurez les paramètres globaux du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.id} className="flex flex-col space-y-2">
                <label htmlFor={setting.key} className="text-sm font-medium">
                  {getSettingLabel(setting.key)}
                </label>
                <Input
                  id={setting.key}
                  type="number"
                  step="0.1"
                  value={setting.value}
                  onChange={(e) => updateSetting(setting.id, e.target.value)}
                />
              </div>
            ))}
            <Button
              className="w-full mt-4"
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                'Sauvegarder les modifications'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
