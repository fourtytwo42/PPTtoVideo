'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { formatRelativeTime } from '@/lib/format';
import type { WorkspaceDeck } from '@/lib/decks';

const Layout = styled.div`
  display: grid;
  gap: 2rem;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
`;

const SummaryCard = styled.div`
  background: rgba(21, 18, 42, 0.7);
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 1rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: grid;
  gap: 0.3rem;
`;

const SummaryLabel = styled.span`
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(213, 210, 255, 0.76);
`;

const SummaryValue = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
`;

const SummaryNote = styled.span`
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(213, 210, 255, 0.62);
`;

const Split = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(0, 1fr);

  @media (min-width: 1080px) {
    grid-template-columns: 320px minmax(0, 1fr);
  }
`;

const Sidebar = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const SlideButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  background: ${({ $active }) => ($active ? 'rgba(140, 92, 255, 0.18)' : 'rgba(21, 18, 42, 0.6)')};
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  gap: 0.5rem;
`;

const SlideLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
`;

const SlideTitle = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

const SlideCheckbox = styled.input`
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(12, 10, 28, 0.7);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &::after {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: linear-gradient(135deg, rgba(140, 92, 255, 0.95), rgba(36, 228, 206, 0.95));
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:checked {
    border-color: rgba(140, 92, 255, 0.85);
  }

  &:checked::after {
    opacity: 1;
  }
`;

const EditorPanel = styled.div`
  display: grid;
  gap: 1rem;
  background: rgba(21, 18, 42, 0.72);
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.4rem 1.8rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 240px;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(12, 10, 28, 0.9);
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const WarningBanner = styled.div`
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid rgba(255, 196, 88, 0.45);
  background: rgba(255, 196, 88, 0.08);
  padding: 1rem 1.2rem;
  display: grid;
  gap: 0.5rem;
  color: #ffd18a;
  font-size: 0.9rem;
`;

const WarningList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.35rem;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  font-size: 0.9rem;
  color: rgba(213, 210, 255, 0.72);
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(12, 10, 28, 0.85);
  color: ${({ theme }) => theme.colors.text};
`;

const JobList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
`;

const JobItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(21, 18, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 0.55rem 0.75rem;
  font-size: 0.85rem;
  color: rgba(213, 210, 255, 0.8);
`;

