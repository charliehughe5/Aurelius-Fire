import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Key,
  FileCheck2,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface AssessorIntroVideoProps {
  onAcknowledge?: () => void;
  acknowledged?: boolean;
}

export const AssessorIntroVideo: React.FC<AssessorIntroVideoProps> = ({
  onAcknowledge,
  acknowledged = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(acknowledged);
  const intervalRef = useRef<any>(null);

  const scriptSegments = [
    {
      title: 'Welcome & Assessor Introduction',
      duration: 6,
      text: "Hello, I am Charlie Hughes, your NEBOSH-qualified Fire Risk Assessor at Aurelius Fire Safety. Here is exactly what to expect on assessment day.",
    },
    {
      title: 'Duration: Maximum 3 Hours',
      duration: 7,
      text: "The on-site assessment will not take any longer than 3 hours. Depending on the size and complexity of your building, most non-destructive surveys take between 90 minutes and 3 hours.",
    },
    {
      title: 'Full Unhindered Physical Access',
      duration: 8,
      text: "I will require full access to all areas of the property. This includes electrical intake rooms, plant rooms, boiler spaces, risers, escape corridors, and external fire exit routes.",
    },
    {
      title: 'On-Site Escort & Master Keys',
      duration: 7,
      text: "A nominated site manager or keyholder must accompany me throughout the visit with master keys and access fobs to prevent delays and avoid inaccessible areas.",
    },
    {
      title: 'Commissioning & Compliance Paperwork',
      duration: 8,
      text: "Before I begin the physical inspection, please have all commissioning and test records ready on the desk: your Fire Alarm logbook, Emergency Lighting certs, Fixed Wire EICR, and gas test records.",
    },
    {
      title: 'Action Plan & Final Delivery',
      duration: 6,
      text: "Once finished, I will provide a verbal debrief before publishing your complete PAS 79 compliant Fire Risk Assessment with prioritized photographic action items.",
    },
  ];

  // Speech synthesis integration
  const speakSegment = (index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isMuted) return;

    const seg = scriptSegments[index];
    if (!seg) return;

    const utterance = new SpeechSynthesisUtterance(seg.text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    // Attempt to pick a British English voice if available
    const voices = window.speechSynthesis.getVoices();
    const gbVoice = voices.find(
      (v) => v.lang === 'en-GB' || v.name.includes('UK') || v.name.includes('British')
    );
    if (gbVoice) utterance.voice = gbVoice;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isPlaying) {
      speakSegment(activeSegmentIndex);
      const curDur = (scriptSegments[activeSegmentIndex]?.duration || 6) * 1000;
      intervalRef.current = setTimeout(() => {
        if (activeSegmentIndex < scriptSegments.length - 1) {
          setActiveSegmentIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          setHasCompleted(true);
        }
      }, curDur);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (intervalRef.current) clearTimeout(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, activeSegmentIndex, isMuted]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (activeSegmentIndex >= scriptSegments.length - 1) {
        setActiveSegmentIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveSegmentIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-xl border border-slate-800">
      {/* Top Banner */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Assessment Day Briefing</span>
              <span className="bg-blue-600/40 text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">
                AI Assessor Avatar
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Presented by Charlie Hughes • NEBOSH Fire Safety Assessor
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="text-[10px]">{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left / Top: Interactive Visual AI Avatar Stage */}
        <div className="lg:col-span-7 bg-radial from-slate-800 to-slate-950 p-6 flex flex-col justify-between items-center relative min-h-[300px] border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Assessor Avatar Graphics */}
          <div className="flex flex-col items-center my-auto space-y-3 z-10 text-center">
            <div className="relative">
              {/* Outer pulsing ring while speaking */}
              {isPlaying && (
                <div className="absolute -inset-2 rounded-full bg-blue-500/20 animate-ping" />
              )}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-blue-400/80 bg-slate-800 p-1 shadow-2xl relative overflow-hidden flex items-center justify-center">
                {/* Visual Avatar Placeholder */}
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-800 via-blue-900 to-indigo-900 flex flex-col items-center justify-center text-white relative">
                  <span className="text-3xl">👨‍💼</span>
                  <div className="absolute bottom-1 bg-blue-600 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                    Assessor
                  </div>
                </div>
              </div>
              {/* Live Status indicator */}
              <div className="absolute bottom-0 right-1 flex items-center space-x-1 bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-700 text-[10px]">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-slate-300 font-medium">{isPlaying ? 'Speaking' : 'Ready'}</span>
              </div>
            </div>

            <div>
              <div className="text-base font-bold text-white tracking-wide">Charlie Hughes</div>
              <div className="text-xs text-blue-300 font-medium">Senior Fire Risk Assessor (NEBOSH Cert)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Aurelius Commercial Fire Safety Ltd</div>
            </div>

            {/* Audio Waveform visualization */}
            <div className="flex items-center space-x-1 h-6 pt-1">
              {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 30, 60].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlaying ? 'bg-blue-400' : 'bg-slate-700'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(6, (h * (i % 2 === 0 ? 1 : 0.7))) / 3}px` : '4px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Subtitles / Closed Captions bar */}
          <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-center my-2 backdrop-blur-xs">
            <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider mb-0.5">
              {scriptSegments[activeSegmentIndex]?.title}
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              "{scriptSegments[activeSegmentIndex]?.text}"
            </p>
          </div>

          {/* Player Controls */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={togglePlay}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center space-x-1.5 shadow-md transition"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play Briefing'}</span>
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              Segment {activeSegmentIndex + 1} of {scriptSegments.length}
            </div>
          </div>
        </div>

        {/* Right: Key Site Rules Checklist */}
        <div className="lg:col-span-5 p-5 bg-slate-900/60 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Essential Site Requirements
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-start space-x-2.5">
                <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Maximum 3 Hours on Site</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Typical visit takes 1.5 to 3 hours. Please allocate uninterrupted time for the walkaround.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-start space-x-2.5">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 mt-0.5">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Full Unhindered Access & Escort</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Designated keyholder escort required. Access needed to plant rooms, electrical intakes, and risers.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-start space-x-2.5">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Statutory Compliance Paperwork</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Provide fire alarm logbook, emergency lighting test cert, electrical EICR, and gas cert on desk.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-start space-x-2.5">
                <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Pre-Assessment Form & Contract</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Complete the online questionnaire and sign the engagement terms prior to assessor arrival.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Dutyholder Acknowledgment</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setHasCompleted(true);
                if (onAcknowledge) onAcknowledge();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                hasCompleted
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-700 hover:bg-blue-600 text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{hasCompleted ? 'Briefing Understood' : 'Confirm & Acknowledge'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
