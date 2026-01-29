import { convertFileSrc } from '@tauri-apps/api/core';
import { isTauri, wsResolveImage } from './tauri-bridge';

/**
 * Classify an image value to determine how to display it
 */
export function classifyImageValue(value: string | undefined | null): 'base64' | 'url' | 'relative' | 'empty' {
  if (!value || !value.trim()) return 'empty';
  const trimmed = value.trim();
  if (trimmed.startsWith('data:') || (trimmed.length > 100 && /^[A-Za-z0-9+/=]+$/.test(trimmed))) {
    return 'base64';
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return 'url';
  }
  if (trimmed.startsWith('images/')) {
    return 'relative';
  }
  return 'url'; // fallback
}

/**
 * Resolve an image value to a displayable URL
 * - base64/data URLs: return as-is
 * - http URLs: return as-is
 * - relative paths (images/...): resolve via backend and convert to asset URL
 */
export async function resolveImageUrl(
  value: string | undefined | null,
  projectId?: string,
): Promise<string> {
  if (!value || !value.trim()) return '';

  const kind = classifyImageValue(value);

  switch (kind) {
    case 'base64':
    case 'url':
      return value;

    case 'relative':
      if (!projectId || !isTauri()) return value;
      try {
        const absolutePath = await wsResolveImage(projectId, value);
        return convertFileSrc(absolutePath);
      } catch {
        return value;
      }

    default:
      return value;
  }
}
