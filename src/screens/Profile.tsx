import React, { useState } from 'react';
import { User, Mail, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { sendPartnerRequest, acceptPartnerRequest, auth } from '../services/firebase';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

const Profile: React.FC = () => {
  const { profile, loading } = useUser();
  const [partnerEmail, setPartnerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSendRequest = async () => {
    if (!auth.currentUser?.email) return;
    
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    
    try {
      await sendPartnerRequest(auth.currentUser.email, partnerEmail);
      setSuccess('Partner request sent successfully!');
      setPartnerEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send partner request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAcceptRequest = async () => {
    if (!auth.currentUser?.uid || !profile?.partnerRequest) return;
    
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    
    try {
      await acceptPartnerRequest(auth.currentUser.uid, profile.partnerRequest);
      setSuccess('Partner request accepted!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept partner request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-primary-400 dark:bg-primary-600 mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
              {profile?.photoURL ? (
                <img 
                  src={profile.photoURL} 
                  alt={profile.displayName || ''} 
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary-500" />
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile?.displayName || 'User Profile'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                <Mail className="h-4 w-4 mr-1" />
                {profile?.email}
              </p>
              
              {profile?.partnerId ? (
                <div className="mt-3 flex items-center text-green-600 dark:text-green-400">
                  <Heart className="h-5 w-5 mr-1 fill-current" />
                  <span>Conectado con {profile.partnerEmail}</span>
                </div>
              ) : profile?.partnerRequest ? (
                <div className="mt-3">
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-primary-700 dark:text-primary-300 font-medium">
                        Solicitud de pareja
                      </p>
                      <p className="text-primary-600 dark:text-primary-400 text-sm">
                        {profile.partnerRequest} quiere conectarse contigo
                      </p>
                      <Button 
                        onClick={handleAcceptRequest}
                        className="mt-2"
                        size="sm"
                        loading={isSubmitting}
                      >
                        Aceptar Solicitud
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-amber-600 dark:text-amber-400 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-1" />
                  No conectado con pareja
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Conexión de parejas
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}
            
            {!profile?.partnerId && !profile?.partnerRequest && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Conéctese con su pareja para crear un calendario compartido. Ingrese su dirección de correo electrónico a continuación:
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Partner's email address"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    fullWidth
                    icon={<Mail className="h-5 w-5 text-gray-400" />}
                  />
                  
                  <Button 
                    onClick={handleSendRequest}
                    loading={isSubmitting}
                    disabled={!partnerEmail || isSubmitting}
                    icon={<Heart className="h-5 w-5" />}
                  >
                    Enviar invitación
                  </Button>
                </div>
              </div>
            )}
            
            {profile?.partnerId && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    Estás conectado con {profile.partnerEmail}
                  </p>
                </div>
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Ahora puede compartir eventos y planificar juntos en su calendario compartido.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;