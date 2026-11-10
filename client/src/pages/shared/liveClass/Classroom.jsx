import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import logo from "../../../assets/logo.png";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Room, RoomEvent, Track, ConnectionState } from "livekit-client";
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  Phone,
  PhoneOff,
  Send,
  Copy,
  Wifi,
  WifiOff,
  LoaderCircle,
  ShieldCheck,
  CircleHelp,
  Maximize2,
  Minimize2,
  Volume2,
  SlidersHorizontal,
  X,
  Circle,
  Square,
  Film,
} from "lucide-react";

import {
  endLiveClass,
  getInstructorJoinToken,
  getLiveClassRecording,
  startLiveClassRecording,
  stopLiveClassRecording,
  syncLiveClassRecording,
} from "../../../services/instructor/liveClassService";

import "./Classroom.css";

const LIVE_CLASSES_PATH = "/instructor/live-classes";
const CHAT_TOPIC = "devad-chat";

const unwrap = (response) =>
  response?.data?.data?.data ??
  response?.data?.data ??
  response?.data ??
  response;

const unwrapRecording = (response) => {
  const data = unwrap(response);
  return data?.recording || data;
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong. Please try again.";

const getMediaError = (error, device) => {
  const labels = {
    microphone: "microphone",
    camera: "camera",
    screen: "screen sharing",
  };
  const label = labels[device] || device;

  switch (error?.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return device === "screen"
        ? "Screen sharing was cancelled or blocked by the browser."
        : `Access to your ${label} was blocked. Allow it in your browser settings.`;
    case "NotFoundError":
      return `No ${label} was found on this device.`;
    case "NotReadableError":
      return `Your ${label} is being used by another application.`;
    default:
      return `Could not toggle ${label}: ${getErrorMessage(error)}`;
  }
};

const getParticipantName = (participant) =>
  participant?.name || participant?.identity || "Participant";

const getInitials = (name = "Participant") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const formatTime = (date) =>
  new Intl.DateTimeFormat("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const formatDuration = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

const getGridClass = (count) => {
  if (count <= 1) return "c1";
  if (count === 2) return "c2";
  if (count <= 4) return "c4";
  if (count <= 6) return "c6";
  return "cmany";
};

const supportsSinkId = () =>
  typeof HTMLMediaElement !== "undefined" &&
  "setSinkId" in HTMLMediaElement.prototype;

// Generates a short two-note WAV so the speaker test needs no asset file.
const buildToneUrl = () => {
  const rate = 44100;
  const samples = Math.floor(rate * 0.8);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);

  const writeText = (offset, text) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, samples * 2, true);

  for (let i = 0; i < samples; i += 1) {
    const t = i / rate;
    const freq = i < samples / 2 ? 523.25 : 659.25;
    const envelope = Math.min(1, i / 1500, (samples - i) / 5000);
    const value = Math.sin(2 * Math.PI * freq * t) * 0.45 * envelope;
    view.setInt16(44 + i * 2, value * 32767, true);
  }

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
};

function VideoTile({
  track,
  name,
  isLocal = false,
  speaking = false,
  micOn = true,
  tag = "",
  isScreen = false,
  thumb = false,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !track) return;

    track.attach(element);

    return () => {
      track.detach(element);
    };
  }, [track]);

  return (
    <div
      className={[
        "devad-video-tile",
        thumb ? "is-thumb" : "",
        isLocal && !isScreen ? "is-local" : "",
        speaking ? "speaking" : "",
      ].join(" ")}
    >
      {track ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={isScreen ? "screen-video" : ""}
        />
      ) : (
        <div className="devad-tile-placeholder">
          <div className="devad-tile-avatar">{getInitials(name)}</div>
        </div>
      )}

      <div className="devad-video-overlay">
        <span className="devad-video-name">
          {isScreen
            ? isLocal
              ? "Your screen"
              : `${name} · Screen`
            : isLocal
              ? "You"
              : name}
        </span>

        {!isScreen && !micOn && (
          <span className="devad-tile-mic-off">
            <MicOff size={13} />
          </span>
        )}

        {tag && <span className="devad-local-tag">{tag}</span>}
      </div>
    </div>
  );
}

