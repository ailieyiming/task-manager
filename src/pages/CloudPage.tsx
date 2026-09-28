import { useState, type FormEvent } from 'react'
import { Cloud, CloudOff, Download, RefreshCw, ShieldCheck } from 'lucide-react'
import { useCloudStore } from '../store/cloud'
import { downloadLocalBackup, refreshCloud, resolveCloudConflict } from '../lib/cloudSync'
import { supabase } from '../lib/supabase'

export function CloudPage({ recoveryFlow = false }: { recoveryFlow?: boolean }) {
  const { userId, email: signedInEmail, mode, message, lastSynced } = useCloudStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const authenticate = async (action: 'sign-in' | 'sign-up') => {
    if (!supabase) return
    setWorking(true)
    setNotice(null)
    try {
      const result = action === 'sign-up'
        ? await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (result.error) {
        setNotice(result.error.message)
      } else if (action === 'sign-up' && !result.data.session) {
        setNotice('Check your email to confirm your account, then sign in here.')
      } else {
        setPassword('')
        setNotice(null)
      }
    } catch {
      setNotice('Could not connect. Check your internet connection and try again.')
    } finally {
      setWorking(false)
    }
  }

  const requestReset = async () => {
    if (!supabase) return
    setWorking(true)
    setNotice(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/?recover=1`,
      })
      setNotice(error ? error.message : 'If this address has an account, a reset link has been sent. Check your inbox and spam folder.')
    } catch {
      setNotice('Could not connect. Check your internet connection and try again.')
    } finally {
      setWorking(false)
    }
  }

  const finishReset = async () => {
    if (!supabase) return
    if (password !== confirmPassword) {
      setNotice('The two passwords do not match.')
      return
    }
    setWorking(true)
    setNotice(null)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setNotice(error.message)
        return
      }
      setPassword('')
      setConfirmPassword('')
      const { error: signOutError } = await supabase.auth.signOut()
      window.history.replaceState(null, '', window.location.pathname)
      setResetDone(true)
      if (signOutError) setNotice('Password changed. Close this page before returning to the app.')
    } catch {
      setNotice('Could not complete the request. Check your connection and try again.')
    } finally {
      setWorking(false)
    }
  }

  if (!supabase) {
    return <div className="p-5 text-[14px] text-red-600">Cloud sync is not configured.</div>
  }
  const client = supabase

  if (recoveryFlow) {
    return (
      <div className="flex-1 overflow-y-auto bg-stone-50 px-4 py-8">
        <div className="max-w-md mx-auto bg-white border border-stone-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h1 className="text-[18px] font-semibold text-stone-900">Reset password</h1>
          {resetDone ? (
            <div className="space-y-2">
              <p className="text-[14px] text-stone-600">Password updated. Return to the app with your tasks and sign in using your new password.</p>
              {notice && <p className="text-[13px] text-amber-700" role="status">{notice}</p>}
            </div>
          ) : userId ? (
            <form onSubmit={(event: FormEvent) => { event.preventDefault(); void finishReset() }} className="space-y-3">
              <p className="text-[13px] text-stone-500">Choose a new password for {signedInEmail}.</p>
              <input type="password" required minLength={6} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="New password (at least 6 characters)" className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-[15px] outline-none focus:border-[#1e3a5f]" />
              <input type="password" required minLength={6} autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-[15px] outline-none focus:border-[#1e3a5f]" />
              {notice && <p className="text-[13px] text-red-600" role="status">{notice}</p>}
              <button type="submit" disabled={working} className="w-full py-2.5 bg-[#1e3a5f] text-white rounded-xl text-[14px] font-medium disabled:opacity-50">Save new password</button>
            </form>
          ) : (
            <p className="text-[13px] text-stone-500">Checking your reset link… If this page does not continue, the link may have expired. Return to Cloud and request another link.</p>
          )}
          <a href="/" className="inline-block text-[13px] text-[#1e3a5f]">Back to app</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50">
      <div className="bg-white border-b border-stone-100 px-4 py-4">
        <p className="text-[13px] text-stone-400">Your data</p>
        <h1 className="text-[18px] font-semibold text-stone-900">Cloud sync</h1>
      </div>
      <div className="px-4 py-5 space-y-4">
        <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            {mode === 'synced' ? <ShieldCheck className="text-[#1a4731]" size={22} />
              : mode === 'offline' ? <CloudOff className="text-amber-600" size={22} />
                : <Cloud className="text-[#1e3a5f]" size={22} />}
            <p className="text-[15px] font-semibold text-stone-900">
              {mode === 'synced' ? 'Synced' : mode === 'connecting' ? 'Connecting…'
                : mode === 'conflict' ? 'Choose your data' : mode === 'offline' ? 'Sync paused' : 'On this device only'}
            </p>
          </div>
          <p className="text-[13px] text-stone-500">
            {message ?? (mode === 'synced' ? 'Tasks, targets and quote choices are saved to Supabase.'
              : 'Sign in to back up your data and use it on another device.')}
          </p>
          {signedInEmail && <p className="text-[12px] text-stone-400 mt-2">{signedInEmail}</p>}
          {lastSynced && mode === 'synced' && (
            <p className="text-[12px] text-stone-400 mt-1">Last synced {new Date(lastSynced).toLocaleString()}</p>
          )}
          {userId && mode !== 'conflict' && (
            <button onClick={() => void refreshCloud()} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1e3a5f]">
              <RefreshCw size={14} /> Sync now
            </button>
          )}
        </div>

        {mode === 'conflict' && (
          <div className="bg-white border border-amber-200 rounded-2xl p-5 space-y-3">
            <p className="text-[13px] text-stone-600">These copies differ. Download a backup before choosing; your choice will replace the other copy.</p>
            <button onClick={downloadLocalBackup} className="w-full py-2.5 border border-stone-200 rounded-xl text-[13px] font-medium inline-flex items-center justify-center gap-2">
              <Download size={15} /> Download this device backup
            </button>
            <button onClick={() => void resolveCloudConflict('cloud')} className="w-full py-2.5 bg-[#1e3a5f] text-white rounded-xl text-[13px] font-medium">
              Use cloud copy
            </button>
            <button onClick={() => void resolveCloudConflict('device')} className="w-full py-2.5 border border-[#1e3a5f] text-[#1e3a5f] rounded-xl text-[13px] font-medium">
              Upload this device copy
            </button>
          </div>
        )}

        {!userId && resetMode && (
          <form onSubmit={(event: FormEvent) => { event.preventDefault(); void requestReset() }} className="bg-white border border-stone-100 rounded-2xl p-5 space-y-3 shadow-sm">
            <p className="text-[15px] font-semibold text-stone-900">Forgot password?</p>
            <p className="text-[12px] text-stone-500">Enter your account email to receive a password reset link.</p>
            <input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Email" className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-[15px] outline-none focus:border-[#1e3a5f]" />
            {notice && <p className="text-[13px] text-stone-600" role="status">{notice}</p>}
            <button type="submit" disabled={working} className="w-full py-2.5 bg-[#1e3a5f] text-white rounded-xl text-[14px] font-medium disabled:opacity-50">Send reset link</button>
            <button type="button" onClick={() => { setResetMode(false); setNotice(null) }} className="text-[13px] text-[#1e3a5f]">Back to sign in</button>
          </form>
        )}

        {!userId && !resetMode && (
          <form onSubmit={(event: FormEvent) => { event.preventDefault(); void authenticate('sign-in') }} className="bg-white border border-stone-100 rounded-2xl p-5 space-y-3 shadow-sm">
            <p className="text-[15px] font-semibold text-stone-900">Sign in or create an account</p>
            <p className="text-[12px] text-stone-500">Use the same account on each device. Your existing data stays on this device until cloud upload succeeds.</p>
            <input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Email" className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-[15px] outline-none focus:border-[#1e3a5f]" />
            <input type="password" required minLength={6} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password (at least 6 characters)" className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-[15px] outline-none focus:border-[#1e3a5f]" />
            {notice && <p className="text-[13px] text-stone-600" role="status">{notice}</p>}
            <div className="grid grid-cols-2 gap-2">
              <button type="submit" disabled={working} className="py-2.5 bg-[#1e3a5f] text-white rounded-xl text-[14px] font-medium disabled:opacity-50">Sign in</button>
              <button type="button" disabled={working} onClick={event => { if (event.currentTarget.form?.reportValidity()) void authenticate('sign-up') }} className="py-2.5 border border-[#1e3a5f] text-[#1e3a5f] rounded-xl text-[14px] font-medium disabled:opacity-50">Create account</button>
            </div>
            <button type="button" onClick={() => { setResetMode(true); setNotice(null) }} className="text-[13px] text-[#1e3a5f]">Forgot password?</button>
          </form>
        )}

        {userId && (
          <button onClick={() => void client.auth.signOut()} className="text-[13px] text-stone-500 px-2 py-2">Sign out</button>
        )}
        <button onClick={downloadLocalBackup} className="text-[13px] text-stone-500 px-2 py-2 inline-flex items-center gap-2"><Download size={14} /> Download local backup</button>
      </div>
    </div>
  )
}
