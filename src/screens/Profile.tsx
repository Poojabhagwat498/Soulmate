import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ChevronRight, Award, Image as ImageIcon, Briefcase, Heart, ShieldCheck, FileText, Link2, X, Loader2, Video, VideoOff, Camera, Trash2, Play, Pause, RefreshCw, Upload } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function Profile() {
  const { showToast } = useToast();
  const [isVerified, setIsVerified] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMethodName, setVerifyMethodName] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(() => {
    const base = 60;
    const hasVideo = localStorage.getItem('soulmate_video_completed') ? 20 : 0;
    return base + hasVideo;
  });

  // Video Intro states
  const [videoUrl, setVideoUrl] = useState<string | null>(() => {
    return localStorage.getItem('soulmate_video_intro') || null;
  });
  const [showRecorderModal, setShowRecorderModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const recordedVideoRef = useRef<HTMLVideoElement | null>(null);
  const countdownIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (videoPreviewRef.current && mediaStream) {
      videoPreviewRef.current.srcObject = mediaStream;
      videoPreviewRef.current.play().catch(err => console.log('video preview stream start err:', err));
    }
  }, [mediaStream, showRecorderModal]);

  const startCamera = async (forceSimulator = false) => {
    if (forceSimulator) {
      setIsSimulatorMode(true);
      setCameraError(null);
      return;
    }

    try {
      setCameraError(null);
      setIsSimulatorMode(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true
      });
      setMediaStream(stream);
    } catch (err: any) {
      console.warn('Could not access real camera, enabling elegant simulator mode:', err);
      setIsSimulatorMode(true);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const startRecording = () => {
    setPreviewUrl(null);
    setIsRecording(true);
    setRecordingTime(0);

    if (isSimulatorMode) {
      countdownIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            clearInterval(countdownIntervalRef.current);
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (mediaStream) {
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const completeBlob = new Blob(chunks, { type: 'video/webm' });
        const localBlobUrl = URL.createObjectURL(completeBlob);
        setPreviewUrl(localBlobUrl);
      };

      recorder.start(100);
      setMediaRecorder(recorder);

      countdownIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            clearInterval(countdownIntervalRef.current);
            recorder.stop();
            setIsRecording(false);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setIsRecording(false);

    if (isSimulatorMode) {
      setPreviewUrl('https://assets.mixkit.co/videos/preview/mixkit-woman-smiling-at-camera-39985-large.mp4');
    } else if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const handleSaveVideo = () => {
    if (!previewUrl) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      
      const savedUrl = previewUrl;
      setVideoUrl(savedUrl);
      localStorage.setItem('soulmate_video_intro', savedUrl);
      
      if (!localStorage.getItem('soulmate_video_completed')) {
        localStorage.setItem('soulmate_video_completed', 'true');
        setCompletionPercentage(prev => Math.min(prev + 20, 100));
        showToast('Video introduction uploaded! Profile completion increased by 20%.', 'success');
      } else {
        showToast('Video introduction updated successfully!', 'success');
      }
      
      setShowRecorderModal(false);
      stopCamera();
    }, 1800);
  };

  const handleDeleteVideo = () => {
    setVideoUrl(null);
    localStorage.removeItem('soulmate_video_intro');
    if (localStorage.getItem('soulmate_video_completed')) {
      localStorage.removeItem('soulmate_video_completed');
      setCompletionPercentage(prev => Math.max(prev - 20, 0));
    }
    showToast('Video introduction removed.', 'info');
  };

  const [missingDetails, setMissingDetails] = useState([
    { id: 'photos', label: 'Add more photos', icon: ImageIcon, points: 15, pointsStr: '+15%' },
    { id: 'career', label: 'Add career details', icon: Briefcase, points: 15, pointsStr: '+15%' },
    { id: 'interests', label: 'Add your interests', icon: Heart, points: 10, pointsStr: '+10%' },
  ]);

  const handleVerification = (method: 'Government ID' | 'Social Media') => {
    setVerifyMethodName(method);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setShowVerifyModal(false);
      showToast(`Identity verified successfully using ${method}!`, 'success');
    }, 1500);
  };

  const handleCompleteDetail = (id: string, label: string, points: number) => {
    setMissingDetails(prev => prev.filter(item => item.id !== id));
    setCompletionPercentage(prev => {
      const next = Math.min(prev + points, 100);
      showToast(`${label} saved successfully! Profile is now ${next}% complete.`, 'success');
      return next;
    });
  };

  const handleSettingsClick = (item: string) => {
    showToast(`Preferences for "${item}" updated.`, 'success');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 pt-6 px-5 max-w-2xl mx-auto space-y-8"
    >
      <div className="flex flex-col items-center justify-center pt-4 text-center">
        <div className="relative">
          <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-4 border-4 border-surface shadow-sm overflow-hidden">
            <User className="w-10 h-10 text-primary/50" />
          </div>
          <button 
            onClick={() => showToast('Avatar picture updated!', 'success')}
            className="absolute bottom-4 right-0 bg-primary text-white p-1.5 rounded-full shadow-md active:scale-95 transition-transform"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="font-heading text-2xl font-bold text-primary">Your Profile</h2>
        </div>
        <p className="text-sm text-on-surface-variant flex items-center justify-center gap-1">
          Arnav Singh
          {isVerified && (
            <span className="inline-flex items-center justify-center bg-tertiary/10 text-tertiary rounded-full px-2 py-0.5 text-[10px] font-bold gap-1 ml-1 uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </p>
      </div>

      {!isVerified && (
        <section className="bg-gradient-to-r from-tertiary/10 to-transparent border border-tertiary/20 rounded-2xl p-4 flex items-center justify-between soft-shadow">
          <div className="flex flex-col">
            <span className="font-sans font-bold text-sm text-on-surface flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-tertiary" />
              Get Verified
            </span>
            <span className="text-xs text-on-surface-variant mt-0.5">Build trust with potential matches.</span>
          </div>
          <button 
            onClick={() => setShowVerifyModal(true)}
            className="px-4 py-2 bg-tertiary text-white rounded-full text-xs font-bold shadow-sm active:scale-95 transition-transform"
          >
            Verify Now
          </button>
        </section>
      )}

      <section className="bg-surface-container-lowest rounded-2xl p-5 soft-shadow border border-primary/5">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h3 className="font-sans text-lg font-semibold text-on-surface flex items-center gap-2">
              <Award className="w-5 h-5 text-tertiary" />
              Profile Completion
            </h3>
          </div>
          <span className="font-sans text-xl font-bold text-primary">{completionPercentage}%</span>
        </div>
        
        <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden mb-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-gradient-to-r from-secondary to-primary h-full rounded-full"
          />
        </div>

        <p className="text-sm text-on-surface-variant mb-4">
          Complete your profile to get 3x more matches and stand out in the community.
        </p>

        {missingDetails.length > 0 ? (
          <div className="space-y-3">
            {missingDetails.map(detail => {
              const Icon = detail.icon;
              return (
                <button 
                  key={detail.id} 
                  onClick={() => handleCompleteDetail(detail.id, detail.label, detail.points)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-sans text-sm font-semibold text-on-surface">{detail.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-full">{detail.pointsStr}</span>
                    <ChevronRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-secondary font-semibold text-center py-2">🎉 Outstanding! Your profile is 100% complete.</p>
        )}
      </section>

      {/* Video Introduction Section */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 soft-shadow border border-primary/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-sans text-lg font-semibold text-on-surface flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Video Introduction
          </h3>
          {videoUrl && (
            <button 
              onClick={handleDeleteVideo}
              className="text-xs text-error hover:underline flex items-center gap-1 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>

        {videoUrl ? (
          <div className="space-y-3">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-inner group">
              <video 
                ref={recordedVideoRef}
                src={videoUrl}
                controls
                playsInline
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=640"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[10px] text-white px-2.5 py-1 rounded-full font-sans font-semibold tracking-wider uppercase flex items-center gap-1.5 z-10">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                Live Introduction
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-on-surface-variant max-w-[70%]">
                Your 30s video introduction is active and visible on your matchmaking profile!
              </p>
              <button
                onClick={() => {
                  setShowRecorderModal(true);
                  startCamera();
                }}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                Record New
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-outline-variant/50 rounded-2xl p-6 text-center space-y-3 flex flex-col items-center justify-center bg-surface-container-low/10">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
              <Camera className="w-6 h-6" />
            </div>
            <div className="max-w-md space-y-1">
              <h4 className="font-sans font-bold text-sm text-on-surface">No Video Introduction Yet</h4>
              <p className="text-xs text-on-surface-variant">
                Record a short 30-second introduction. Profiles with video introductions receive up to <span className="font-bold text-primary">300% more interest</span> and matches!
              </p>
            </div>
            <button
              onClick={() => {
                setShowRecorderModal(true);
                startCamera();
              }}
              className="mt-2 bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 active:scale-95 transition-transform hover:bg-primary/95 shadow-md shadow-primary/10"
            >
              <Video className="w-4 h-4" />
              Record Intro Video (+20%)
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-sans text-sm font-bold text-outline uppercase tracking-wider px-2">Account Settings</h3>
        <div className="bg-surface-container-lowest rounded-2xl soft-shadow border border-primary/5 overflow-hidden">
          {['Edit Personal Details', 'Partner Preferences', 'Privacy Settings', 'Help & Support'].map((item, i) => (
            <button 
              key={item} 
              onClick={() => handleSettingsClick(item)}
              className={`w-full flex items-center justify-between p-4 ${i !== 3 ? 'border-b border-outline-variant/20' : ''} hover:bg-surface-container-low transition-colors`} 
            >
              <span className="font-sans text-sm font-medium text-on-surface">{item}</span>
              <ChevronRight className="w-4 h-4 text-outline" />
            </button>
          ))}
        </div>
      </section>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isVerifying && setShowVerifyModal(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-surface z-[70] rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold text-primary flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-tertiary" />
                    Profile Verification
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1">Choose a method to verify your identity</p>
                </div>
                <button 
                  onClick={() => setShowVerifyModal(false)} 
                  disabled={isVerifying}
                  className="p-2 -mr-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <button 
                  onClick={() => handleVerification('Government ID')}
                  disabled={isVerifying}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/50 hover:bg-surface-container-low hover:border-tertiary/50 transition-all text-left disabled:opacity-50 disabled:pointer-events-none group"
                >
                  <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center flex-none group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-tertiary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-sans font-bold text-on-surface text-sm">Government ID</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">Upload a driver's license or passport</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-outline group-hover:text-tertiary" />
                </button>

                <button 
                  onClick={() => handleVerification('Social Media')}
                  disabled={isVerifying}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-outline-variant/50 hover:bg-surface-container-low hover:border-tertiary/50 transition-all text-left disabled:opacity-50 disabled:pointer-events-none group"
                >
                  <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center flex-none group-hover:scale-110 transition-transform">
                    <Link2 className="w-6 h-6 text-tertiary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-sans font-bold text-on-surface text-sm">Social Media</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">Connect LinkedIn or Instagram</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-outline group-hover:text-tertiary" />
                </button>
              </div>

              {isVerifying && (
                <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-10 h-10 text-tertiary animate-spin mb-4" />
                  <p className="font-sans font-bold text-on-surface">Verifying your profile using {verifyMethodName}...</p>
                  <p className="text-sm text-on-surface-variant mt-1">This will only take a moment.</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Video Recorder Modal */}
      <AnimatePresence>
        {showRecorderModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isRecording && !isUploading) {
                  setShowRecorderModal(false);
                  stopCamera();
                }
              }}
              className="fixed inset-0 bg-black/80 z-[80] backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 h-[90vh] bg-surface z-[90] rounded-t-3xl shadow-2xl flex flex-col md:max-w-md md:left-1/2 md:-translate-x-1/2 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 bg-surface">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-sans font-bold text-base text-primary leading-tight">
                      Record Video Introduction
                    </h3>
                    <p className="text-[11px] text-on-surface-variant">Maximum 30 seconds</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowRecorderModal(false);
                    stopCamera();
                  }} 
                  disabled={isRecording || isUploading}
                  className="p-2 -mr-2 text-on-surface-variant hover:text-primary transition-colors active:scale-90 disabled:opacity-30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Recorder Body */}
              <div className="flex-1 bg-black relative flex flex-col items-center justify-center overflow-hidden">
                {previewUrl ? (
                  /* Preview recorded video */
                  <video 
                    src={previewUrl}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                  />
                ) : (
                  /* Live Camera Feed or Simulator */
                  <div className="w-full h-full relative flex items-center justify-center bg-neutral-900">
                    {isSimulatorMode ? (
                      /* Simulator UI */
                      <div className="text-center p-6 space-y-4 flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-primary/10 via-black to-primary/10">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center animate-pulse">
                            <User className="w-12 h-12 text-primary" />
                          </div>
                          {isRecording && (
                            <div className="absolute -top-1 -right-1 bg-error w-4 h-4 rounded-full animate-ping" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-sans font-bold text-sm text-white">Camera Simulator Active</h4>
                          <p className="text-[11px] text-neutral-400 max-w-xs">
                            {isRecording 
                              ? "Recording simulated introduction... Speak into your microphone." 
                              : "Camera permissions restricted or unavailable. Ready to record high-fidelity simulated intro!"}
                          </p>
                        </div>
                        
                        {/* Audio Waves Simulation */}
                        {isRecording && (
                          <div className="flex items-center justify-center gap-1.5 h-8">
                            {[1, 2, 3, 4, 5, 4, 3, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map((h, i) => (
                              <motion.div 
                                key={i}
                                animate={{ height: [8, h * 5, 8] }}
                                transition={{ repeat: Infinity, duration: 0.5 + (i % 3) * 0.1 }}
                                className="w-1 bg-secondary rounded-full"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Real Video Stream */
                      <video 
                        ref={videoPreviewRef}
                        muted
                        playsInline
                        autoPlay
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                    )}

                    {/* Camera Error State (rare, because we auto-simulate) */}
                    {cameraError && (
                      <div className="absolute inset-0 bg-neutral-950 p-6 flex flex-col items-center justify-center text-center space-y-4 z-10">
                        <VideoOff className="w-12 h-12 text-neutral-600" />
                        <div className="space-y-1">
                          <h4 className="font-sans font-bold text-sm text-white">Camera Access Blocked</h4>
                          <p className="text-xs text-neutral-400 max-w-xs">{cameraError}</p>
                        </div>
                        <button
                          onClick={() => startCamera(true)}
                          className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                        >
                          Use Virtual Camera Simulator
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Status HUD Overlays */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                  {isRecording ? (
                    <div className="bg-error/90 backdrop-blur-md text-[10px] text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Recording • 00:{recordingTime.toString().padStart(2, '0')}
                    </div>
                  ) : previewUrl ? (
                    <div className="bg-secondary/90 backdrop-blur-md text-[10px] text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg">
                      Previewing Introduction
                    </div>
                  ) : (
                    <div className="bg-black/60 backdrop-blur-md text-[10px] text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg">
                      Camera Ready
                    </div>
                  )}

                  {!previewUrl && (
                    <button
                      onClick={() => startCamera(!isSimulatorMode)}
                      className="pointer-events-auto bg-black/60 backdrop-blur-md hover:bg-black/80 text-[10px] text-white px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 border border-white/15"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {isSimulatorMode ? "Switch to Real" : "Switch to Sim"}
                    </button>
                  )}
                </div>

                {/* 30-Second Limit Progress Bar */}
                {isRecording && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-10">
                    <motion.div 
                      initial={{ width: '0%' }}
                      animate={{ width: `${(recordingTime / 30) * 100}%` }}
                      transition={{ ease: 'linear', duration: 1 }}
                      className="bg-error h-full"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-5 border-t border-outline-variant/30 bg-surface flex flex-col gap-3 z-10">
                {previewUrl ? (
                  /* Saved Preview actions */
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setPreviewUrl(null);
                          startCamera(isSimulatorMode);
                        }}
                        className="flex-1 py-3 border border-outline text-on-surface rounded-xl font-sans text-sm font-semibold hover:bg-surface-container-low transition-colors"
                      >
                        Retake Video
                      </button>
                      <button 
                        onClick={handleSaveVideo}
                        disabled={isUploading}
                        className="flex-[2] py-3 bg-primary text-white rounded-xl font-sans text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading Intro...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Save & Upload
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Active recording actions */
                  <div className="flex items-center justify-between px-2">
                    <div className="text-xs text-on-surface-variant max-w-[200px]">
                      Tip: Keep it friendly! Share your hobbies, family background, or what you look for in a partner.
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {isRecording ? (
                        <button 
                          onClick={stopRecording}
                          className="w-16 h-16 rounded-full bg-error flex items-center justify-center shadow-lg active:scale-95 transition-all outline outline-offset-4 outline-2 outline-error/30"
                        >
                          <div className="w-5 h-5 bg-white rounded-sm" />
                        </button>
                      ) : (
                        <button 
                          onClick={startRecording}
                          className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-95 transition-all outline outline-offset-4 outline-2 outline-primary/30 group"
                        >
                          <div className="w-6 h-6 bg-white rounded-full group-hover:scale-90 transition-transform flex items-center justify-center">
                            <div className="w-3.5 h-3.5 bg-error rounded-full" />
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

