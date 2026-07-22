import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";

// Local filesystem storage under /uploads/{clientId}/{uuid}.{ext}. Swapping
// to S3 later only means rewriting these four functions — callers only ever
// deal with the opaque `fileName` key stored in ClientDocument.

const UPLOADS_ROOT = join(process.cwd(), "uploads");

function clientDir(clientId: string) {
  return join(UPLOADS_ROOT, clientId);
}

export async function saveClientDocument(clientId: string, file: File) {
  const dir = clientDir(clientId);
  await mkdir(dir, { recursive: true });

  const fileName = `${randomUUID()}${extname(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, fileName), buffer);

  return {
    fileName,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: buffer.byteLength,
  };
}

export async function readClientDocument(clientId: string, fileName: string) {
  return readFile(join(clientDir(clientId), fileName));
}

export async function deleteClientDocument(
  clientId: string,
  fileName: string
) {
  await unlink(join(clientDir(clientId), fileName)).catch(() => {});
}
