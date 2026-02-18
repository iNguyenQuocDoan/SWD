/**
 * Complaint Service
 * Handles complaint operations - simplified flow (Buyer -> Moderator -> Admin)
 */

import { apiClient } from "../api";
import type {
  Complaint,
  ComplaintCategory,
  ComplaintSubcategory,
  ComplaintResolution,
  ComplaintEvidence,
  ComplaintQueueItem,
  ComplaintQueueStats,
  ComplaintTimeline,
  AppealDecision,
} from "@/types";

// Request types
export interface CreateComplaintRequest {
  orderItemId: string;
  title: string;
  content: string;
  category: ComplaintCategory;
  subcategory?: ComplaintSubcategory;
  evidence?: {
    type: ComplaintEvidence["type"];
    url: string;
    description?: string;
  }[];
}

export interface AddEvidenceRequest {
  evidence: {
    type: ComplaintEvidence["type"];
    url: string;
    description?: string;
  }[];
}

export interface FileAppealRequest {
  reason: string;
  evidence?: {
    type: ComplaintEvidence["type"];
    url: string;
    description?: string;
  }[];
}

export interface RequestInfoRequest {
  targetParty: "buyer";
  questions: string[];
}

export interface MakeDecisionRequest {
  resolution: ComplaintResolution;
  reason: string;
  refundAmount?: number;
}

export interface AppealDecisionRequest {
  decision: AppealDecision;
  note?: string;
}

export interface ComplaintFilter {
  status?: string;
  category?: string;
  limit?: number;
  skip?: number;
}

export interface QueueFilter {
  status?: string;
  priority?: "high" | "normal";
  limit?: number;
  skip?: number;
}

// Response types
export interface ComplaintsResponse {
  tickets: Complaint[];
  total: number;
}

export interface QueueResponse {
  items: ComplaintQueueItem[];
  total: number;
}

export interface CanFileComplaintResponse {
  canFile: boolean;
  reason?: string;
  existingTicketId?: string;
}

class ComplaintService {
  // ===== Buyer Endpoints =====

  /**
   * Create a new complaint - goes directly to moderator queue
   * POST /api/complaints
   */
  async createComplaint(data: CreateComplaintRequest): Promise<Complaint> {
    const response = await apiClient.post<Complaint>("/complaints", data);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create complaint");
  }

