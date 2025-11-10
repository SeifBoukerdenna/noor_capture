import type {
  SessionData,
  CalibrationSession,
  TargetData,
  CalibrationTarget,
  FrameMetadata,
} from "./types/types";

export class CalibrationDataLoader {
  private baseUrl: string;
  private sessionDirectory: FileSystemDirectoryHandle | null = null;

  constructor(baseUrl: string = "/calibration_sessions") {
    this.baseUrl = baseUrl;
  }

  // Load from file system directory handle
  async loadFromDirectory(
    dirHandle: FileSystemDirectoryHandle
  ): Promise<SessionData> {
    this.sessionDirectory = dirHandle;

    // Load session metadata
    const sessionFile = await dirHandle.getFileHandle("session.json");
    const sessionFileData = await sessionFile.getFile();
    const sessionText = await sessionFileData.text();
    const session: CalibrationSession = JSON.parse(sessionText);

    const targets = new Map<number, TargetData>();
    return { session, targets };
  }

  // Load target from file system
  async loadTargetFromDirectory(targetId: number): Promise<TargetData> {
    if (!this.sessionDirectory) {
      throw new Error("No session directory loaded");
    }

    const targetDirName = `target_${targetId.toString().padStart(3, "0")}`;
    const targetDir = await this.sessionDirectory.getDirectoryHandle(
      targetDirName
    );

    // Load target metadata
    const targetFile = await targetDir.getFileHandle("target.json");
    const targetFileData = await targetFile.getFile();
    const targetText = await targetFileData.text();
    const target: CalibrationTarget = JSON.parse(targetText);

    // Load frame metadata
    const framesDir = await targetDir.getDirectoryHandle("frames");
    const frames: FrameMetadata[] = [];
    const leftEyeImages: string[] = [];
    const rightEyeImages: string[] = [];

    for (let i = 0; i < target.capturedFrames; i++) {
      const frameId = i.toString().padStart(2, "0");

      // Load metadata
      const metaFile = await framesDir.getFileHandle(`f${frameId}_meta.json`);
      const metaFileData = await metaFile.getFile();
      const metaText = await metaFileData.text();
      const frameMeta: FrameMetadata = JSON.parse(metaText);
      frames.push(frameMeta);

      // Load images as data URLs
      const leftFile = await framesDir.getFileHandle(`f${frameId}_left.jpg`);
      const leftBlob = await leftFile.getFile();
      const leftUrl = URL.createObjectURL(leftBlob);
      leftEyeImages.push(leftUrl);

      const rightFile = await framesDir.getFileHandle(`f${frameId}_right.jpg`);
      const rightBlob = await rightFile.getFile();
      const rightUrl = URL.createObjectURL(rightBlob);
      rightEyeImages.push(rightUrl);
    }

    return { target, frames, leftEyeImages, rightEyeImages };
  }

  // Legacy URL-based loading (for public folder)
  async loadSession(sessionId: string): Promise<SessionData> {
    const sessionUrl = `${this.baseUrl}/${sessionId}`;

    // Load session metadata
    const sessionResponse = await fetch(`${sessionUrl}/session.json`);
    const session: CalibrationSession = await sessionResponse.json();

    const targets = new Map<number, TargetData>();
    return { session, targets };
  }

  async loadTarget(sessionId: string, targetId: number): Promise<TargetData> {
    const targetUrl = `${this.baseUrl}/${sessionId}/target_${targetId
      .toString()
      .padStart(3, "0")}`;

    // Load target metadata
    const targetResponse = await fetch(`${targetUrl}/target.json`);
    const target: CalibrationTarget = await targetResponse.json();

    // Load frame metadata
    const frames: FrameMetadata[] = [];
    const leftEyeImages: string[] = [];
    const rightEyeImages: string[] = [];

    for (let i = 0; i < target.capturedFrames; i++) {
      const frameId = i.toString().padStart(2, "0");
      const metaResponse = await fetch(
        `${targetUrl}/frames/f${frameId}_meta.json`
      );
      const frameMeta: FrameMetadata = await metaResponse.json();
      frames.push(frameMeta);

      leftEyeImages.push(`${targetUrl}/frames/f${frameId}_left.jpg`);
      rightEyeImages.push(`${targetUrl}/frames/f${frameId}_right.jpg`);
    }

    return { target, frames, leftEyeImages, rightEyeImages };
  }

  isUsingFileSystem(): boolean {
    return this.sessionDirectory !== null;
  }
}

// Lazy loading helper for targets
export class TargetCache {
  private cache = new Map<string, Promise<TargetData>>();
  private loader: CalibrationDataLoader;
  private sessionId: string | null = null;

  constructor(loader: CalibrationDataLoader) {
    this.loader = loader;
  }

  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }

  get(targetId: number): Promise<TargetData> {
    const key = `${this.sessionId}_${targetId}`;

    if (!this.cache.has(key)) {
      const promise = this.loader.isUsingFileSystem()
        ? this.loader.loadTargetFromDirectory(targetId)
        : this.loader.loadTarget(this.sessionId!, targetId);

      this.cache.set(key, promise);
    }

    return this.cache.get(key)!;
  }

  clear() {
    this.cache.clear();
    this.sessionId = null;
  }
}
