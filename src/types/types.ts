export interface CalibrationSession {
  sessionID: string;
  timestamp: string;
  deviceModel: string;
  cameraResolution: { width: number; height: number };
  cameraFPS: number;
  screenResolution: { width: number; height: number };
  screenScale: number;
  totalTargets: number;
  distanceRanges: string[];
}

export interface CalibrationTarget {
  targetID: number;
  screenX: number;
  screenY: number;
  normalizedX: number;
  normalizedY: number;
  region: string;
  capturedFrames: number;
  usableFrames: number;
  averageLidGap: number;
  averageDistanceProxy: number;
}

export interface FrameMetadata {
  frameIndex: number;
  timestamp: number;
  screenX: number;
  screenY: number;
  normalizedX: number;
  normalizedY: number;
  lidGap: number;
  interPupilDistance: number;
  distanceProxy: number;
  poseFeatures: number[];
  usable: boolean;
  blurScore: number;
  leftEyeROI: [[number, number], [number, number]];
  rightEyeROI: [[number, number], [number, number]];
}

export interface TargetData {
  target: CalibrationTarget;
  frames: FrameMetadata[];
  leftEyeImages: string[];
  rightEyeImages: string[];
}

export interface SessionData {
  session: CalibrationSession;
  targets: Map<number, TargetData>;
}
