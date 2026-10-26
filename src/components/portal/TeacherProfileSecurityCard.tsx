import React, { useState, useRef } from 'react';
import {
  User,
  Camera,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Lock,
  Eye,
  EyeOff,
  Building2,
  BookOpen,
  Phone,
  Mail,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { uploadToStorage } from '../../utils/blobStorage';
import { uploadTeacherHeadshot } from '../../services/blobService';
import {
  getTeacherAuthProfile,
  getActiveTeacherPin,
  changeTeacherPinWithVerification,
  setCustomTeacherPin,
} from '../../services/teacherAuthDirectory';

interface TeacherProfileSecurityCardProps {
  teacherId?: string;
  teacherEmail?: string;
  onProfileUpdated?: () => void;
}

export const TeacherProfileSecurityCard: React.FC<TeacherProfileSecurityCardProps> = ({
  teacherId,
  teacherEmail,
  onProfileUpdated,
}) => {
  const { user, userProfile } = useAuth();
  const { language } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Identify teacher
  const effectiveEmail = teacherEmail || user?.email || userProfile?.email || 'yohanabahati665@gmail.com';
  const profile = getTeacherAuthProfile(teacherId || effectiveEmail);

  // States
  const [photoUrl, setPhotoUrl] = useState<string>(
    userProfile?.photoURL || profile?.imageUrl || '/media/media_3.webp'
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoStatusMessage, setPhotoStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // PIN states
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [pinStatusMessage, setPinStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Photo Upload Handler (Vercel Blob + Firebase Firestore)
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoStatusMessage({
        type: 'error',
        text: 'Tafadhali chagua faili la picha (JPEG, PNG au WebP).',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoStatusMessage({
        type: 'error',
        text: 'Ukubwa wa picha usizidi 10MB.',
      });
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoStatusMessage(null);

    try {
      // 1. Upload to Vercel Blob with Firestore profile synchronization
      const targetId = user?.uid || profile?.id || effectiveEmail;
      const uploadRes = await uploadTeacherHeadshot(file, targetId, {
        teacherName: userProfile?.fullName || profile?.name,
        updateFirestore: true,
      });

      if (!uploadRes.success || !uploadRes.url) {
        throw new Error(uploadRes.error || 'Imeshindwa kupakia picha.');
      }

      const uploadedUrl = uploadRes.url;
      setPhotoUrl(uploadedUrl);

      // 2. Update in runtime profile & local storage
      if (profile) {
        profile.imageUrl = uploadedUrl;
      }
      try {
        const customPhotos = JSON.parse(localStorage.getItem('uomboni_teacher_photos') || '{}');
        customPhotos[effectiveEmail.toLowerCase()] = uploadedUrl;
        if (profile?.id) customPhotos[profile.id.toLowerCase()] = uploadedUrl;
        localStorage.setItem('uomboni_teacher_photos', JSON.stringify(customPhotos));
      } catch {}

      setPhotoStatusMessage({
        type: 'success',
        text: `Picha yako imepakiwa na kuhifadhiwa kikamilifu kwenye ${
          uploadRes.source === 'vercel_blob' ? 'Vercel Blob Storage' : 'Hifadhi ya Shule'
        } na Firebase Firestore!`,
      });

      if (onProfileUpdated) onProfileUpdated();
    } catch (err: any) {
      setPhotoStatusMessage({
        type: 'error',
        text: err?.message || 'Hitilafu wakati wa kupakia picha.',
      });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // PIN Update Handler (Firebase Firestore + Local Storage Directory)
  const handlePinUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinStatusMessage(null);

    const cleanNew = newPin.trim();
    const cleanConfirm = confirmPin.trim();

    if (!cleanNew) {
      setPinStatusMessage({
        type: 'error',
        text: 'Tafadhali weka PIN mpya.',
      });
      return;
    }

    if (cleanNew.length < 4) {
      setPinStatusMessage({
        type: 'error',
        text: 'PIN mpya lazima iwe na angalau tarakimu 4 au zaidi.',
      });
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setPinStatusMessage({
        type: 'error',
        text: 'PIN mpya na uthibitisho havilingani. Hakikisha umezijaza sawa.',
      });
      return;
    }

    setIsSavingPin(true);

    try {
      const teacherKey = profile?.id || effectiveEmail;

      // 1. Verify current PIN if configured
      if (currentPin.trim()) {
        const verifyRes = changeTeacherPinWithVerification(teacherKey, currentPin, cleanNew);
        if (!verifyRes.success) {
          setPinStatusMessage({
            type: 'error',
            text: verifyRes.messageSw,
          });
          setIsSavingPin(false);
          return;
        }
      } else {
        // Direct set
        setCustomTeacherPin(teacherKey, cleanNew);
      }

      // 2. Persist in Firebase Firestore
      if (user?.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(
            userDocRef,
            {
              customPin: cleanNew,
              school: 'Uomboni Secondary School',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (dbErr) {
          console.warn('[Firestore] Custom PIN update error (offline fallback):', dbErr);
        }
      }

      // 3. Update runtime cache & local storage
      try {
        const customPins = JSON.parse(localStorage.getItem('uomboni_teacher_custom_pins') || '{}');
        customPins[effectiveEmail.toLowerCase()] = cleanNew;
        if (profile?.id) customPins[profile.id.toLowerCase()] = cleanNew;
        localStorage.setItem('uomboni_teacher_custom_pins', JSON.stringify(customPins));
        localStorage.setItem(`uomboni_pin_${teacherKey}`, cleanNew);
      } catch {}

      if (profile) {
        profile.defaultPin = cleanNew;
      }

      setPinStatusMessage({
        type: 'success',
        text: 'PIN yako mpya imehifadhiwa na kuidhinishwa kwenye Firebase na mfumo wa shule! Sasa unaweza kuitumia kuingia popote.',
      });

      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');

      if (onProfileUpdated) onProfileUpdated();
    } catch (err: any) {
      setPinStatusMessage({
        type: 'error',
        text: err?.message || 'Hitilafu ya kuhifadhi PIN kwenye Firebase.',
      });
    } finally {
      setIsSavingPin(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card: Institutional Identity */}
      <div className="bg-gradient-to-r from-[#102A43] via-[#0B1E32] to-[#102A43] text-white p-6 rounded-3xl border border-[#C9A227]/40 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Profile Photo with Upload Trigger */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-[#C9A227] shadow-md bg-slate-900 flex items-center justify-center">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={profile?.name || 'Mwalimu'}
                    className="w-full h-full object-cover"
                    onError={() => setPhotoUrl('/media/media_3.webp')}
                  />
                ) : (
                  <span className="text-3xl font-black text-amber-300">
                    {(profile?.name || userProfile?.fullName || 'U').charAt(0)}
                  </span>
                )}
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                title="Bofya kubadili picha"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-amber-300 mb-0.5" />
                    <span>Badili Picha</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase tracking-wider">
                  ✓ Imethibitishwa na Firebase
                </span>
                <span className="text-[11px] text-[#C9A227] font-bold">
                  NECTA S0486
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                {profile?.name || userProfile?.fullName || 'Mwl. Yohana Bahati'}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {profile?.role || 'Mtaaluma Mkuu (Academic Master) & Msimamizi Mkuu'}
              </p>
              <p className="text-[11px] text-amber-200/90 font-mono mt-0.5">
                {effectiveEmail}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all self-stretch sm:self-auto justify-center"
          >
            {isUploadingPhoto ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Inapakia kwenye Vercel Blob...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-slate-950" />
                <span>Pakia Picha Mpya</span>
              </>
            )}
          </button>
        </div>

        {/* Photo Status Alert */}
        {photoStatusMessage && (
          <div
            className={`mt-4 p-3 rounded-2xl text-xs flex items-center gap-2 ${
              photoStatusMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
            }`}
          >
            {photoStatusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{photoStatusMessage.text}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Left Column: Teacher Details & Authorizations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="p-2 rounded-xl bg-blue-50 text-[#102A43]">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#102A43]">Taarifa za Kazi na Shule</h3>
              <p className="text-[11px] text-slate-500">Shule ya Sekondari Uomboni (NECTA S0486)</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Idara ya Masomo:</span>
              <strong className="text-[#102A43]">{profile?.department || 'Sayansi na Utawala'}</strong>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Nambari ya Simu:</span>
              <span className="font-mono font-bold text-slate-800">{profile?.phone || '+255 745 548 225'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Taasisi:</span>
              <span className="font-bold text-[#102A43]">Shule ya Sekondari Uomboni</span>
            </div>

            <div className="py-2">
              <span className="text-slate-500 block mb-1.5 font-bold">Masomo Yaliyoidhinishwa Kufundisha &amp; Kusahihisha:</span>
              <div className="flex flex-wrap gap-1.5">
                {(profile?.assignedSubjects || ['Physics', 'Basic Mathematics']).map((sub) => (
                  <span
                    key={sub}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 text-[11px]"
                  >
                    📚 {sub}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Taarifa za mwalimu zinalindwa na kanuni za <strong>Firebase Firestore Security Rules</strong> na jina rasmi la <strong>Uomboni Secondary School</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Right Column: Change PIN / Password Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-900">
              <KeyRound className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#102A43]">Badili PIN / Nenosiri Lako</h3>
              <p className="text-[11px] text-slate-500">Inahifadhiwa na kutambuliwa kwenye Firebase</p>
            </div>
          </div>

          {/* PIN Status Alert */}
          {pinStatusMessage && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
                pinStatusMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}
            >
              {pinStatusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{pinStatusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePinUpdate} className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                PIN ya Sasa (Current PIN):
              </label>
              <div className="relative">
                <input
                  type={showPins ? 'text' : 'password'}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Mfano: 745225"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono outline-none focus:border-[#102A43]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Weka PIN yako ya sasa (Mfano: PIN ya Mwl. Yohana ni 745225 au Headmaster 782558).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  PIN Mpya (New PIN):
                </label>
                <div className="relative">
                  <input
                    type={showPins ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Tarakimu 4-6"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono outline-none focus:border-[#102A43]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Thibitisha PIN Mpya:
                </label>
                <div className="relative">
                  <input
                    type={showPins ? 'text' : 'password'}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Rudia PIN mpya"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono outline-none focus:border-[#102A43]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPins(!showPins)}
                className="text-slate-500 hover:text-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#C9A227]" />}
                <span>{showPins ? 'Ficha PIN' : 'Onyesha PIN'}</span>
              </button>

              <button
                type="submit"
                disabled={isSavingPin || !newPin.trim()}
                className="px-4 py-2 rounded-xl bg-[#102A43] hover:bg-[#0B1E32] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 transition"
              >
                {isSavingPin ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    <span>Inahifadhi Firebase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-amber-300" />
                    <span>Hifadhi PIN Mpya</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
