import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Paper, Avatar, Chip } from '@mui/material';
import { AdminLayout } from '@/components/AdminLayout';
import { FiberManualRecord as StatusIcon } from '@mui/icons-material';
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserSession {
  id: string;
  userId: string;
  username: string;
  isOnline: boolean;
  device: {
    type: string;
    browser: string;
    os: string;
  };
  location: {
    country: string;
    city: string;
  };
  currentPage: string;
  connectionTime: Date;
  lastActivity: Date;
}

const UserTracking = () => {
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [totalOnline, setTotalOnline] = useState(0);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

    socket.on('userSessions', (sessions: UserSession[]) => {
      setActiveSessions(sessions);
      setTotalOnline(sessions.filter(session => session.isOnline).length);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <AdminLayout>
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Suivi des Utilisateurs en Temps Réel
        </Typography>
        
        <Box mb={3}>
          <Typography variant="h6">
            Utilisateurs en ligne: {totalOnline}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {activeSessions.map((session) => (
            <Grid item xs={12} md={6} lg={4} key={session.id}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ mr: 2 }}>{session.username[0]}</Avatar>
                  <Box>
                    <Typography variant="h6">{session.username}</Typography>
                    <Chip
                      icon={<StatusIcon />}
                      label={session.isOnline ? 'En ligne' : 'Déconnecté'}
                      color={session.isOnline ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="body2" gutterBottom>
                  📍 {session.location.city}, {session.location.country}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  💻 {session.device.browser} sur {session.device.os}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  📄 Page actuelle: {session.currentPage}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  ⏰ Connecté depuis: {format(new Date(session.connectionTime), 'HH:mm:ss', { locale: fr })}
                </Typography>

                <Typography variant="body2">
                  🕒 Dernière activité: {format(new Date(session.lastActivity), 'HH:mm:ss', { locale: fr })}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default UserTracking;
