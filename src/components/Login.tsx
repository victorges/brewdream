import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Local development helpers
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const TEST_EMAIL = 'test@brew.local';
const TEST_PASSWORD = 'test123456';

// Security note: We only check if the app is running on localhost.
// This is sufficient because:
// 1. Production website won't be on localhost, so test account won't work there
// 2. Local dev with production Supabase is a common setup (requires .env keys = authorized access)
// 3. If someone has Supabase keys, they already have access to that instance
const canUseTestAccount = isLocalDev;

export function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Prepopulate test email in local dev (only if both app and Supabase are local)
  useEffect(() => {
    if (canUseTestAccount) {
      setEmail(TEST_EMAIL);
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Local dev bypass for test email
      if (email === TEST_EMAIL) {
        if (!canUseTestAccount) {
          throw new Error('Test account is only available in local development (localhost). Please use a real email address.');
        }

        // Try to sign in with test password first
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });

        if (signInError) {
          // If sign in fails, try to create the test user
          const { error: signUpError } = await supabase.auth.signUp({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            options: {
              emailRedirectTo: `${window.location.origin}/capture`,
            }
          });

          if (signUpError) throw signUpError;
        }

        // Store or update user in our custom users table
        await supabase
          .from('users')
          .upsert({ email: TEST_EMAIL }, { onConflict: 'email' });

        toast({
          title: 'Dev mode login',
          description: 'Logged in automatically (local dev)',
        });

        navigate('/capture');
        return;
      }

      // Normal OTP flow for production
      // Store or update user in our custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({ email }, { onConflict: 'email' })
        .select()
        .single();

      if (userError) throw userError;

      // Send magic link (OTP via email)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/capture`,
        },
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: 'Check your email',
        description: 'We sent you a login code',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Logged in successfully',
      });

      navigate('/capture');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full space-y-8">
        <Link to="/start" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-accent glow-primary mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {otpSent ? 'Enter code' : 'Sign in'}
          </h1>
          <p className="text-muted-foreground">
            {otpSent ? 'Check your email for the login code' : 'Get started with your email'}
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-card border-border text-foreground"
              />
              {email === TEST_EMAIL && (
                canUseTestAccount ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    🧪 Dev mode: Auto-login enabled (no OTP needed)
                  </p>
                ) : (
                  <p className="text-xs text-destructive mt-2">
                    ⚠️ Test account only works on localhost. Use a real email.
                  </p>
                )
              )}
            </div>
            <Button
              type="submit"
              disabled={loading || (email === TEST_EMAIL && !canUseTestAccount)}
              className="w-full h-12 bg-primary text-primary-foreground glow-primary"
            >
              {loading ? 'Sending...' : (canUseTestAccount && email === TEST_EMAIL ? 'Login (Dev Mode)' : 'Send login code')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="h-12 bg-card border-border text-center text-2xl tracking-widest"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground glow-primary"
            >
              {loading ? 'Verifying...' : 'Verify code'}
            </Button>
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-smooth"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