const JobMeta = styled.span`
  font-size: 0.75rem;
  color: rgba(213, 210, 255, 0.6);
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'outline' }>`
  padding: 0.55rem 1.2rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: ${({ $variant }) => ($variant === 'outline' ? '1px solid rgba(255, 255, 255, 0.18)' : 'none')};
  background: ${({ $variant }) =>
    $variant === 'outline' ? 'transparent' : 'linear-gradient(135deg, rgba(140, 92, 255, 0.95), rgba(36, 228, 206, 0.95))'};
  color: ${({ $variant }) => ($variant === 'outline' ? 'rgba(213, 210, 255, 0.85)' : '#0B0416')};
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`;

const SlideMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const SlideDeleteButton = styled.button`
  border: none;
  background: transparent;
  color: rgba(255, 108, 140, 0.85);
  cursor: pointer;
  padding: 0.2rem;
  font-size: 0.95rem;

  &:hover {
    color: rgba(255, 108, 140, 1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PanelActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const BulkActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

const FinalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const SlideVisual = styled.div`
  background: rgba(5, 3, 14, 0.55);
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.5rem;
`;

const SlideImage = styled.img`
  width: 100%;
  display: block;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: rgba(9, 7, 18, 0.8);
  object-fit: contain;
`;

const MediaPreview = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 1rem;
  background: rgba(12, 10, 28, 0.65);
  display: grid;
  gap: 0.75rem;
`;

const MediaHeading = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: rgba(213, 210, 255, 0.9);
`;

const MediaBlock = styled.div`
  display: grid;
  gap: 0.35rem;
`;

const MediaLabel = styled.span`
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(213, 210, 255, 0.75);
`;

const FieldLabel = styled.span`
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(213, 210, 255, 0.68);
`;

interface VoiceOption {
  id: string;
  name: string;
}

interface DeckWorkspaceProps {
  deck: WorkspaceDeck;
  scriptModels: string[];
  ttsModels: string[];
  voices: VoiceOption[];
}

export default function DeckWorkspaceClient({
  deck: initialDeck,
  scriptModels,
  ttsModels,
  voices,
}: DeckWorkspaceProps) {
  const [deck, setDeck] = useState<WorkspaceDeck>(initialDeck);
  const [selectedSlideId, setSelectedSlideId] = useState(initialDeck.slides[0]?.id ?? '');
  const [selectedSlideIds, setSelectedSlideIds] = useState<string[]>(() =>
    initialDeck.slides[0] ? [initialDeck.slides[0].id] : [],
  );
  const [scriptDrafts, setScriptDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialDeck.slides.map((slide) => [slide.id, slide.script])),
  );
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showSyncIndicator, setShowSyncIndicator] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const [recentJobs, setRecentJobs] = useState<
    { id: string; type: string; status: string; progress: number; createdAt: string; updatedAt: string }[]
  >([]);
  const [updatingScriptModel, setUpdatingScriptModel] = useState(false);
  const [updatingTtsModel, setUpdatingTtsModel] = useState(false);
  const [updatingVoice, setUpdatingVoice] = useState(false);
  const [updatingMode, setUpdatingMode] = useState(false);
  const [generatingSlides, setGeneratingSlides] = useState<string[]>([]);
  const generatingSlidesRef = useRef<string[]>([]);
  const [clearingJobs, setClearingJobs] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const serverScriptsRef = useRef<Record<string, string>>(
    Object.fromEntries(initialDeck.slides.map((slide) => [slide.id, slide.script])),
  );
  useEffect(() => {
    generatingSlidesRef.current = generatingSlides;
  }, [generatingSlides]);
  const pollDelayRef = useRef(5000);
  const selectedSlide = deck.slides.find((slide) => slide.id === selectedSlideId) ?? deck.slides[0];

  const resolvedSelection = selectedSlideIds.length
    ? selectedSlideIds
    : selectedSlide
    ? [selectedSlide.id]
    : [];

  const selectionCount = selectedSlideIds.length || (selectedSlide ? 1 : 0);
  const overallPercent = Math.round(deck.progress.overall * 100);
  const stageDescription = deck.finalVideoPath
    ? 'Final video ready for download'
    : deck.videoReady === deck.slideCount && deck.slideCount > 0
    ? 'Slide videos ready — assemble the final cut'
    : deck.audioReady === deck.slideCount && deck.slideCount > 0
    ? 'Narration complete — render slide videos next'
    : deck.scriptsReady === deck.slideCount && deck.slideCount > 0
    ? 'Scripts approved — queue narration when ready'
    : 'Ingestion or script generation in progress';
  const scriptModelOptions = scriptModels.length
    ? scriptModels
    : deck.scriptModel
    ? [deck.scriptModel]
    : ['gpt-4o-mini'];
  const currentScriptModel = deck.scriptModel ?? scriptModelOptions[0];
  const ttsModelOptions = ttsModels.length
    ? ttsModels
    : deck.ttsModel
    ? [deck.ttsModel]
    : ['eleven_flash_v2_5'];
  const currentTtsModel = deck.ttsModel ?? ttsModelOptions[0];
  const voiceOptions = voices.length
    ? voices
    : deck.voiceId
    ? [{ id: deck.voiceId, name: deck.voiceLabel ?? deck.voiceId }]
    : [];
  const currentVoiceId = deck.voiceId ?? voiceOptions[0]?.id ?? '';

  const slideImageUrl = useMemo(() => {
    if (!selectedSlide) return null;
    return `/api/decks/${deck.id}/slides/${selectedSlide.id}/image?v=${deck.slideCount}-${selectedSlide.index}`;
  }, [deck.id, deck.slideCount, selectedSlide]);

  const slideAudioUrl = useMemo(() => {
    if (!selectedSlide || selectedSlide.audioStatus !== 'READY') {
      return null;
    }
    return `/api/decks/${deck.id}/slides/${selectedSlide.id}/audio?v=${deck.audioReady}-${selectedSlide.id}`;
  }, [deck.audioReady, deck.id, selectedSlide]);

  const slideVideoUrl = useMemo(() => {
    if (!selectedSlide || selectedSlide.videoStatus !== 'READY') {
      return null;
    }
    return `/api/decks/${deck.id}/slides/${selectedSlide.id}/video?v=${deck.videoReady}-${selectedSlide.id}`;
  }, [deck.id, deck.videoReady, selectedSlide]);

  const finalVideoUrl = useMemo(() => {
    if (!deck.finalVideoPath) {
      return null;
    }
    return `/api/decks/${deck.id}/final?v=${deck.videoReady}-${deck.progress.final.ready}`;
  }, [deck.finalVideoPath, deck.id, deck.progress.final.ready, deck.videoReady]);
  const currentScriptDraft = selectedSlide ? scriptDrafts[selectedSlide.id] ?? '' : '';
  const hasCurrentScript = currentScriptDraft.trim().length > 0;
  const selectionGenerating = resolvedSelection.some((id) => generatingSlides.includes(id));
  const generationButtonLabel =
    selectionCount > 1 ? 'Generate scripts' : hasCurrentScript ? 'Regenerate script' : 'Generate script';

  const updateScriptModel = async (nextModel: string) => {
    if (!nextModel || nextModel === deck.scriptModel) return;
    setUpdatingScriptModel(true);
    const response = await fetch(`/api/decks/${deck.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scriptModel: nextModel }),
    });
    setUpdatingScriptModel(false);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to update script model.');
      return;
    }
    setDeck((prev) => ({ ...prev, scriptModel: nextModel }));
  };

  const updateTtsModelSelection = async (nextModel: string) => {
    if (!nextModel || nextModel === deck.ttsModel) return;
    setUpdatingTtsModel(true);
    const response = await fetch(`/api/decks/${deck.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttsModel: nextModel }),
    });
    setUpdatingTtsModel(false);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to update TTS model.');
      return;
    }
    setDeck((prev) => ({ ...prev, ttsModel: nextModel }));
  };

  const updateVoiceSelection = async (nextVoiceId: string) => {
    if (!nextVoiceId || nextVoiceId === deck.voiceId) return;
    setUpdatingVoice(true);
    const response = await fetch(`/api/decks/${deck.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceId: nextVoiceId }),
    });
    setUpdatingVoice(false);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to update voice.');
      return;
    }
    const selected = voiceOptions.find((voice) => voice.id === nextVoiceId);
    setDeck((prev) => ({
      ...prev,
      voiceId: nextVoiceId,
      voiceLabel: selected?.name ?? prev.voiceLabel,
    }));
  };

  const updateProcessingMode = async (nextMode: 'REVIEW' | 'ONE_SHOT') => {
    if (!nextMode || nextMode === deck.mode) return;
    setUpdatingMode(true);
    const response = await fetch(`/api/decks/${deck.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: nextMode }),
    });
    setUpdatingMode(false);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to update processing mode.');
      return;
    }
    setDeck((prev) => ({ ...prev, mode: nextMode }));
  };

  const clearRecentJobs = async () => {
    if (!recentJobs.length) {
      window.alert('There are no jobs to clear for this deck yet.');
      return;
    }
    if (!window.confirm('Clear the job history for this deck?')) {
      return;
    }
    setClearingJobs(true);
    const response = await fetch('/api/jobs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckId: deck.id }),
    });
    setClearingJobs(false);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to clear job history for this deck.');
      return;
    }
    setRecentJobs([]);
  };

  const handleDeleteSlides = async (ids: string[]) => {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    if (!unique.length) return;
    const message =
      unique.length === 1
        ? 'Delete this slide? This removes its script, audio, and video.'
        : `Delete ${unique.length} slides? This removes their scripts, audio, and video assets.`;
    if (!window.confirm(message)) {
      return;
    }
    setDeleting(true);
    const response = await fetch(`/api/decks/${deck.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', slideIds: unique }),
    });
    setDeleting(false);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to delete slides.');
      return;
    }

    const idsSet = new Set(unique);
    let nextSlidesSnapshot: WorkspaceDeck['slides'] = deck.slides;

    setDeck((prev) => {
      const remainingSlides = prev.slides.filter((slide) => !idsSet.has(slide.id));
      nextSlidesSnapshot = remainingSlides;
      const scriptsReady = remainingSlides.filter((slide) => slide.scriptStatus === 'READY').length;
      const audioReady = remainingSlides.filter((slide) => slide.audioStatus === 'READY').length;
      const videoReady = remainingSlides.filter((slide) => slide.videoStatus === 'READY').length;
      return {
        ...prev,
        slides: remainingSlides,
        slideCount: remainingSlides.length,
        scriptsReady,
        audioReady,
        videoReady,
      };
    });

    setScriptDrafts((previous) => {
      const next = { ...previous };
      unique.forEach((id) => {
        delete next[id];
      });
      return next;
    });

    setGeneratingSlides((previous) => previous.filter((id) => !idsSet.has(id)));

    setSelectedSlideIds((previous) => {
      const filtered = previous.filter((id) => !idsSet.has(id));
      if (filtered.length) return filtered;
      if (nextSlidesSnapshot[0]) {
        return [nextSlidesSnapshot[0].id];
      }
      return [];
    });

    if (idsSet.has(selectedSlideId)) {
      setSelectedSlideId(nextSlidesSnapshot[0]?.id ?? '');
    } else if (!selectedSlideId && nextSlidesSnapshot[0]) {
      setSelectedSlideId(nextSlidesSnapshot[0].id);
    }
  };

  const describeJob = (jobType: string) =>
    jobType
      .split('_')
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(' ');

  useEffect(() => {
    if (!deck.slides.length) {
      setSelectedSlideId('');
      setSelectedSlideIds([]);
      return;
    }
    if (!deck.slides.some((slide) => slide.id === selectedSlideId)) {
      setSelectedSlideId(deck.slides[0].id);
    }
    setSelectedSlideIds((previous) => {
      const valid = previous.filter((id) => deck.slides.some((slide) => slide.id === id));
      if (valid.length > 0) {
        return valid;
      }
      const fallback = deck.slides[0]?.id;
      return fallback ? [fallback] : [];
    });
  }, [deck.slides, selectedSlideId]);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    async function refresh() {
      if (cancelled) return;
      let nextDelay = pollDelayRef.current;
      try {
        setUpdating(true);
        const response = await fetch(`/api/decks/${initialDeck.id}/status`, { cache: 'no-store' });
        if (!response.ok) {
          nextDelay = Math.min(30000, Math.round(pollDelayRef.current * 1.5));
          setPollError('Live updates paused. Retrying shortly…');
          return;
        }
        const payload = (await response.json()) as {
          deck: WorkspaceDeck;
          jobs?: { id: string; type: string; status: string; progress: number; createdAt: string; updatedAt: string }[];
        };
        if (cancelled) return;
        const incomingDeck = payload.deck;
        const nextServerScripts = Object.fromEntries(
          incomingDeck.slides.map((slide) => [slide.id, slide.script]),
        );
        setDeck(incomingDeck);
        setGeneratingSlides((previous) =>
          previous.filter((id) => {
            const match = incomingDeck.slides.find((slide) => slide.id === id);
            return match ? match.script.length === 0 : false;
          }),
        );
        if (Array.isArray(payload.jobs)) {
          setRecentJobs(payload.jobs);
        }
        setScriptDrafts((previous) => {
          const next = { ...previous };
          const generatingSet = new Set(generatingSlidesRef.current);
          for (const slide of incomingDeck.slides) {
            const lastServer = serverScriptsRef.current[slide.id];
            const previousDraft = previous[slide.id];
            const forceUpdate = generatingSet.has(slide.id);
            if (forceUpdate || lastServer === undefined || previousDraft === lastServer) {
              next[slide.id] = slide.script;
            }
          }
          serverScriptsRef.current = nextServerScripts;
          return next;
        });
        setPollError(null);
        nextDelay = 5000;
      } catch (error) {
        console.error(error);
        setPollError('We lost connection while syncing progress. Retrying shortly…');
        nextDelay = Math.min(30000, Math.round(pollDelayRef.current * 1.5));
      } finally {
        if (!cancelled) {
          pollDelayRef.current = nextDelay;
          setUpdating(false);
          timeout = setTimeout(refresh, pollDelayRef.current);
        }
      }
    }

    pollDelayRef.current = 5000;
    refresh();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [initialDeck.id]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (updating) {
      timeout = setTimeout(() => setShowSyncIndicator(true), 250);
    } else {
      setShowSyncIndicator(false);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [updating]);

  const toggleSlideSelection = (slideId: string) => {
    setSelectedSlideIds((previous) =>
      previous.includes(slideId)
        ? previous.filter((id) => id !== slideId)
        : [...previous, slideId],
    );
  };

  const handleSlideClick = (slideId: string) => {
    setSelectedSlideId(slideId);
    setSelectedSlideIds((previous) => (previous.length ? previous : [slideId]));
  };

  const handleSave = async (slideId: string) => {
    setSaving(true);
    await fetch(`/api/decks/${deck.id}/slides/${slideId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: scriptDrafts[slideId] }),
    });
    setSaving(false);
  };

  const queueScripts = async (scope: 'selected' | 'all') => {
    const slideIds = scope === 'all' ? undefined : resolvedSelection;
    const effectiveCount = slideIds?.length ?? deck.slideCount;
    if (effectiveCount === 0) {
      window.alert('No slides available to process.');
      return;
    }
    const response = await fetch(`/api/decks/${deck.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate',
        target: 'scripts',
        ...(slideIds && slideIds.length ? { slideIds } : {}),
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to queue script generation job.');
    } else {
      const trackedIds =
        scope === 'all' ? deck.slides.map((slide) => slide.id) : slideIds ?? deck.slides.map((slide) => slide.id);
      if (trackedIds.length) {
        setGeneratingSlides((previous) => Array.from(new Set([...previous, ...trackedIds])));
      }
    }
  };

  const triggerJob = async (target: 'audio' | 'video' | 'final', scope: 'selected' | 'all' = 'selected') => {
    const slideIds = target === 'final' || scope === 'all' ? undefined : resolvedSelection;
    const effectiveCount = slideIds?.length ?? deck.slideCount;
    if (effectiveCount === 0) {
      window.alert('No slides available to process.');
      return;
    }
    const response = await fetch(`/api/decks/${deck.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate',
        target,
        ...(slideIds && slideIds.length ? { slideIds } : {}),
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.error ?? 'Unable to queue job.');
    }
  };

  return (
    <Layout>
      <header style={{ display: 'grid', gap: '0.6rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: 0 }}>{deck.title}</h1>
        <p style={{ margin: 0, color: 'rgba(213, 210, 255, 0.75)' }}>
          {deck.sourceType} • Uploaded {formatRelativeTime(new Date(deck.createdAt).getTime())}
        </p>
        {showSyncIndicator && (
          <span style={{ fontSize: '0.8rem', color: 'rgba(213,210,255,0.65)' }}>Syncing latest progress…</span>
        )}
      </header>

      {pollError && (
        <WarningBanner style={{ borderColor: 'rgba(255, 111, 145, 0.45)', background: 'rgba(255, 111, 145, 0.08)' }}>
          <strong style={{ color: '#FF9BB4' }}>Live updates paused:</strong>
          <span>{pollError}</span>
        </WarningBanner>
      )}

      {deck.warnings.length > 0 && (
        <WarningBanner>
          <strong>Heads up:</strong>
          <WarningList>
            {deck.warnings.map((warning, index) => (
              <li key={`deck-warning-${index}`}>{warning}</li>
            ))}
          </WarningList>
        </WarningBanner>
      )}

      <SummaryGrid>
        <SummaryCard>
          <SummaryLabel>Processing mode</SummaryLabel>
          <Select
            value={deck.mode}
            onChange={(event) => updateProcessingMode(event.target.value as 'REVIEW' | 'ONE_SHOT')}
            disabled={updatingMode}
          >
            <option value="REVIEW">Review first</option>
            <option value="ONE_SHOT">One-shot</option>
          </Select>
          <SummaryNote>
            {updatingMode
              ? 'Updating…'
              : deck.mode === 'REVIEW'
              ? 'Manual media steps allowed'
              : 'Media jobs auto after scripts'}
          </SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Processing mode</SummaryLabel>
          <Select
            value={deck.mode}
            onChange={(event) => updateProcessingMode(event.target.value as 'REVIEW' | 'ONE_SHOT')}
            disabled={updatingMode}
          >
            <option value="REVIEW">Review first</option>
            <option value="ONE_SHOT">One-shot</option>
          </Select>
          <SummaryNote>
            {updatingMode
              ? 'Updating…'
              : deck.mode === 'REVIEW'
              ? 'Scripts only until approval'
              : 'Scripts + media allowed'}
          </SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Slides</SummaryLabel>
          <SummaryValue>{deck.slideCount}</SummaryValue>
          <SummaryNote>Total scope</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Scripts ready</SummaryLabel>
          <SummaryValue>
            {deck.scriptsReady}/{deck.slideCount}
          </SummaryValue>
          <SummaryNote>{Math.round(deck.progress.scripts.progress * 100)}% complete</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Audio ready</SummaryLabel>
          <SummaryValue>
            {deck.audioReady}/{deck.slideCount}
          </SummaryValue>
          <SummaryNote>{Math.round(deck.progress.audio.progress * 100)}% voiced</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Video ready</SummaryLabel>
          <SummaryValue>
            {deck.videoReady}/{deck.slideCount}
          </SummaryValue>
          <SummaryNote>{Math.round(deck.progress.video.progress * 100)}% rendered</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Script model</SummaryLabel>
          <Select
            value={currentScriptModel}
            onChange={(event) => updateScriptModel(event.target.value)}
            disabled={updatingScriptModel}
          >
            {scriptModelOptions.map((model) => (
              <option value={model} key={model}>
                {model}
              </option>
            ))}
          </Select>
          <SummaryNote>{updatingScriptModel ? 'Updating…' : 'Affects future generations'}</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>TTS model</SummaryLabel>
          <Select
            value={currentTtsModel}
            onChange={(event) => updateTtsModelSelection(event.target.value)}
            disabled={updatingTtsModel}
          >
            {ttsModelOptions.map((model) => (
              <option value={model} key={model}>
                {model}
              </option>
            ))}
          </Select>
          <SummaryNote>{updatingTtsModel ? 'Updating…' : 'Used for narration jobs'}</SummaryNote>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Voice</SummaryLabel>
          <Select
            value={currentVoiceId}
            onChange={(event) => updateVoiceSelection(event.target.value)}
            disabled={updatingVoice || voiceOptions.length === 0}
          >
            {voiceOptions.length === 0 && <option value="">No voices synced</option>}
            {voiceOptions.map((voice) => (
              <option value={voice.id} key={voice.id}>
                {voice.name}
              </option>
            ))}
          </Select>
          <SummaryNote>{updatingVoice ? 'Updating…' : 'Impacts future audio renders'}</SummaryNote>
        </SummaryCard>
      </SummaryGrid>
      <MetaRow>
        <span>Pipeline {overallPercent}% complete</span>
        <span>{stageDescription}</span>
        {deck.finalVideoPath && <span>Final MP4 ready</span>}
      </MetaRow>
      {recentJobs.length > 0 && (
        <section style={{ display: 'grid', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'rgba(213, 210, 255, 0.78)' }}>Recent jobs</h3>
            <ActionButton $variant="outline" onClick={clearRecentJobs} disabled={clearingJobs}>
              {clearingJobs ? 'Clearing…' : 'Clear history'}
            </ActionButton>
          </div>
          <JobList>
            {recentJobs.map((job) => (
              <JobItem key={job.id}>
                <span>{describeJob(job.type)}</span>
                <JobMeta>
                  {job.status.toLowerCase()} • {Math.round((job.progress ?? 0) * 100)}% •{' '}
                  {formatRelativeTime(new Date(job.updatedAt).getTime())}
                </JobMeta>
              </JobItem>
            ))}
          </JobList>
        </section>
      )}

      <BulkActions>
        <ActionButton
          $variant="outline"
          onClick={() => handleDeleteSlides(resolvedSelection)}
          disabled={!resolvedSelection.length || deleting}
        >
          {deleting ? 'Deleting…' : `Delete selected (${resolvedSelection.length})`}
        </ActionButton>
      </BulkActions>

      <Split>
        <Sidebar>
          {deck.slides.map((slide) => (
            <SlideButton key={slide.id} $active={slide.id === selectedSlideId} onClick={() => handleSlideClick(slide.id)}>
              <SlideLabel>
                <SlideCheckbox
                  type="checkbox"
                  checked={
                    selectedSlideIds.length
                      ? selectedSlideIds.includes(slide.id)
                      : slide.id === selectedSlideId
                  }
                  onChange={(event) => {
                    event.stopPropagation();
                    toggleSlideSelection(slide.id);
                  }}
                  aria-label={`Select slide ${slide.index}`}
                />
                <SlideTitle>
                  {slide.index}. {slide.title ?? 'Untitled slide'}
                </SlideTitle>
              </SlideLabel>
              <SlideMeta>
                <span style={{ fontSize: '0.75rem', color: 'rgba(213,210,255,0.7)' }}>{slide.scriptStatus}</span>
                <SlideDeleteButton
                  type="button"
                  aria-label={`Delete slide ${slide.index}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteSlides([slide.id]);
                  }}
                  disabled={deleting}
                >
                  🗑
                </SlideDeleteButton>
              </SlideMeta>
            </SlideButton>
          ))}
        </Sidebar>
        {selectedSlide && (
          <EditorPanel>
            <PanelActions>
              <ActionButton
                $variant="outline"
                onClick={() => handleDeleteSlides([selectedSlide.id])}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete slide'}
              </ActionButton>
            </PanelActions>
            {slideImageUrl && (
              <div style={{ display: 'grid', gap: '0.35rem' }}>
                <FieldLabel>Slide image</FieldLabel>
                <SlideVisual>
                  <SlideImage src={slideImageUrl} alt={selectedSlide.title ?? `Slide ${selectedSlide.index}`} />
                </SlideVisual>
                {selectedSlide.needsImageContext && (
                  <span style={{ fontSize: '0.8rem', color: '#FFD18A' }}>
                    AI reference includes this image due to limited captured text.
                  </span>
                )}
              </div>
            )}
            <div style={{ display: 'grid', gap: '0.35rem' }}>
              <FieldLabel>Script text</FieldLabel>
              {!hasCurrentScript && (
                <span style={{ fontSize: '0.85rem', color: 'rgba(213,210,255,0.7)' }}>
                  No narration yet. Generate with AI or start typing to draft manually.
                </span>
              )}
              <Textarea
                value={currentScriptDraft}
                onChange={(event) =>
                  setScriptDrafts((drafts) => ({
                    ...drafts,
                    [selectedSlide.id]: event.target.value,
                  }))
                }
                placeholder="Use Generate script or type your own narration..."
              />
            </div>
            <ActionRow>
              <ActionButton onClick={() => handleSave(selectedSlide.id)} disabled={saving || !hasCurrentScript}>
                {saving ? 'Saving…' : 'Save script'}
              </ActionButton>
              <ActionButton
                $variant="outline"
                onClick={() => queueScripts('selected')}
                disabled={selectionGenerating}
              >
                {selectionGenerating ? 'Generating…' : generationButtonLabel}
              </ActionButton>
              <ActionButton
                $variant="outline"
                onClick={() => triggerJob('audio', 'selected')}
              >
                Generate audio for selection
              </ActionButton>
              <ActionButton
                $variant="outline"
                onClick={() => triggerJob('video', 'selected')}
              >
                Render slide video for selection
              </ActionButton>
              <ActionButton
                $variant="outline"
                disabled={selectedSlide.audioStatus !== 'READY'}
                onClick={() =>
                  selectedSlide.audioStatus === 'READY'
                    ? window.open(`/api/decks/${deck.id}/slides/${selectedSlide.id}/audio`, '_blank')
                    : undefined
                }
              >
                Download audio
              </ActionButton>
              <ActionButton
                $variant="outline"
                disabled={selectedSlide.videoStatus !== 'READY'}
                onClick={() =>
                  selectedSlide.videoStatus === 'READY'
                    ? window.open(`/api/decks/${deck.id}/slides/${selectedSlide.id}/video`, '_blank')
                    : undefined
                }
              >
                Download slide video
              </ActionButton>
              {deck.finalVideoPath && (
                <ActionButton
                  $variant="outline"
                  onClick={() => window.open(`/api/decks/${deck.id}/final`, '_blank')}
                >
                  Download final MP4
                </ActionButton>
              )}
            </ActionRow>
            {(slideAudioUrl || slideVideoUrl) && (
              <MediaPreview>
                <MediaHeading>Slide media preview</MediaHeading>
                {slideAudioUrl && (
                  <MediaBlock>
                    <MediaLabel>Audio</MediaLabel>
                    <audio controls preload="none" src={slideAudioUrl} style={{ width: '100%' }}>
                      Your browser does not support the audio element.
                    </audio>
                  </MediaBlock>
                )}
                {slideVideoUrl && (
                  <MediaBlock>
                    <MediaLabel>Video</MediaLabel>
                    <video
                      controls
                      preload="none"
                      src={slideVideoUrl}
                      style={{ width: '100%', borderRadius: '0.5rem' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </MediaBlock>
                )}
              </MediaPreview>
            )}
          </EditorPanel>
        )}
      </Split>
      <FinalActions>
        <ActionButton
          $variant="outline"
          onClick={() => triggerJob('final')}
          disabled={!deck.finalVideoPath && deck.videoReady < deck.slideCount}
        >
          Assemble final video
        </ActionButton>
      </FinalActions>
      {finalVideoUrl && (
        <MediaPreview>
          <MediaHeading>Final video preview</MediaHeading>
          <MediaBlock>
            <MediaLabel>Combined MP4</MediaLabel>
            <video controls preload="none" src={finalVideoUrl} style={{ width: '100%', borderRadius: '0.75rem' }}>
              Your browser does not support the video tag.
            </video>
          </MediaBlock>
        </MediaPreview>
      )}
    </Layout>
  );
}