  /**
   * Add evidence to complaint
   * POST /api/complaints/:id/evidence
   */
  async addEvidence(complaintId: string, data: AddEvidenceRequest): Promise<Complaint> {
    const response = await apiClient.post<Complaint>(
      `/complaints/${complaintId}/evidence`,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to add evidence");
  }

  /**
   * File an appeal (within 72 hours after decision)
   * POST /api/complaints/:id/appeal
   */
  async fileAppeal(complaintId: string, data: FileAppealRequest): Promise<Complaint> {
    const response = await apiClient.post<Complaint>(
      `/complaints/${complaintId}/appeal`,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to file appeal");
  }

  /**
   * Get my complaints (customer)
   * GET /api/complaints/me
   */
  async getMyComplaints(filter: ComplaintFilter = {}): Promise<ComplaintsResponse> {
    const params = new URLSearchParams();

    if (filter.status) params.append("status", filter.status);
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.skip) params.append("skip", filter.skip.toString());

    const queryString = params.toString();
    const url = `/complaints/me${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<Complaint[]>(url);

    if (response.success && response.data) {
      return {
        tickets: response.data,
        total: (response as unknown as { pagination?: { total: number } }).pagination?.total || response.data.length,
      };
    }

    throw new Error(response.message || "Failed to get complaints");
  }

  /**
   * Check if can file complaint for an order item
   * GET /api/complaints/check/:orderItemId
   */
  async checkCanFileComplaint(orderItemId: string): Promise<CanFileComplaintResponse> {
    const response = await apiClient.get<CanFileComplaintResponse>(
      `/complaints/check/${orderItemId}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to check complaint eligibility");
  }

  // ===== Moderator Endpoints =====

  /**
   * Get complaint queue
   * GET /api/complaints/queue
   */
  async getQueue(filter: QueueFilter = {}): Promise<QueueResponse> {
    const params = new URLSearchParams();

    if (filter.status) params.append("status", filter.status);
    if (filter.priority) params.append("priority", filter.priority);
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.skip) params.append("skip", filter.skip.toString());

    const queryString = params.toString();
    const url = `/complaints/queue${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<ComplaintQueueItem[]>(url);

    if (response.success && response.data) {
      return {
        items: response.data,
        total: (response as unknown as { pagination?: { total: number } }).pagination?.total || response.data.length,
      };
    }

    throw new Error(response.message || "Failed to get queue");
  }

  /**
   * Get queue statistics
   * GET /api/complaints/queue/stats
   */
  async getQueueStats(): Promise<ComplaintQueueStats> {
    const response = await apiClient.get<ComplaintQueueStats>("/complaints/queue/stats");

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get queue stats");
  }

  /**
   * Pick next complaint from queue
   * POST /api/complaints/queue/pick
   */
  async pickFromQueue(): Promise<ComplaintQueueItem | null> {
    const response = await apiClient.post<ComplaintQueueItem>("/complaints/queue/pick");

    if (response.success) {
      return response.data || null;
    }

    throw new Error(response.message || "Failed to pick from queue");
  }

  /**
   * Assign complaint to moderator
   * POST /api/complaints/:id/assign
   */
  async assignToModerator(
    complaintId: string,
    moderatorId?: string
  ): Promise<Complaint> {
    const response = await apiClient.post<Complaint>(
      `/complaints/${complaintId}/assign`,
      { moderatorId }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to assign complaint");
  }

  /**
   * Add internal note
   * POST /api/complaints/:id/internal-note
   */
  async addInternalNote(complaintId: string, content: string): Promise<Complaint> {
    const response = await apiClient.post<Complaint>(
      `/complaints/${complaintId}/internal-note`,
      { content }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to add internal note");
  }

  /**
   * Request more information
   * POST /api/complaints/:id/request-info
   */
  async requestMoreInfo(
    complaintId: string,
    data: RequestInfoRequest
  ): Promise<Complaint> {
    const response = await apiClient.post<Complaint>(
      `/complaints/${complaintId}/request-info`,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to request info");
  }

  /**
   * Make decision on complaint
   * POST /api/complaints/:id/decision
   */
  async makeDecision(
    complaintId: string,
    data: MakeDecisionRequest
  ): Promise<Complaint> {
    const response = await apiClient.post<Complaint>(
      `/complaints/${complaintId}/decision`,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to make decision");
  }

  /**
   * Get moderator workload
   * GET /api/complaints/moderator/workload
   */
  async getModeratorWorkload(): Promise<Record<string, unknown>[]> {
    const response = await apiClient.get<Record<string, unknown>[]>(
      "/complaints/moderator/workload"
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get workload");
  }

  // ===== Admin Endpoints =====

  /**
   * Resolve appeal (Admin/Senior Mod)
   * POST /api/complaints/:id/appeal-decision
   */
  async resolveAppeal(
    complaintId: string,
    data: AppealDecisionRequest
  ): Promise<Complaint> {
    const response = await apiClient.post<Complaint>(
      `/complaints/${complaintId}/appeal-decision`,
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to resolve appeal");
  }

  // ===== Common Endpoints =====

  /**
   * Get complaint by ID
   * GET /api/complaints/:id
   */
  async getComplaintById(complaintId: string): Promise<Complaint> {
    const response = await apiClient.get<Complaint>(`/complaints/${complaintId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get complaint");
  }

  /**
   * Get complaint timeline
   * GET /api/complaints/:id/timeline
   */
  async getComplaintTimeline(complaintId: string): Promise<ComplaintTimeline[]> {
    const response = await apiClient.get<ComplaintTimeline[]>(
      `/complaints/${complaintId}/timeline`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to get timeline");
  }

  /**
   * Get all complaints (admin/moderator)
   * GET /api/complaints
   */
  async getAllComplaints(filter: ComplaintFilter = {}): Promise<ComplaintsResponse> {
    const params = new URLSearchParams();

    if (filter.status) params.append("status", filter.status);
    if (filter.category) params.append("category", filter.category);
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.skip) params.append("skip", filter.skip.toString());

    const queryString = params.toString();
    const url = `/complaints${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<Complaint[]>(url);

    if (response.success && response.data) {
      return {
        tickets: response.data,
        total: (response as unknown as { pagination?: { total: number } }).pagination?.total || response.data.length,
      };
    }

    throw new Error(response.message || "Failed to get complaints");
  }
}

export const complaintService = new ComplaintService();
