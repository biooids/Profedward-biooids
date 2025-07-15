"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, X, Bot, User, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGenerateSpeechMutation } from "@/lib/tts/ttsApiSlice";
import { RootState } from "@/lib/store";
import { AVAILABLE_VOICES } from "@/lib/tts/voices";
import {
  closePlayer,
  play,
  pause,
  setAudioStream,
  updateTime,
  audioEnded,
  handleError,
  changeVoice,
} from "@/lib/tts/ttsSlice";
import { Voice } from "@/lib/tts/ttsTypes";

export default function AudioPlayerBar() {
  const dispatch = useDispatch();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    isOpen,
    isPlaying,
    isLoading,
    isError,
    textToPlay,
    audioUrl,
    currentTime,
    duration,
    selectedVoiceId,
  } = useSelector((state: RootState) => state.tts);

  const [generateSpeech, { isLoading: isMutationLoading }] =
    useGenerateSpeechMutation();

  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // --- CORRECTED EFFECT #1: Fetching Audio ---
  // This effect now orchestrates the entire fetching process within the component.
  useEffect(() => {
    // We only fetch if the player is open with text, but has no audioUrl yet.
    if (isOpen && textToPlay && !audioUrl && !isMutationLoading) {
      const fetchAudio = async () => {
        try {
          // 1. Call the mutation hook to get the raw Blob data.
          //    The .unwrap() method returns the Blob on success or throws an error.
          const blob = await generateSpeech({
            text: textToPlay,
            voiceId: selectedVoiceId,
          }).unwrap();

          // 2. Create a serializable URL from the non-serializable Blob.
          //    This URL is a temporary reference managed by the browser.
          const url = URL.createObjectURL(blob);

          // 3. Dispatch the URL STRING to Redux. This is safe and serializable.
          dispatch(setAudioStream(url));
        } catch (err) {
          console.error("Failed to generate speech:", err);
          dispatch(handleError());
        }
      };

      fetchAudio();
    }
    // This dependency array ensures the effect runs only when necessary.
  }, [
    isOpen,
    textToPlay,
    audioUrl,
    selectedVoiceId,
    dispatch,
    generateSpeech,
    isMutationLoading,
  ]);

  // --- CORRECTED EFFECT #2: Managing the Audio Element ---
  // This effect handles the HTMLAudioElement lifecycle based on the audioUrl.
  useEffect(() => {
    // If we have a URL, create the audio element.
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      const setAudioData = () =>
        dispatch(
          updateTime({
            currentTime: audio.currentTime,
            duration: audio.duration,
          })
        );
      const handleTimeUpdate = () =>
        dispatch(
          updateTime({
            currentTime: audio.currentTime,
            duration: audio.duration,
          })
        );
      const handleAudioEnd = () => dispatch(audioEnded());

      audio.addEventListener("loadedmetadata", setAudioData);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleAudioEnd);

      if (isPlaying) {
        audio
          .play()
          .catch((e) => console.error("Audio autoplay was prevented:", e));
      }

      // --- CRUCIAL CLEANUP FUNCTION ---
      // This runs when the component unmounts OR when the `audioUrl` dependency changes.
      return () => {
        audio.pause();
        audio.removeEventListener("loadedmetadata", setAudioData);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleAudioEnd);

        // 4. Revoke the object URL to free up browser memory and prevent leaks.
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
    }
  }, [audioUrl, dispatch]); // Note: isPlaying is handled in a separate, more efficient effect.

  // --- EFFECT #3: Syncing Player State (Play/Pause/Speed) ---
  // This effect syncs the Redux state to the audio element properties.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((e) => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, playbackSpeed]);

  const handlePlayPause = () => {
    if (isPlaying) {
      dispatch(pause());
    } else {
      dispatch(play());
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      dispatch(updateTime({ currentTime: newTime, duration }));
    }
  };

  const handleClose = () => {
    dispatch(closePlayer());
  };

  const handleVoiceChange = (voiceId: string) => {
    // The changeVoice reducer should reset audioUrl, which will trigger
    // the cleanup of the old URL and the fetching of the new one.
    dispatch(changeVoice(voiceId));
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  // Combine loading states for a responsive UI.
  const uiIsLoading = isLoading || isMutationLoading;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/80 p-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-semibold">
            {uiIsLoading && "Generating audio..."}
            {isError && (
              <span className="text-destructive">Error generating audio.</span>
            )}
            {!uiIsLoading && !isError && textToPlay && (
              <>
                Playing{" "}
                <span className="text-muted-foreground font-normal">
                  "{textToPlay.substring(0, 40)}..."
                </span>
              </>
            )}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            className="h-12 w-12 bg-primary"
            onClick={handlePlayPause}
            disabled={uiIsLoading || isError || !duration}
          >
            {uiIsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs font-mono">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 1}
              step={0.5}
              onValueChange={handleSeek}
              disabled={uiIsLoading || isError || !duration}
            />
            <span className="text-xs font-mono">{formatTime(duration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Select
              defaultValue="1"
              onValueChange={(speed) => setPlaybackSpeed(parseFloat(speed))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedVoiceId} onValueChange={handleVoiceChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_VOICES.map((voice: Voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex items-center gap-2">
                      {voice.gender === "male" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                      {voice.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
