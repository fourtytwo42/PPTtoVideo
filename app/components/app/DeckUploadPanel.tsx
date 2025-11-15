'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surfaceStrong};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: clamp(2rem, 3vw, 2.6rem);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: ${({ theme }) => theme.shadows.soft};
  display: grid;
  gap: 1.6rem;
`;

const DropZone = styled.label<{ $dragging: boolean }>`
  border: 1px dashed rgba(255, 255, 255, 0.18);
  border-radius: ${({ theme }) => theme.radius.md};
  padding: clamp(1.8rem, 3vw, 2.4rem);
  display: grid;
  place-items: center;
  gap: 0.6rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.25s ease, background 0.25s ease;
  background: ${({ $dragging }) => ($dragging ? 'rgba(140, 92, 255, 0.12)' : 'rgba(21, 18, 42, 0.6)')};

  &:hover {
    border-color: rgba(140, 92, 255, 0.6);
  }
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
`;

const Badge = styled.span`
  background: rgba(36, 228, 206, 0.14);
  color: #8affea;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Button = styled.button`
  background: linear-gradient(135deg, rgba(140, 92, 255, 0.95), rgba(36, 228, 206, 0.95));
  border: none;
  color: #0b0416;
  font-weight: 600;
  padding: 0.75rem 1.6rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  font-size: 0.95rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Details = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: space-between;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
`;

const HiddenInput = styled.input`
  display: none;
`;

const WarningNotice = styled.div`
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid rgba(255, 196, 88, 0.45);
  background: rgba(255, 196, 88, 0.08);
  padding: 1rem;
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

interface Limits {
  maxSlides: number;
  maxFileSizeMB: number;
  defaultMode: 'REVIEW' | 'ONE_SHOT';
}

interface DeckUploadPanelProps {
  limits: Limits;
  disabled: boolean;
}

export function DeckUploadPanel({ limits, disabled }: DeckUploadPanelProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
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
        form.append('mode', limits.defaultMode);
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
    <Panel>
      <div>
        <h2 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 0.6rem', fontSize: '1.6rem' }}>Upload new decks</h2>
        <p style={{ margin: 0, color: 'rgba(213, 210, 255, 0.76)' }}>
          Drop PPTX, PDF, or Google Slides exports. We will parse slides, generate scripts, and queue narration jobs instantly.
        </p>
      </div>
      <DropZone
        $dragging={dragging}
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
      >
        <BadgeRow>
          <Badge>pptx</Badge>
          <Badge>pdf</Badge>
          <Badge>speaker notes</Badge>
          <Badge>background jobs</Badge>
        </BadgeRow>
        <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Drag files here or browse</div>
        <Button
          type="button"
          disabled={disabled || uploading}
          onClick={(event) => {
            event.preventDefault();
            inputRef.current?.click();
          }}
        >
          {disabled ? 'Generation paused' : uploading ? 'Uploading…' : 'Select files'}
        </Button>
        <HiddenInput
          type="file"
          multiple
          ref={inputRef}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </DropZone>
      {warnings.length > 0 && (
        <WarningNotice>
          <strong>Heads up:</strong>
          <WarningList>
            {warnings.map((warning, index) => (
              <li key={`upload-warning-${index}`}>{warning}</li>
            ))}
          </WarningList>
        </WarningNotice>
      )}
      <Details>
        <span>
          Soft limits: <strong>{limits.maxSlides} slides</strong> • <strong>{limits.maxFileSizeMB} MB</strong> per file
        </span>
        <span>Default mode: {limits.defaultMode === 'REVIEW' ? 'Review first' : 'One-shot automation'}</span>
      </Details>
    </Panel>
  );
}
