import fs from 'fs/promises';
import { FileSystemError } from "./error";

export async function safeUnlink(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch (e: any) {
    if (e.code === 'ENOENT') return;

    throw new FileSystemError('Failed to delete file from storage');
  }
}
