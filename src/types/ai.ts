// ── Face service ────────────────────────────────────────────────────────────

export type FaceRegisterResponse = {
  user_id: string;
  registered: boolean;
  photos_added: number;
  total_photos: number;
};

export type FaceUnregisterResponse = {
  user_id: string;
  deleted: boolean;
};

export type FaceStatusResponse = {
  user_id: string;
  registered: boolean;
  total_photos: number;
};

// ── Missing person service ───────────────────────────────────────────────────

export type SessionState = "detecting" | "tracking" | "found" | "expired";

export type ClothingQuery = {
  outer_upper_color: string | null;
  outer_upper_type: string | null;
  upper_color: string | null;
  upper_type: string | null;
  lower_color: string | null;
  lower_type: string | null;
  estimated_height_cm: number | null;
  additional_description: string | null;
};

export type SessionCreateRequest = {
  description: string;
};

export type SessionCreateResponse = {
  session_id: string;
  status: SessionState;
  message: string;
  expires_at: string;
  parsed_clothing: ClothingQuery;
  cctv_feed_url: string;
  watch_url: string;
  broadcast_url: string;
};

export type Sighting = {
  timestamp: string;
  cctv_id: string;
  location: string;
  bbox: { x1: number; y1: number; x2: number; y2: number };
  clothing_match_score: number;
};

export type PersonDetection = {
  bbox: { x1: number; y1: number; x2: number; y2: number } | null;
  confidence: number;
  clothing_match_score: number;
  is_child: boolean;
  track_id: number;
  thumbnail_b64: string | null;
  first_seen?: string;
  last_seen?: string;
  sighting_count?: number;
  sightings?: Sighting[];
};

export type CCTVSummary = {
  cctv_id: string;
  detections: PersonDetection[];
  last_updated: string;
};

export type SessionSummary = {
  session_id: string;
  state: SessionState;
  timestamp: string;
  cctv_summaries: CCTVSummary[];
  locked_cctv_id: string | null;
  locked_track_id: number | null;
  // batch 분석 진행도
  scenario_finished?: boolean;
  analysis_progress?: number;     // 0.0 ~ 1.0
  processed_frames?: number;
  total_frames?: number;
};

export type LockCandidateRequest = {
  cctv_id: string;
  track_id: number;
};

export type BroadcastMessage = {
  type: "missing_child_alert" | "missing_child_found" | "staff_request";
  session_id?: string;
  clothing?: ClothingQuery;
  clothing_summary?: string;
  description?: string;
  created_at?: string;
  found_at?: string;
  banner?: string;
  message?: string;
  last_locations?: Array<{ cctv_id: string; last_updated: string }>;
  locked_cctv_id?: string | null;
  requested_at?: string;
};

export type WatchMessage = SessionSummary;
