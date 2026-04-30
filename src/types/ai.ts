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

export type RequesterInfo = {
  name: string;
  phone: string;
  relationship: string;
  child_name?: string | null;
  child_age?: number | null;
  police_report_number?: string | null;
};

export type SessionCreateRequest = {
  description: string;
  requester: RequesterInfo;
};

export type SessionCreateResponse = {
  session_id: string;
  status: SessionState;
  message: string;
  expires_at: string;
  parsed_clothing: ClothingQuery;
};

export type PersonDetection = {
  bbox: { x1: number; y1: number; x2: number; y2: number };
  confidence: number;
  clothing_match_score: number;
  is_child: boolean;
  track_id: number;
  thumbnail_b64: string | null;
};

export type CCTVSummary = {
  cctv_id: string;
  total_matches: number;
  child_matches: number;
  detections: PersonDetection[];
  last_updated: string;
};

export type SessionSummary = {
  session_id: string;
  state: SessionState;
  timestamp: string;
  cctv_summaries: CCTVSummary[];
  total_matches: number;
  total_child_matches: number;
  locked_cctv_id: string | null;
  locked_track_id: number | null;
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
