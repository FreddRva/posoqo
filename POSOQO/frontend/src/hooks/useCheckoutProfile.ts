// hooks/useCheckoutProfile.ts
import { useState, useEffect, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { Profile, ProfileForm } from '@/types/checkout';

export const useCheckoutProfile = () => {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({ 
    name: "", 
    last_name: "", 
    dni: "", 
    phone: "" 
  });

  const profileComplete = useMemo(() => {
    return profile && 
      profile.name && 
      profile.last_name && 
      profile.dni && 
      profile.phone;
  }, [profile]);

  const loadProfile = async () => {
    console.log('[useCheckoutProfile] loadProfile llamado:', {
      status,
      hasSession: !!session,
      sessionKeys: session ? Object.keys(session) : []
    });
    
    if (status === "unauthenticated") {
      setLoading(false);
      signIn(undefined, { callbackUrl: "/checkout" });
      return;
    }
    
    if (status === "authenticated" && session) {
      // Obtener accessToken de la sesión
      const accessToken = (session as any)?.accessToken;
      
      console.log('[useCheckoutProfile] Verificando accessToken:', {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : null
      });
      
      if (!accessToken) {
        // Si no hay accessToken, intentar obtenerlo del localStorage o esperar un poco
        console.error('[useCheckoutProfile] No se pudo obtener el token de autenticación');
        setLoading(false);
        setError("No se pudo obtener el token de autenticación");
        return;
      }
      
      try {
        console.log('[useCheckoutProfile] Llamando a apiFetch con token');
        const profileData = await apiFetch("/profile", { authToken: accessToken });
        console.log('[useCheckoutProfile] Perfil cargado:', {
          hasProfileData: !!profileData,
          profileKeys: profileData ? Object.keys(profileData) : []
        });
        const profile = profileData as Profile;
        
        setProfile(profile);
        setProfileForm({
          name: profile.name || "",
          last_name: profile.last_name || "",
          dni: profile.dni || "",
          phone: profile.phone || ""
        });
        setLoading(false);
      } catch (error) {
        console.error("Error cargando perfil:", error);
        setError("Error cargando perfil");
        setLoading(false);
      }
    } else if (status === "loading") {
      // Aún cargando la sesión
      setLoading(true);
    }
  };

  const updateProfile = async () => {
    if (!session) return;
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const profileData = {
        name: profileForm.name,
        last_name: profileForm.last_name,
        dni: profileForm.dni,
        phone: profileForm.phone
      };

      await apiFetch("/profile", {
        method: "PUT",
        authToken: accessToken,
        body: JSON.stringify(profileData)
      });

      // Actualizar perfil local
      setProfile(prev => ({
        ...prev,
        ...profileData
      }));

      setSuccess("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Error actualizando perfil");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [session, status]);

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveProfile = async () => {
    await updateProfile();
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return {
    profile,
    profileForm,
    setProfileForm,
    profileComplete,
    loading,
    error,
    success,
    saving,
    handleProfileFormChange,
    saveProfile,
    refreshProfile,
    updateProfile,
    setError,
    setSuccess
  };
};
