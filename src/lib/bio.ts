// Server-only helpers for reading and writing the editable bio.
//
// The bio is stored as a plain markdown file at data/bio.md.
// On first run data/bio.md does not exist and we fall back to data/bio.default.md,
// which ships in git as the template. Admin edits write to data/bio.md only,
// which is gitignored so deploys don't clobber runtime changes.

import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BIO_PATH = path.join(DATA_DIR, 'bio.md');
const BIO_DEFAULT_PATH = path.join(DATA_DIR, 'bio.default.md');

export async function getBio(): Promise<string> {
  try {
    return await fs.readFile(BIO_PATH, 'utf8');
  } catch {
    // Fall back to the shipped template
    try {
      return await fs.readFile(BIO_DEFAULT_PATH, 'utf8');
    } catch {
      return '';
    }
  }
}

export async function setBio(content: string): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(BIO_PATH, content, 'utf8');
}

export async function isBioCustomised(): Promise<boolean> {
  try {
    await fs.access(BIO_PATH);
    return true;
  } catch {
    return false;
  }
}
