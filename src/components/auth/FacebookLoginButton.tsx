import React, { useState } from 'react';
import { Facebook } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const FacebookLoginButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email,public_profile',
          queryParams: {
            auth_type: 'rerequest',
            display: 'popup'
          }
        }
      });

      if (error) {
        console.error('Facebook OAuth error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      alert('Failed to login with Facebook. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={isLoading}
      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-white bg-[#1877F2] hover:bg-[#166fe5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      ) : (
        <Facebook className="w-5 h-5 mr-2" />
      )}
      Continue with Facebook
    </button>
  );
};

export default FacebookLoginButton;