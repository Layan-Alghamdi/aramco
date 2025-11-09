import React, { useEffect, useMemo, useRef, useState } from "react";

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const extractYouTubeId = (url) => {
  const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&#?/]+)/i);
  return match ? match[1] : "";
};

const extractVimeoId = (url) => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : "";
};

const buildEmbedUrl = (object) => {
  if (!object.src) return "";
  if (object.sourceType === "youtube") {
    const id = extractYouTubeId(object.src);
    if (!id) return object.src;
    const params = new URLSearchParams({
      autoplay: object.autoplay ? "1" : "0",
      mute: object.muted ? "1" : "0",
      loop: object.loop ? "1" : "0",
      playlist: object.loop ? id : undefined,
      rel: "0",
      controls: "1",
      modestbranding: "1"
    });
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  }
  if (object.sourceType === "vimeo") {
    const id = extractVimeoId(object.src);
    if (!id) return object.src;
    const params = new URLSearchParams({
      autoplay: object.autoplay ? "1" : "0",
      muted: object.muted ? "1" : "0",
      loop: object.loop ? "1" : "0",
      title: "0",
      byline: "0",
      portrait: "0"
    });
    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
  }
  return object.src;
};

export default function VideoPlayer({ object, onChange, isSelected }) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const embedSrc = useMemo(() => buildEmbedUrl(object), [object]);
  const isHtml5 =
    object.sourceType === "upload" ||
    (object.sourceType === "url" && /\.(mp4|mov|webm|ogg)$/i.test(object.src || ""));

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(!!object.autoplay);
  }, [object.src]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = object.muted;
    videoRef.current.loop = object.loop;
    videoRef.current.playbackRate = object.playbackRate || 1;
    if (object.autoplay) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [object.autoplay, object.loop, object.muted, object.playbackRate]);

  const toggleProperty = (key) => {
    onChange({ [key]: !object[key] });
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime || 0);
  };

  const handleScrub = (event) => {
    if (!videoRef.current) return;
    const newTime = Number(event.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkip = (amount) => {
    if (!videoRef.current) return;
    const nextTime = Math.min(Math.max(videoRef.current.currentTime + amount, 0), duration);
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden pointer-events-none bg-black/80">
      {isHtml5 ? (
        <video
          ref={videoRef}
          src={object.src}
          muted={object.muted}
          loop={object.loop}
          autoPlay={object.autoplay}
          playsInline
          poster={object.poster || undefined}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          className="h-full w-full object-cover"
        />
      ) : (
        <iframe
          title="Embedded video"
          src={embedSrc}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      )}

      <div
        className={`pointer-events-auto absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2 rounded-2xl bg-white/85 px-3 py-2 shadow transition ${
          isSelected ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {isHtml5 ? (
          <>
            <button
              type="button"
              onClick={handlePlayPause}
              className="rounded-full bg-[#1B1533] px-3 py-1 text-xs font-semibold text-white hover:opacity-90"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => handleSkip(-10)}
              className="rounded-full border border-[#CBD5F0] px-2 py-1 text-xs text-[#1E1E1E] hover:bg-[#EEF2FF]"
            >
              -10s
            </button>
            <button
              type="button"
              onClick={() => handleSkip(10)}
              className="rounded-full border border-[#CBD5F0] px-2 py-1 text-xs text-[#1E1E1E] hover:bg-[#EEF2FF]"
            >
              +10s
            </button>
            <div className="flex items-center gap-2 text-xs text-[#1E1E1E]">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.05}
                value={Math.min(currentTime, duration || 0)}
                onChange={handleScrub}
                className="w-28 accent-[#3E6DCC]"
              />
              <span>{formatTime(duration)}</span>
            </div>
          </>
        ) : (
          <span className="text-xs text-[#4B5563]">
            Embedded video controls provided by the platform.
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleProperty("muted")}
          className="rounded-full border border-[#CBD5F0] px-3 py-1 text-xs text-[#1E1E1E] hover:bg-[#EEF2FF]"
        >
          {object.muted ? "Unmute" : "Mute"}
        </button>
        <button
          type="button"
          onClick={() => toggleProperty("autoplay")}
          className="rounded-full border border-[#CBD5F0] px-3 py-1 text-xs text-[#1E1E1E] hover:bg-[#EEF2FF]"
        >
          {object.autoplay ? "Autoplay On" : "Autoplay Off"}
        </button>
        <button
          type="button"
          onClick={() => toggleProperty("loop")}
          className="rounded-full border border-[#CBD5F0] px-3 py-1 text-xs text-[#1E1E1E] hover:bg-[#EEF2FF]"
        >
          {object.loop ? "Loop On" : "Loop Off"}
        </button>
      </div>
    </div>
  );
}

