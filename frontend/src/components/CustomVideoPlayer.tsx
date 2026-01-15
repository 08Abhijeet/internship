"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Play, Pause, FastForward, Rewind, SkipForward, MessageSquare, 
  XCircle, Volume2, VolumeX, Maximize, Minimize 
} from "lucide-react";

interface CustomVideoPlayerProps {
  src: string;
  onNextVideo?: () => void;
  toggleComments?: () => void;
  autoPlay?: boolean;
  limitInSeconds?: number;
  onOpenPremium: () => void;
}

const CustomVideoPlayer = ({ 
  src, 
  onNextVideo, 
  toggleComments, 
  autoPlay = false,
  limitInSeconds = Infinity, 
  onOpenPremium 
}: CustomVideoPlayerProps) => {
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [buffer, setBuffer] = useState<number>(0);
  
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ icon: React.ReactNode; text: string } | null>(null);
  const [isLimitReached, setIsLimitReached] = useState<boolean>(false);

  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef<number>(0);
  const lastTapZoneRef = useRef<string | null>(null);

  useEffect(() => {
    setIsLimitReached(false);
    setCurrentTime(0);
    setBuffer(0);
  }, [src]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const vidDuration = videoRef.current.duration || 1;

      if (limitInSeconds !== Infinity && current >= limitInSeconds) {
        videoRef.current.pause();
        videoRef.current.currentTime = limitInSeconds;
        setIsPlaying(false);
        setIsLimitReached(true);
        return; 
      }

      setCurrentTime(current);
      setDuration(vidDuration);

      const buffered = videoRef.current.buffered;
      if (buffered.length > 0) {
        for (let i = 0; i < buffered.length; i++) {
          if (buffered.start(i) <= current && current <= buffered.end(i)) {
            setBuffer((buffered.end(i) / vidDuration) * 100);
            break;
          }
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLimitReached || !timelineRef.current || !videoRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    
    const newTime = percentage * videoRef.current.duration;
    
    if (limitInSeconds !== Infinity && newTime >= limitInSeconds) {
       return;
    }

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const togglePlay = () => {
    if (isLimitReached || !videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      triggerFeedback(<Play className="w-12 h-12 fill-white" />, "Play");
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      triggerFeedback(<Pause className="w-12 h-12 fill-white" />, "Pause");
    }
  };

  const skip = (seconds: number) => {
    if (isLimitReached || !videoRef.current) return;

    videoRef.current.currentTime += seconds;
    const Icon = seconds > 0 ? FastForward : Rewind;
    triggerFeedback(<Icon className="w-12 h-12 fill-white" />, `${seconds > 0 ? '+' : ''}${seconds}s`);
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const getClickZone = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    if (x < width * 0.3) return "LEFT";
    if (x > width * 0.7) return "RIGHT";
    return "MIDDLE";
  };

  const handleTap = (e: React.MouseEvent) => {
    if (isLimitReached) return;
    

    if ((e.target as HTMLElement).closest('.group\\/timeline')) return;

    e.preventDefault();
    const zone = getClickZone(e);
    
    if (lastTapZoneRef.current && lastTapZoneRef.current !== zone) {
      clickCountRef.current = 0;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    }

    lastTapZoneRef.current = zone;
    clickCountRef.current += 1;

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    clickTimeoutRef.current = setTimeout(() => {
      executeGesture(zone, clickCountRef.current);
      clickCountRef.current = 0; 
      lastTapZoneRef.current = null;
    }, 300);
  };

  const executeGesture = (zone: string, count: number) => {
    if (zone === "MIDDLE") {
      if (count === 1) togglePlay();
      else if (count === 3) {
        triggerFeedback(<SkipForward className="w-12 h-12 fill-white" />, "Next Video");
        if (onNextVideo) onNextVideo();
      }
    } 
    else if (zone === "RIGHT") {
      if (count === 2) skip(10);
      else if (count === 3) {
        triggerFeedback(<XCircle className="w-12 h-12 text-red-500" />, "Closing Tab...");
        setTimeout(() => {
          try { window.open('','_self')!.close(); } catch(e) {}
          window.location.href = "about:blank"; 
        }, 500);
      }
    } 
    else if (zone === "LEFT") {
      if (count === 2) skip(-10);
      else if (count === 3) {
        triggerFeedback(<MessageSquare className="w-12 h-12 fill-white" />, "Opening Comments...");
        if (toggleComments) toggleComments();
      }
    }
  };

  const triggerFeedback = (icon: React.ReactNode, text: string) => {
    setFeedback({ icon, text });
    setTimeout(() => setFeedback(null), 800);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-video  rounded-xl overflow-hidden shadow-2xl group select-none flex flex-col justify-center bg-black"
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={handleTap}
        autoPlay 
      />

      {feedback && !isLimitReached && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 animate-in fade-in pointer-events-none">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-full mb-2">{feedback.icon}</div>
          <span className="text-white font-bold text-lg drop-shadow-md">{feedback.text}</span>
        </div>
      )}

      {!isLimitReached && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex flex-col gap-2">
          
          <div 
            ref={timelineRef}
            className="relative w-full h-1.5 bg-white/20 hover:h-2.5 transition-all cursor-pointer group/timeline rounded-full"
            onClick={handleTimelineClick}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-white/40 rounded-full transition-all duration-300"
              style={{ width: `${buffer}%` }}
            />
            
            <div 
              className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-red-600 rounded-full scale-0 group-hover/timeline:scale-100 transition-transform" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white hover:text-red-500 transition">
                {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current" />}
              </button>
              
              <div className="flex items-center gap-2 group/vol">
                <button onClick={() => setIsMuted(!isMuted)} className="text-white">
                  {isMuted ? <VolumeX /> : <Volume2 />}
                </button>
                <input 
                  type="range" min="0" max="1" step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setVolume(val);
                    if(videoRef.current) videoRef.current.volume = val;
                    setIsMuted(val === 0);
                  }}
                  className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300 h-1 accent-white"
                />
              </div>

              <span className="text-xs text-gray-200 font-medium font-sans">
                 {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button onClick={toggleFullscreen} className="text-white hover:scale-110 transition">
              {isFullscreen ? <Minimize /> : <Maximize />}
            </button>
          </div>
        </div>
      )}

      {isLimitReached && (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-white z-50">
          <div className="text-center p-6">
            <h2 className="text-3xl font-bold mb-3 text-red-500">Trial Ended</h2>
            <button onClick={onOpenPremium} className="px-8 py-3 font-bold text-white bg-red-600 rounded-full hover:bg-red-700">
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomVideoPlayer;