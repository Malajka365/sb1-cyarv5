import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          const { user } = session;
          
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileError && profileError.code === 'PGRST116') {
            // Get Facebook display name or fallback to email
            const displayName = user.user_metadata.full_name || 
                              user.user_metadata.name ||
                              user.email?.split('@')[0] ||
                              `user_${Date.now()}`;

            // Create profile
            const { error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                username: displayName,
                avatar_url: user.user_metadata.avatar_url || null
              }]);
              
            if (createError) throw createError;
          }
          
          navigate('/dashboard');
        } else {
          throw new Error('No session found');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { 
          state: { message: 'Authentication failed. Please try again.' }
        });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default AuthCallback;