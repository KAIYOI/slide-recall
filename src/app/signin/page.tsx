'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { ArrowLeft, BookOpen, Check, LoaderCircle, LockKeyhole, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignInPage() {
  const { status } = useSession();
  const [authError, setAuthError] = useState('');
  useEffect(() => {
    if (status === 'authenticated') window.location.replace('/');
  }, [status]);
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('error');
    if (!code) return;
    const messages: Record<string, string> = {
      OAuthSignin: 'Google sign-in could not be started. Check your OAuth client settings.',
      OAuthCallback: 'Google returned an error during sign-in. Confirm the callback URL in Google Cloud Console.',
      OAuthCreateAccount: 'Your account could not be created. Check the server terminal for the database error.',
      Callback: 'Sign-in could not be completed. Check the server terminal for details.',
      AccessDenied: 'Google did not allow access to this account.',
      Configuration: 'Authentication is not configured. Check the OAuth credentials and server environment.',
      Default: 'Sign-in failed. Check the server terminal for details, then try again.',
    };
    setAuthError(messages[code] || messages.Default);
  }, []);

  return <main className="grid-paper flex min-h-screen flex-col">
    <header className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8">
      <a href="/" className="flex items-center gap-2.5 font-[Manrope] text-[17px] font-extrabold tracking-[-.5px]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-forest text-lime"><BookOpen size={18}/></span>slide<span className="-ml-2 text-forest">recall</span><span className="-ml-2 text-[11px] font-bold text-[#99ab9e]">AI</span></a>
      <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-forest"><ArrowLeft size={15}/> Back home</a>
    </header>
    <section className="flex flex-1 items-center justify-center px-5 pb-16">
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="w-full max-w-[440px] rounded-[28px] border border-[#e6ebe4] bg-white p-7 shadow-soft sm:p-10">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-[19px] bg-[#edf3e8] text-forest"><Sparkles size={23}/></div>
        <div className="mt-6 text-center"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-forest">Welcome to SlideRecall</span><h1 className="mt-3 font-[Manrope] text-[31px] font-extrabold tracking-[-1px]">Make learning stick.</h1><p className="mt-3 text-sm leading-6 text-muted">Sign in to turn your slides into a personal study session.</p></div>
        <button onClick={() => void signIn('google', { callbackUrl: '/' })} disabled={status === 'loading'} className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-forest px-5 py-4 text-sm font-bold text-white transition hover:bg-[#1c4030] disabled:opacity-60">
          {status === 'loading' ? <LoaderCircle size={18} className="animate-spin"/> : <GoogleMark/>}
          {status === 'loading' ? 'Checking your session…' : 'Continue with Google'}
        </button>
        {authError&&<p role="alert" className="mt-4 rounded-xl bg-[#fff0ed] px-4 py-3 text-center text-xs leading-5 text-[#ad554b]">{authError}</p>}
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#909b92]"><LockKeyhole size={13}/>Secure sign-in powered by Google</div>
        <div className="mt-8 border-t border-[#edf0eb] pt-6"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#9ba59e]">Your account unlocks</p><div className="space-y-3">{['Upload and process your own study materials','Get AI-powered answers and feedback','Keep your learning session private'].map(item=><div key={item} className="flex items-center gap-2.5 text-xs text-[#657168]"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#edf3e8] text-forest"><Check size={12}/></span>{item}</div>)}</div></div>
        <p className="mt-6 text-center text-[10px] leading-5 text-[#a0a9a1]">By continuing, you agree to use SlideRecall for your personal learning.</p>
      </motion.div>
    </section>
    <footer className="mx-auto w-full max-w-[1240px] border-t border-[#e7ebe5] px-5 py-5 text-[10px] text-[#9da69e] sm:px-8">© 2025 SlideRecall AI</footer>
  </main>;
}

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 48 48" className="h-[18px] w-[18px]"><path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z"/><path fill="#4A90E2" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.2H5.8a20 20 0 0 0 0 17.6l6.8-5.2Z"/><path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.9-5.9A19.7 19.7 0 0 0 24 4 20 20 0 0 0 5.8 15.2l6.8 5.2C14.2 15.6 18.7 12 24 12Z"/></svg>;
}
