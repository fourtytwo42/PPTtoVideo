'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CardContent,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Card } from '@/app/components/ui/Card';

interface VoiceOption {
  id: string;
  name: string;
}

interface Limits {
  maxSlides: number;
  maxFileSizeMB: number;
  defaultMode: 'REVIEW' | 'ONE_SHOT';
  scriptModels: string[];
  defaultScriptModel: string;
  ttsModels: string[];
  defaultTTSModel: string;
  voices: VoiceOption[];
  defaultVoice: VoiceOption;
}

interface DeckUploadPanelProps {
  limits: Limits;
  disabled: boolean;
}

export function DeckUploadPanel({ limits, disabled }: DeckUploadPanelProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [processingMode, setProcessingMode] = useState<Limits['defaultMode']>(limits.defaultMode);
  const [scriptModel, setScriptModel] = useState(() => {
    const options = limits.scriptModels.length ? limits.scriptModels : [limits.defaultScriptModel];
    return options.includes(limits.defaultScriptModel) ? limits.defaultScriptModel : options[0];
  });
  const [ttsModel, setTtsModel] = useState(() => {
    const options = limits.ttsModels.length ? limits.ttsModels : [limits.defaultTTSModel];
    return options.includes(limits.defaultTTSModel) ? limits.defaultTTSModel : options[0];
  });
  const [voiceId, setVoiceId] = useState(() => limits.defaultVoice.id ?? limits.voices[0]?.id ?? '');
  const scriptModelOptions = limits.scriptModels.length ? limits.scriptModels : [scriptModel];
  const ttsModelOptions = limits.ttsModels.length ? limits.ttsModels : [ttsModel];
  const voiceOptions = limits.voices.length ? limits.voices : limits.defaultVoice.id ? [limits.defaultVoice] : [];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || disabled || uploading) return;
    setUploading(true);
    const aggregatedWarnings: string[] = [];
    setWarnings([]);
    try {
      for (const file of Array.from(fileList)) {
        const form = new FormData();
        form.append('file', file);
        form.append('mode', processingMode);
        form.append('model', scriptModel);
        form.append('ttsModel', ttsModel);
        if (voiceId) {
          form.append('voiceId', voiceId);
        }
        if (limits.maxFileSizeMB && limits.maxFileSizeMB > 0) {
          const sizeMb = file.size / (1024 * 1024);
          if (sizeMb > limits.maxFileSizeMB) {
            aggregatedWarnings.push(
              `${file.name} is ${sizeMb.toFixed(1)} MB which exceeds the soft limit of ${limits.maxFileSizeMB} MB. Uploading anyway.`,
            );
          }
        }
        const response = await fetch('/api/decks', {
          method: 'POST',
          body: form,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to queue ingestion job.');
        }
        if (Array.isArray(payload.warnings)) {
          aggregatedWarnings.push(...payload.warnings.map((warning: unknown) => String(warning)));
        }
      }
      router.refresh();
      if (aggregatedWarnings.length) {
        const unique = Array.from(new Set(aggregatedWarnings));
        setWarnings(unique);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        window.alert(error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent sx={{ padding: { xs: 2, sm: 2.5, md: 3 }, display: 'grid', gap: 2 }}>
        <Box>
        <Typography variant="h4" component="h2" sx={{ fontFamily: 'var(--font-serif)', mb: 0.75 }}>
          Upload new decks
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(213, 210, 255, 0.76)' }}>
          Drop PPTX, PDF, or Google Slides exports. We will parse slides, generate scripts, and queue narration jobs
          instantly.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 1.5,
        }}
      >
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Processing mode</InputLabel>
          <Select
            value={processingMode}
            onChange={(event) => setProcessingMode(event.target.value as Limits['defaultMode'])}
            disabled={disabled || uploading}
            label="Processing mode"
          >
            <MenuItem value="REVIEW">Review first</MenuItem>
            <MenuItem value="ONE_SHOT">One-shot automation</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Script model</InputLabel>
          <Select
            value={scriptModel}
            onChange={(event) => setScriptModel(event.target.value)}
            disabled={disabled || uploading}
            label="Script model"
          >
            {scriptModelOptions.map((model) => (
              <MenuItem key={model} value={model}>
                {model}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>TTS model</InputLabel>
          <Select
            value={ttsModel}
            onChange={(event) => setTtsModel(event.target.value)}
            disabled={disabled || uploading}
            label="TTS model"
          >
            {ttsModelOptions.map((model) => (
              <MenuItem key={model} value={model}>
                {model}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Voice</InputLabel>
          <Select
            value={voiceId}
            onChange={(event) => setVoiceId(event.target.value)}
            disabled={disabled || uploading || voiceOptions.length === 0}
            label="Voice"
          >
            {voiceOptions.length === 0 && <MenuItem value="">No voices available</MenuItem>}
            {voiceOptions.map((voice) => (
              <MenuItem key={voice.id} value={voice.id}>
                {voice.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        component="label"
        htmlFor="deck-upload-input"
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        sx={{
          border: '1px dashed',
          borderColor: dragging ? 'primary.main' : 'rgba(255, 255, 255, 0.18)',
          borderRadius: 2,
          padding: { xs: 2, sm: 2.5, md: 3 },
          display: 'grid',
          placeItems: 'center',
          gap: 1.5,
          textAlign: 'center',
          cursor: disabled || uploading ? 'not-allowed' : 'pointer',
          transition: 'border-color 0.25s ease, background 0.25s ease',
          background: dragging ? 'rgba(140, 92, 255, 0.12)' : 'rgba(21, 18, 42, 0.6)',
          '&:hover': {
            borderColor: disabled || uploading ? 'rgba(255, 255, 255, 0.18)' : 'rgba(140, 92, 255, 0.6)',
          },
        }}
      >
        <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="center">
          <Chip label="pptx" size="small" sx={{ backgroundColor: 'rgba(36, 228, 206, 0.14)', color: '#8affea' }} />
          <Chip label="pdf" size="small" sx={{ backgroundColor: 'rgba(36, 228, 206, 0.14)', color: '#8affea' }} />
          <Chip
            label="speaker notes"
            size="small"
            sx={{ backgroundColor: 'rgba(36, 228, 206, 0.14)', color: '#8affea' }}
          />
          <Chip
            label="background jobs"
            size="small"
            sx={{ backgroundColor: 'rgba(36, 228, 206, 0.14)', color: '#8affea' }}
          />
        </Stack>
        <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 600 }}>
          Drag files here or browse
        </Typography>
        <Button
          variant="contained"
          component="span"
          disabled={disabled || uploading}
          onClick={(event) => {
            event.preventDefault();
            inputRef.current?.click();
          }}
          startIcon={<CloudUploadIcon />}
        >
          {disabled ? 'Generation paused' : uploading ? 'Uploading…' : 'Select files'}
        </Button>
        <input
          id="deck-upload-input"
          type="file"
          multiple
          ref={inputRef}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = '';
          }}
          style={{ display: 'none' }}
        />
      </Box>

      {warnings.length > 0 && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          <AlertTitle>Heads up</AlertTitle>
          <Box component="ul" sx={{ margin: 0, paddingLeft: 2.5, display: 'grid', gap: 0.5 }}>
            {warnings.map((warning, index) => (
              <Typography key={`upload-warning-${index}`} component="li" variant="body2">
                {warning}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          justifyContent: 'space-between',
          fontSize: '0.9rem',
          color: 'text.secondary',
        }}
      >
        <Typography variant="body2" component="span">
          Soft limits: <strong>{limits.maxSlides} slides</strong> • <strong>{limits.maxFileSizeMB} MB</strong> per file
        </Typography>
        <Typography variant="body2" component="span">
          Mode: {processingMode === 'REVIEW' ? 'Review first' : 'One-shot automation'}
        </Typography>
        <Typography variant="body2" component="span">Script model: {scriptModel}</Typography>
        <Typography variant="body2" component="span">TTS model: {ttsModel}</Typography>
        <Typography variant="body2" component="span">
          Voice: {voiceOptions.find((voice) => voice.id === voiceId)?.name ?? 'Not set'}
        </Typography>
      </Box>
      </CardContent>
    </Card>
  );
}