function AudioTrackPlayer({ track, volume }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const element = audioRef.current;
    if (!element || !track) return;

    track.attach(element);
    element.volume = volume;
    element.play?.().catch(() => {
      // Autoplay blocked; the "Enable audio" banner handles this.
    });

    return () => {
      track.detach(element);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return <audio ref={audioRef} autoPlay />;
}

function AudioRenderer({ tracks, volume }) {
  return (
    <div className="devad-audio-renderers" aria-hidden="true">
      {tracks.map((item) => (
        <AudioTrackPlayer key={item.key} track={item.track} volume={volume} />
      ))}
    </div>
  );
}

export default function Classroom({ role = "instructor" }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const roomRef = useRef(null);
  const initialStateRef = useRef(location.state);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const leavingRef = useRef(false);
  const startedAtRef = useRef(null);
  const toneUrlRef = useRef(null);
  const recordingSyncRef = useRef(false);

  const [attempt, setAttempt] = useState(0);
  const [room, setRoom] = useState(null);
  const [liveClass, setLiveClass] = useState(
    initialStateRef.current?.liveClass || null,
  );

  const [connectionState, setConnectionState] = useState(
    ConnectionState.Disconnected,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [disconnected, setDisconnected] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [pending, setPending] = useState("");

  const [tiles, setTiles] = useState([]);
  const [screenShare, setScreenShare] = useState(null);
  const [audioTracks, setAudioTracks] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const [activePanel, setActivePanel] = useState("chat");
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [endingClass, setEndingClass] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Recording state
  const [recording, setRecording] = useState(null);
  const [recordingBusy, setRecordingBusy] = useState(false);

  const recordingStatus = recording?.status || "not_started";

  const [volume, setVolume] = useState(1);
  const [micLevel, setMicLevel] = useState(0);
  const [testingSpeaker, setTestingSpeaker] = useState(false);
  const [devices, setDevices] = useState({
    audioinput: [],
    audiooutput: [],
    videoinput: [],
  });
  const [activeDevices, setActiveDevices] = useState({
    audioinput: "",
    audiooutput: "",
    videoinput: "",
  });

  const isInstructor = role === "instructor";
  const remoteCount = participants.filter((p) => !p.isLocal).length;

  const classTitle =
    liveClass?.title || liveClass?.course?.title || "DEVAD Live Classroom";

  const scheduledTime = liveClass?.scheduledAt
    ? new Date(liveClass.scheduledAt)
    : null;

  const connectionLabel = useMemo(() => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return "Connected";
      case ConnectionState.Connecting:
        return "Connecting";
      case ConnectionState.Reconnecting:
        return "Reconnecting";
      default:
        return "Disconnected";
    }
  }, [connectionState]);

  const syncRoom = useCallback((activeRoom) => {
    if (!activeRoom) return;

    const local = activeRoom.localParticipant;
    const all = [local, ...Array.from(activeRoom.remoteParticipants.values())];

    const nextParticipants = [];
    const nextTiles = [];
    const nextAudio = [];
    let nextScreen = null;

    all.forEach((participant) => {
      if (!participant) return;

      const isLocal = participant === local;
      const name = getParticipantName(participant);
      let cameraTrack = null;

      participant.trackPublications.forEach((publication) => {
        const track = publication.track;
        if (!track) return;

        if (
          publication.source === Track.Source.ScreenShare &&
          track.kind === Track.Kind.Video
        ) {
          if (!nextScreen) {
            nextScreen = { track, name, isLocal };
          }
          return;
        }

        if (
          publication.source === Track.Source.Camera &&
          track.kind === Track.Kind.Video &&
          !publication.isMuted
        ) {
          cameraTrack = track;
          return;
        }

        // Never play our own audio back to ourselves.
        if (track.kind === Track.Kind.Audio && !isLocal) {
          nextAudio.push({
            key: `${participant.identity}-${publication.trackSid}`,
            track,
          });
        }
      });

      nextParticipants.push({
        identity: participant.identity,
        name,
        isLocal,
        isSpeaking: participant.isSpeaking,
        isMicrophoneEnabled: participant.isMicrophoneEnabled,
        isCameraEnabled: participant.isCameraEnabled,
      });

      nextTiles.push({
        key: participant.identity,
        name,
        isLocal,
        isSpeaking: participant.isSpeaking,
        micOn: participant.isMicrophoneEnabled,
        track: cameraTrack,
      });
    });

    setParticipants(nextParticipants);
    setTiles(nextTiles);
    setScreenShare(nextScreen);
    setAudioTracks(nextAudio);

    setMicrophoneEnabled(local.isMicrophoneEnabled);
    setCameraEnabled(local.isCameraEnabled);
    setScreenShareEnabled(local.isScreenShareEnabled);
  }, []);

  const refreshDevices = useCallback(async () => {
    const activeRoom = roomRef.current;
    const kinds = ["audioinput", "audiooutput", "videoinput"];
    const nextDevices = {};
    const nextActive = {};

    for (const kind of kinds) {
      try {
        nextDevices[kind] = await Room.getLocalDevices(kind);
      } catch {
        nextDevices[kind] = [];
      }
      nextActive[kind] = activeRoom?.getActiveDevice?.(kind) || "";
    }

    setDevices(nextDevices);
    setActiveDevices(nextActive);
  }, []);

  // Connect / disconnect lifecycle (safe under React StrictMode).
  useEffect(() => {
    let cancelled = false;

    const isCurrent = (r) => !cancelled && roomRef.current === r;

    const buildRoom = () => {
      const r = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720, frameRate: 24 },
        },
      });

      const resync = () => {
        if (isCurrent(r)) syncRoom(r);
      };

      [
        RoomEvent.TrackSubscribed,
        RoomEvent.TrackUnsubscribed,
        RoomEvent.TrackPublished,
        RoomEvent.TrackUnpublished,
        RoomEvent.TrackMuted,
        RoomEvent.TrackUnmuted,
        RoomEvent.ParticipantConnected,
        RoomEvent.ParticipantDisconnected,
        RoomEvent.LocalTrackPublished,
        RoomEvent.LocalTrackUnpublished,
        RoomEvent.ActiveSpeakersChanged,
      ].forEach((event) => r.on(event, resync));

      r.on(RoomEvent.ConnectionStateChanged, (state) => {
        if (isCurrent(r)) setConnectionState(state);
      });

      r.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        if (isCurrent(r)) setAudioBlocked(!r.canPlaybackAudio);
      });

      r.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
        if (!isCurrent(r)) return;
        if (topic && topic !== CHAT_TOPIC) return;

        try {
          const message = JSON.parse(new TextDecoder().decode(payload));
          if (message?.type !== "chat" || !message?.text) return;

          const messageId = message.id || `${Date.now()}-${Math.random()}`;

          setMessages((current) =>
            current.some((item) => item.id === messageId)
              ? current
              : [
                  ...current,
                  {
                    id: messageId,
                    sender: message.sender || getParticipantName(participant),
                    identity: participant?.identity || "unknown",
                    text: message.text,
                    time: message.time ? new Date(message.time) : new Date(),
                    isOwn: false,
                  },
                ],
          );
        } catch {
          // Ignore malformed or unrelated packets.
        }
      });

      r.on(RoomEvent.Disconnected, () => {
        if (!isCurrent(r)) return;
        setConnectionState(ConnectionState.Disconnected);
        if (!leavingRef.current) setDisconnected(true);
      });

      return r;
    };

    const connectWith = async (creds) => {
      const r = buildRoom();
      roomRef.current = r;

      try {
        await r.connect(creds.serverUrl, creds.token);
      } catch (err) {
        try {
          await r.disconnect();
        } catch {
          // Ignore cleanup errors.
        }
        throw err;
      }

      return r;
    };

    const fetchCredentials = async () => {
      const data = unwrap(await getInstructorJoinToken(id));

      if (!data?.serverUrl || !data?.token) {
        throw new Error(
          "The classroom connection details are incomplete. Please return to Live Classes and try again.",
        );
      }

      return {
        serverUrl: data.serverUrl,
        token: data.token,
        liveClass: data.liveClass,
      };
    };

    const start = async () => {
      if (!id) {
        setError("The live class ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setNotice("");
        setDisconnected(false);
        setRoom(null);
        startedAtRef.current = null;
        leavingRef.current = false;

        const nav = attempt === 0 ? initialStateRef.current || {} : {};

        let creds =
          nav.serverUrl && nav.token
            ? {
                serverUrl: nav.serverUrl,
                token: nav.token,
                liveClass: nav.liveClass,
              }
            : null;

        let activeRoom = null;

        // Try the token from navigation first; fall back to a fresh one.
        if (creds) {
          try {
            activeRoom = await connectWith(creds);
          } catch {
            if (cancelled) return;
            creds = null;
          }
        }

        if (!activeRoom) {
          if (cancelled) return;
          creds = await fetchCredentials();
          if (cancelled) return;
          activeRoom = await connectWith(creds);
        }

        if (cancelled) {
          activeRoom.disconnect();
          return;
        }

        if (creds?.liveClass) setLiveClass(creds.liveClass);

        // Try to unlock audio playback right away (may need a click).
        try {
          await activeRoom.startAudio();
        } catch {
          // The banner / first-click unlock will handle it.
        }

        setRoom(activeRoom);
        setConnectionState(activeRoom.state);
        setAudioBlocked(!activeRoom.canPlaybackAudio);
        syncRoom(activeRoom);

        const local = activeRoom.localParticipant;

        try {
          await local.enableCameraAndMicrophone();
        } catch {
          const failed = [];

          try {
            await local.setMicrophoneEnabled(true);
          } catch {
            failed.push("microphone");
          }

          try {
            await local.setCameraEnabled(true);
          } catch {
            failed.push("camera");
          }

          if (failed.length && !cancelled) {
            setNotice(
              `Could not access your ${failed.join(" and ")}. Check browser permissions, then use the controls below.`,
            );
          }
        }

        if (!cancelled) syncRoom(activeRoom);
      } catch (err) {
        if (cancelled) return;
        roomRef.current = null;
        setRoom(null);
        setConnectionState(ConnectionState.Disconnected);
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    start();

    return () => {
      cancelled = true;
      const activeRoom = roomRef.current;
      roomRef.current = null;
      activeRoom?.disconnect();
    };
  }, [id, attempt, syncRoom]);

  // Load the existing recording state when the instructor enters the room.
  useEffect(() => {
    if (!id || !isInstructor) return;

    let cancelled = false;

    const loadRecording = async () => {
      try {
        const data = unwrapRecording(await getLiveClassRecording(id));

        if (!cancelled && data && typeof data === "object") {
          setRecording(data);
        }
      } catch {
        // A recording may not exist yet. Do not interrupt classroom entry.
      }
    };

    loadRecording();

    return () => {
      cancelled = true;
    };
  }, [id, isInstructor]);

  // Keep recording state synchronized while LiveKit Egress is active or processing.
  useEffect(() => {
    if (
      !id ||
      !isInstructor ||
      !["starting", "recording", "stopping", "processing"].includes(
        recordingStatus,
      )
    ) {
      return undefined;
    }

    let cancelled = false;

    const synchronize = async () => {
      if (recordingSyncRef.current) return;

      recordingSyncRef.current = true;

      try {
        const data = unwrapRecording(await syncLiveClassRecording(id));

        if (!cancelled && data && typeof data === "object") {
          setRecording(data);
        }
      } catch {
        // Keep the last known status and retry on the next interval.
      } finally {
        recordingSyncRef.current = false;
      }
    };

    // Sync immediately, then continue every 8 seconds.
    synchronize();

    const timer = setInterval(synchronize, 8000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [id, isInstructor, recordingStatus]);

  // Unlock audio playback on the first click anywhere on the page.
  useEffect(() => {
    if (!room) return;

    const unlock = () => {
      room
        .startAudio()
        .then(() => setAudioBlocked(false))
        .catch(() => {});
    };

    document.addEventListener("pointerdown", unlock, { once: true });
    return () => document.removeEventListener("pointerdown", unlock);
  }, [room]);

  // Load devices while the settings tab is open.
  useEffect(() => {
    if (!room || activePanel !== "settings") return;

    refreshDevices();

    const media = navigator.mediaDevices;
    media?.addEventListener?.("devicechange", refreshDevices);

    return () => media?.removeEventListener?.("devicechange", refreshDevices);
  }, [room, activePanel, refreshDevices]);

  // Live mic level, only while the settings tab is visible.
  useEffect(() => {
    if (!room || activePanel !== "settings" || !microphoneEnabled) {
      setMicLevel(0);
      return;
    }

    const timer = setInterval(() => {
      setMicLevel(room.localParticipant.audioLevel || 0);
    }, 100);

    return () => clearInterval(timer);
  }, [room, activePanel, microphoneEnabled]);

  useEffect(
    () => () => {
      if (toneUrlRef.current) URL.revokeObjectURL(toneUrlRef.current);
    },
    [],
  );

  // Session timer.
  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;

    if (!startedAtRef.current) startedAtRef.current = Date.now();

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [connectionState]);

  // Auto-dismiss notices.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Keep fullscreen state in sync (e.g. when pressing Esc).
  useEffect(() => {
    const handler = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const runControl = async (name, action) => {
    const activeRoom = roomRef.current;
    if (!activeRoom || pending) return;

    setPending(name);

    try {
      await action(activeRoom.localParticipant);
    } catch (err) {
      setNotice(getMediaError(err, name));
    } finally {
      syncRoom(activeRoom);
      setPending("");
    }
  };

  const toggleMicrophone = () =>
    runControl("microphone", (local) =>
      local.setMicrophoneEnabled(!local.isMicrophoneEnabled),
    );

  const toggleCamera = () =>
    runControl("camera", (local) =>
      local.setCameraEnabled(!local.isCameraEnabled),
    );

  const toggleScreenShare = () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setNotice(
        "Screen sharing is not supported here. Use a desktop browser over HTTPS.",
      );
      return;
    }

    runControl("screen", (local) =>
      local.setScreenShareEnabled(!local.isScreenShareEnabled, {
        audio: false,
      }),
    );
  };

  const enableAudio = async () => {
    try {
      await roomRef.current?.startAudio();
      setAudioBlocked(false);
    } catch {
      setNotice(
        "Could not enable audio. Click anywhere on the page and retry.",
      );
    }
  };

  const changeDevice = async (kind, deviceId) => {
    const activeRoom = roomRef.current;
    if (!activeRoom) return;

    try {
      await activeRoom.switchActiveDevice(kind, deviceId);
      setActiveDevices((current) => ({ ...current, [kind]: deviceId }));
    } catch (err) {
      setNotice(`Could not switch device: ${getErrorMessage(err)}`);
    }
  };

  const testSpeaker = async () => {
    if (testingSpeaker) return;

    setTestingSpeaker(true);

    try {
      if (!toneUrlRef.current) toneUrlRef.current = buildToneUrl();

      const audio = new Audio(toneUrlRef.current);
      audio.volume = Math.max(volume, 0.3);

      const sink = activeDevices.audiooutput;
      if (sink && typeof audio.setSinkId === "function") {
        await audio.setSinkId(sink).catch(() => {});
      }

      audio.onended = () => setTestingSpeaker(false);
      await audio.play();
    } catch {
      setNotice("Could not play the test sound. Check your output device.");
      setTestingSpeaker(false);
    }
  };

  // Start recording through the DEVAD backend.
  const startRecording = async () => {
    if (
      !id ||
      recordingBusy ||
      !room ||
      connectionState !== ConnectionState.Connected
    ) {
      return;
    }

    setRecordingBusy(true);

    try {
      const data = unwrapRecording(await startLiveClassRecording(id));

      if (data && typeof data === "object") {
        setRecording(data);
      }

      setNotice(
        "Recording request submitted. Your class recording is starting.",
      );
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setRecordingBusy(false);
    }
  };

  // Stop recording. The backend will finalize the video in Backblaze B2.
  const stopRecording = async () => {
    if (!id || recordingBusy) return;

    setRecordingBusy(true);

    try {
      const data = unwrapRecording(await stopLiveClassRecording(id));

      if (data && typeof data === "object") {
        setRecording(data);
      }

      setNotice(
        "Recording stop request submitted. DEVAD is processing your video.",
      );
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setRecordingBusy(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    const text = messageText.trim();
    const activeRoom = roomRef.current;

    if (!text || !activeRoom || sending) return;

    if (activeRoom.state !== ConnectionState.Connected) {
      setNotice("Connection is unstable. Wait a moment and try again.");
      return;
    }

    setSending(true);

    try {
      const message = {
        id: `${Date.now()}-${activeRoom.localParticipant.identity}`,
        type: "chat",
        sender: getParticipantName(activeRoom.localParticipant),
        text,
        time: new Date().toISOString(),
      };

      await activeRoom.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(message)),
        { reliable: true, topic: CHAT_TOPIC },
      );

      setMessages((current) => [
        ...current,
        {
          ...message,
          identity: activeRoom.localParticipant.identity,
          time: new Date(message.time),
          isOwn: true,
        },
      ]);

      setMessageText("");
    } catch (err) {
      setNotice(`Message not sent: ${getErrorMessage(err)}`);
    } finally {
      setSending(false);
      chatInputRef.current?.focus();
    }
  };

  const exitToList = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate(LIVE_CLASSES_PATH, { replace: true });
    }
  };

  const leaveClassroom = async () => {
    leavingRef.current = true;

    const activeRoom = roomRef.current;
    roomRef.current = null;

    if (activeRoom) {
      try {
        await activeRoom.disconnect();
      } catch {
        // The user is leaving regardless.
      }
    }

    setRoom(null);
    exitToList();
  };

  const confirmEndClass = async () => {
    if (!isInstructor) return;

    try {
      setEndingClass(true);
      leavingRef.current = true;

      // The backend also attempts to stop an active recording when ending
      // the class, so the recording is not abandoned when the instructor exits.
      await endLiveClass(id);

      const activeRoom = roomRef.current;
      roomRef.current = null;

      if (activeRoom) {
        try {
          await activeRoom.disconnect();
        } catch {
          // Class is already ended on the server.
        }
      }

      setRoom(null);

      navigate(LIVE_CLASSES_PATH, {
        replace: true,
        state: { message: "Live class ended successfully." },
      });
    } catch (err) {
      leavingRef.current = false;
      setNotice(
        getErrorMessage(err) || "The class could not be ended. Try again.",
      );
      setEndingClass(false);
      setShowEndConfirmation(false);
    }
  };

  const copyRoomName = async () => {
    try {
      await navigator.clipboard.writeText(
        roomRef.current?.name || liveClass?.meetingRoom?.roomName || "",
      );
      setNotice("Classroom ID copied.");
    } catch {
      setNotice("Could not copy the classroom ID.");
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setNotice("Fullscreen is not available in this browser.");
    }
  };

  const tileProps = (tile) => ({
    track: tile.track,
    name: tile.name,
    isLocal: tile.isLocal,
    speaking: tile.isSpeaking,
    micOn: tile.micOn,
    tag: tile.isLocal && isInstructor ? "INSTRUCTOR" : "",
  });

  const meterWidth = `${Math.round(Math.min(1, Math.sqrt(micLevel) * 1.4) * 100)}%`;

  const recordingInProgress = [
    "starting",
    "recording",
    "stopping",
    "processing",
  ].includes(recordingStatus);

  const recordingStatusLabel = {
    starting: "STARTING",
    recording: "REC",
    stopping: "STOPPING",
    processing: "PROCESSING",
  }[recordingStatus];

  if (loading) {
    return (
      <div className="devad-classroom-loading">
        <img className="devad-loading-logo" src={logo} alt="DEVAD" />
        <LoaderCircle className="devad-spin" size={28} />
        <h2>Preparing your classroom</h2>
        <p>Connecting securely to DEVAD Live Classroom...</p>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="devad-classroom-error">
        <div className="devad-error-icon">
          <WifiOff size={30} />
        </div>

        <h2>Unable to join classroom</h2>
        <p>{error}</p>

        <div className="devad-error-actions">
          <button
            className="devad-primary-btn"
            onClick={() => setAttempt((n) => n + 1)}
          >
            <Wifi size={17} />
            Try again
          </button>

          <button className="devad-secondary-btn" onClick={exitToList}>
            <ArrowLeft size={17} />
            Back to Live Classes
          </button>
        </div>
      </div>
    );
  }

  if (disconnected) {
    return (
      <div className="devad-classroom-error">
        <div className="devad-error-icon">
          <WifiOff size={30} />
        </div>

        <h2>You were disconnected</h2>
        <p>
          The connection to the classroom was lost, or the class has ended. You
          can try to rejoin.
        </p>

        <div className="devad-error-actions">
          <button
            className="devad-primary-btn"
            onClick={() => setAttempt((n) => n + 1)}
          >
            <Wifi size={17} />
            Rejoin
          </button>

          <button className="devad-secondary-btn" onClick={exitToList}>
            <ArrowLeft size={17} />
            Back to Live Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="devad-classroom">
      <header className="devad-classroom-header">
        <div className="devad-classroom-brand">
          <button
            className="devad-back-btn"
            onClick={leaveClassroom}
            title="Leave classroom"
          >
            <ArrowLeft size={19} />
          </button>

          <img className="devad-brand-logo" src={logo} alt="DEVAD" />

          <div className="devad-brand-copy">
            <strong>DEVAD</strong>
            <span>LIVE CLASSROOM</span>
          </div>
        </div>

        <div className="devad-header-class-info">
          <h1>{classTitle}</h1>
          <span>
            {scheduledTime
              ? `Scheduled ${formatTime(scheduledTime)}`
              : "Live learning session"}
          </span>
        </div>

        <div className="devad-header-status">
          <span className="devad-timer">{formatDuration(elapsed)}</span>

          <span className="devad-live-indicator">
            <span />
            LIVE
          </span>

          {isInstructor && liveClass?.isRecorded && recordingInProgress && (
            <span
              className={`devad-recording-indicator ${
                recordingStatus === "recording" ? "recording-active" : ""
              }`}
              title={`Recording status: ${recordingStatus}`}
            >
              <span />
              {recordingStatusLabel}
            </span>
          )}

          <span
            className={`devad-connection ${
              connectionState === ConnectionState.Connected
                ? "connected"
                : "disconnected"
            }`}
          >
            {connectionState === ConnectionState.Connected ? (
              <Wifi size={15} />
            ) : (
              <WifiOff size={15} />
            )}
            {connectionLabel}
          </span>
        </div>
      </header>

      <main className="devad-classroom-main">
        <section className="devad-stage">
          <div className="devad-stage-heading">
            <div>
              <span className="devad-eyebrow">CLASSROOM SESSION</span>
              <h2>{classTitle}</h2>
            </div>

            <button
              className="devad-icon-btn"
              onClick={toggleFullscreen}
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>

          {audioBlocked && (
            <div className="devad-notice">
              <span>Your browser is blocking classroom audio.</span>
              <button className="devad-notice-action" onClick={enableAudio}>
                <Volume2 size={14} />
                Enable audio
              </button>
            </div>
          )}

          {notice && (
            <div className="devad-notice">
              <span>{notice}</span>
              <button
                className="devad-notice-close"
                onClick={() => setNotice("")}
              >
                <X size={15} />
              </button>
            </div>
          )}

          <div className="devad-video-stage">
            {screenShare ? (
              <div className="devad-screen-layout">
                <div className="devad-screen-main">
                  <VideoTile
                    track={screenShare.track}
                    name={screenShare.name}
                    isLocal={screenShare.isLocal}
                    isScreen
                  />
                </div>

                <div className="devad-screen-strip">
                  {tiles.map((tile) => (
                    <VideoTile key={tile.key} thumb {...tileProps(tile)} />
                  ))}
                </div>
              </div>
            ) : (
              <div className={`devad-video-grid ${getGridClass(tiles.length)}`}>
                {tiles.map((tile) => (
                  <VideoTile key={tile.key} {...tileProps(tile)} />
                ))}
              </div>
            )}
          </div>

          <div className="devad-stage-footer">
            <div className="devad-participant-summary">
              <Users size={16} />
              <span>{participants.length} in classroom</span>
            </div>

            <div className="devad-room-id">
              <span>ROOM</span>
              <strong>
                {room?.name || liveClass?.meetingRoom?.roomName || "DEVAD"}
              </strong>
              <button onClick={copyRoomName} title="Copy room ID">
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* Recording playback becomes available after Egress finishes
              processing and the backend confirms the B2 object exists. */}
          {isInstructor &&
            recordingStatus === "available" &&
            recording?.url && (
              <div className="devad-recording-panel">
                <div className="devad-recording-panel-heading">
                  <div className="devad-recording-title">
                    <Film size={18} />
                    <div>
                      <strong>Class recording ready</strong>
                      <span>Your recording is ready to watch.</span>
                    </div>
                  </div>

                  <span className="devad-recording-ready">AVAILABLE</span>
                </div>

                <video
                  className="devad-recording-player"
                  controls
                  preload="metadata"
                  src={recording.url}
                >
                  Your browser does not support video playback.
                </video>

                <a
                  className="devad-recording-open"
                  href={recording.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open recording in a new tab
                </a>
              </div>
            )}

          {isInstructor && recordingStatus === "failed" && recording?.error && (
            <div className="devad-recording-error">
              <div>
                <strong>Recording failed</strong>
                <span>{recording.error}</span>
              </div>
            </div>
          )}

          <div className="devad-controls">
            <div className="devad-control-group">
              <button
                className={`devad-control-btn ${
                  microphoneEnabled ? "active" : "off"
                }`}
                onClick={toggleMicrophone}
                title={
                  microphoneEnabled
                    ? "Turn microphone off"
                    : "Turn microphone on"
                }
                disabled={!room || pending === "microphone"}
              >
                {microphoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                <span>{microphoneEnabled ? "Mute" : "Unmute"}</span>
              </button>

              <button
                className={`devad-control-btn ${
                  cameraEnabled ? "active" : "off"
                }`}
                onClick={toggleCamera}
                title={cameraEnabled ? "Turn camera off" : "Turn camera on"}
                disabled={!room || pending === "camera"}
              >
                {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                <span>{cameraEnabled ? "Camera" : "Camera off"}</span>
              </button>

              <button
                className={`devad-control-btn ${
                  screenShareEnabled ? "sharing" : ""
                }`}
                onClick={toggleScreenShare}
                title={
                  screenShareEnabled ? "Stop sharing" : "Share your screen"
                }
                disabled={!room || pending === "screen"}
              >
                {screenShareEnabled ? (
                  <MonitorOff size={20} />
                ) : (
                  <MonitorUp size={20} />
                )}
                <span>
                  {screenShareEnabled ? "Stop sharing" : "Share screen"}
                </span>
              </button>
            </div>

            {/* Instructor-only recording controls */}
            {isInstructor && liveClass?.isRecorded && (
              <>
                <div className="devad-control-divider" />

                <div className="devad-control-group devad-recording-controls">
                  {(recordingStatus === "not_started" ||
                    recordingStatus === "failed") && (
                    <button
                      className="devad-control-btn devad-record-start-btn"
                      onClick={startRecording}
                      disabled={
                        !room ||
                        recordingBusy ||
                        connectionState !== ConnectionState.Connected
                      }
                      title="Start recording this class"
                    >
                      {recordingBusy ? (
                        <LoaderCircle className="devad-spin" size={19} />
                      ) : (
                        <Circle size={19} />
                      )}
                      <span>
                        {recordingBusy ? "Starting..." : "Record class"}
                      </span>
                    </button>
                  )}

                  {recordingStatus === "recording" && (
                    <button
                      className="devad-control-btn devad-record-stop-btn"
                      onClick={stopRecording}
                      disabled={recordingBusy}
                      title="Stop class recording"
                    >
                      {recordingBusy ? (
                        <LoaderCircle className="devad-spin" size={19} />
                      ) : (
                        <Square size={18} />
                      )}
                      <span>
                        {recordingBusy ? "Stopping..." : "Stop recording"}
                      </span>
                    </button>
                  )}

                  {["starting", "stopping", "processing"].includes(
                    recordingStatus,
                  ) && (
                    <div className="devad-recording-status">
                      <LoaderCircle className="devad-spin" size={17} />
                      <span>
                        {recordingStatus === "starting"
                          ? "Starting recording..."
                          : recordingStatus === "stopping"
                            ? "Stopping recording..."
                            : "Processing recording..."}
                      </span>
                    </div>
                  )}

                  {recordingStatus === "available" && (
                    <div className="devad-recording-status recording-complete">
                      <Film size={17} />
                      <span>Recording ready</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="devad-control-divider" />

            <div className="devad-control-group">
              <button className="devad-leave-btn" onClick={leaveClassroom}>
                <Phone size={19} />
                <span>Leave</span>
              </button>

              {isInstructor && (
                <button
                  className="devad-end-btn"
                  onClick={() => setShowEndConfirmation(true)}
                  disabled={endingClass}
                >
                  <PhoneOff size={19} />
                  <span>End class</span>
                </button>
              )}
            </div>
          </div>
        </section>

        <aside className="devad-sidebar">
          <div className="devad-sidebar-tabs three-tabs">
            <button
              className={activePanel === "chat" ? "selected" : ""}
              onClick={() => setActivePanel("chat")}
            >
              <MessageSquare size={16} />
              Chat
              {messages.length > 0 && (
                <span className="devad-tab-count">{messages.length}</span>
              )}
            </button>

            <button
              className={activePanel === "people" ? "selected" : ""}
              onClick={() => setActivePanel("people")}
            >
              <Users size={16} />
              People
              <span className="devad-tab-count">{participants.length}</span>
            </button>

            <button
              className={activePanel === "settings" ? "selected" : ""}
              onClick={() => setActivePanel("settings")}
            >
              <SlidersHorizontal size={16} />
              Audio
            </button>
          </div>

          {activePanel === "chat" && (
            <div className="devad-chat-panel">
              <div className="devad-panel-heading">
                <div>
                  <h3>Class chat</h3>
                  <p>Messages are shared with everyone in this room.</p>
                </div>
              </div>

              <div className="devad-chat-messages">
                {messages.length === 0 ? (
                  <div className="devad-chat-empty">
                    <div>
                      <MessageSquare size={22} />
                    </div>
                    <strong>No messages yet</strong>
                    <p>
                      Start the conversation. Your messages will appear here.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      className={`devad-chat-message ${
                        message.isOwn ? "own-message" : ""
                      }`}
                      key={message.id}
                    >
                      <div className="devad-message-avatar">
                        {getInitials(message.sender)}
                      </div>

                      <div className="devad-message-content">
                        <div className="devad-message-meta">
                          <strong>
                            {message.isOwn ? "You" : message.sender}
                          </strong>
                          <span>{formatTime(message.time)}</span>
                        </div>
                        <p>{message.text}</p>
                      </div>
                    </div>
                  ))
                )}

                <div ref={messagesEndRef} />
              </div>

              <form className="devad-chat-form" onSubmit={sendMessage}>
                <input
                  ref={chatInputRef}
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Write a message..."
                  maxLength={2000}
                  disabled={!room}
                />

                <button
                  type="submit"
                  disabled={!messageText.trim() || !room || sending}
                  title="Send message"
                >
                  {sending ? (
                    <LoaderCircle className="devad-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
            </div>
          )}

          {activePanel === "people" && (
            <div className="devad-people-panel">
              <div className="devad-panel-heading">
                <div>
                  <h3>People</h3>
                  <p>
                    {participants.length} participant
                    {participants.length === 1 ? "" : "s"} in this room
                  </p>
                </div>
              </div>

              <div className="devad-people-list">
                {participants.map((participant) => (
                  <div className="devad-person" key={participant.identity}>
                    <div
                      className={`devad-person-avatar ${
                        participant.isSpeaking ? "speaking" : ""
                      }`}
                    >
                      {getInitials(participant.name)}
                    </div>

                    <div className="devad-person-info">
                      <strong>
                        {participant.isLocal ? "You" : participant.name}
                      </strong>
                      <span>
                        {participant.isLocal && isInstructor
                          ? "Instructor"
                          : "Participant"}
                      </span>
                    </div>

                    <div className="devad-person-status">
                      {participant.isMicrophoneEnabled ? (
                        <Mic size={15} />
                      ) : (
                        <MicOff size={15} />
                      )}

                      {participant.isCameraEnabled ? (
                        <Video size={15} />
                      ) : (
                        <VideoOff size={15} />
                      )}
                    </div>
                  </div>
                ))}

                {participants.length === 0 && (
                  <div className="devad-chat-empty">
                    <Users size={24} />
                    <strong>No participants found</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {activePanel === "settings" && (
            <div className="devad-settings-panel">
              <div className="devad-panel-heading">
                <div>
                  <h3>Audio &amp; video</h3>
                  <p>Check your devices and classroom sound.</p>
                </div>
              </div>

              <div className="devad-settings-body">
                {remoteCount === 0 && (
                  <div className="devad-hint">
                    You are the only one here. You will not hear yourself by
                    design. Join from another device to test classroom sound.
                  </div>
                )}

                <div className="devad-setting">
                  <label htmlFor="devad-mic-select">Microphone</label>
                  <select
                    id="devad-mic-select"
                    value={activeDevices.audioinput}
                    onChange={(e) => changeDevice("audioinput", e.target.value)}
                  >
                    {devices.audioinput.length === 0 && (
                      <option value="">No microphone found</option>
                    )}
                    {devices.audioinput.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || "Microphone"}
                      </option>
                    ))}
                  </select>

                  <div
                    className={`devad-meter ${microphoneEnabled ? "" : "off"}`}
                  >
                    <span style={{ width: meterWidth }} />
                  </div>
                  <small>
                    {microphoneEnabled
                      ? "Speak and the bar should move."
                      : "Your microphone is off. Unmute to test it."}
                  </small>
                </div>

                <div className="devad-setting">
                  <label htmlFor="devad-speaker-select">Speaker</label>

                  {supportsSinkId() ? (
                    <select
                      id="devad-speaker-select"
                      value={activeDevices.audiooutput}
                      onChange={(e) =>
                        changeDevice("audiooutput", e.target.value)
                      }
                    >
                      {devices.audiooutput.length === 0 && (
                        <option value="">Default speaker</option>
                      )}
                      {devices.audiooutput.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || "Speaker"}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <small>Your browser uses the system default speaker.</small>
                  )}

                  <button
                    className="devad-secondary-btn devad-test-btn"
                    onClick={testSpeaker}
                    disabled={testingSpeaker}
                  >
                    {testingSpeaker ? (
                      <LoaderCircle className="devad-spin" size={15} />
                    ) : (
                      <Volume2 size={15} />
                    )}
                    {testingSpeaker ? "Playing..." : "Play test sound"}
                  </button>
                </div>

                <div className="devad-setting">
                  <label htmlFor="devad-volume">
                    Classroom volume · {Math.round(volume * 100)}%
                  </label>
                  <input
                    id="devad-volume"
                    className="devad-range"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                  />
                </div>

                <div className="devad-setting">
                  <label htmlFor="devad-camera-select">Camera</label>
                  <select
                    id="devad-camera-select"
                    value={activeDevices.videoinput}
                    onChange={(e) => changeDevice("videoinput", e.target.value)}
                  >
                    {devices.videoinput.length === 0 && (
                      <option value="">No camera found</option>
                    )}
                    {devices.videoinput.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || "Camera"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="devad-sidebar-security">
            <ShieldCheck size={17} />
            <span>Secure DEVAD classroom session</span>
          </div>
        </aside>
      </main>

      <footer className="devad-classroom-footer">
        <span>DEVAD TECH ACADEMY</span>
        <span>Learn. Build. Innovate.</span>
        <button
          onClick={() =>
            window.open(
              "https://docs.livekit.io/",
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <CircleHelp size={14} />
          Connection help
        </button>
      </footer>

      <AudioRenderer tracks={audioTracks} volume={volume} />

      {showEndConfirmation && (
        <div
          className="devad-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !endingClass) {
              setShowEndConfirmation(false);
            }
          }}
        >
          <div className="devad-confirm-modal">
            <div className="devad-confirm-icon">
              <PhoneOff size={24} />
            </div>

            <button
              className="devad-modal-close"
              onClick={() => setShowEndConfirmation(false)}
              disabled={endingClass}
            >
              <X size={18} />
            </button>

            <h2>End this live class?</h2>

            <p>
              This will end the classroom for everyone. All connected
              participants will be disconnected. This action cannot be undone.
              {recordingStatus === "recording" &&
                " The active recording will also be stopped and processed."}
            </p>

            <div className="devad-modal-actions">
              <button
                className="devad-secondary-btn"
                onClick={() => setShowEndConfirmation(false)}
                disabled={endingClass}
              >
                Continue class
              </button>

              <button
                className="devad-end-btn"
                onClick={confirmEndClass}
                disabled={endingClass}
              >
                {endingClass ? (
                  <>
                    <LoaderCircle className="devad-spin" size={17} />
                    Ending...
                  </>
                ) : (
                  <>
                    <PhoneOff size={17} />
                    End class
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
