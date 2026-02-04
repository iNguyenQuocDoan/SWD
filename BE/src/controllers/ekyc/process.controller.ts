import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { kycSessionService } from "@/services/ekyc/kyc-session.service";
import { ocrService } from "@/services/ekyc/ocr.service";
import { faceService } from "@/services/ekyc/face.service";
import { normalizeOcr } from "@/utils/ekyc-mappers";

export class EkycProcessController {
  process = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const session = await kycSessionService.getByUserId(userId);
    if (!session) {
      res.status(404).json({ success: false, message: "KYC session not found" });
      return;
    }

    if (!session.frontHash || !session.backHash) {
      res.status(400).json({
        success: false,
        message: "Missing required hashes (front/back). Please upload both images first.",
      });
      return;
    }

    const client_session = (req.body?.client_session ?? "") as string;
    const token = (req.body?.token ?? "") as string;
    const type = req.body?.type as any;

    if (!client_session) {
      res.status(400).json({ success: false, message: "client_session is required" });
      return;
    }

    if (!token) {
      res.status(400).json({ success: false, message: "token is required" });
      return;
    }

    // OCR front/back
    const [ocrFrontRaw, ocrBackRaw] = await Promise.all([
      ocrService.ocrFront({ img_front: session.frontHash, client_session, token, type }),
      ocrService.ocrBack({ img_back: session.backHash, client_session, token, type }),
    ]);

    // Card liveness (document) - theo docs mục 3 yêu cầu img + client_session (và thường có token ở một số bản docs)
    // Để an toàn với spec, truyền kèm token nếu VNPT chấp nhận.
    const cardLivenessRaw = await faceService.cardLiveness({
      img: session.frontHash,
      client_session,
      token,
    } as Parameters<typeof faceService.cardLiveness>[0]);

    const ocrNormalized = normalizeOcr({ ocrFrontRaw, ocrBackRaw });

    const cardLiveness = String((cardLivenessRaw as any)?.object?.liveness ?? "").toLowerCase();
    const cardOk = cardLiveness === "success";

    const status = cardOk ? "VERIFIED" : "RETRY_REQUIRED";
    const reasons = cardOk ? [] : ["CARD_LIVENESS_FAILED"];

    await (session as any).updateOne({
      $set: {
        status,
        decisionReasons: reasons,
        ...ocrNormalized,
        ocrFrontRaw,
        ocrBackRaw,
        cardLivenessRaw,
        faceLivenessRaw: null,
        faceCompareRaw: null,
        faceMatchProb: null,
        faceMatchThreshold: null,
      },
    });

    res.status(200).json({
      success: status === "VERIFIED",
      data: {
        status,
        reasons,
        ocr: ocrNormalized,
      },
    });
  };
}

export const ekycProcessController = new EkycProcessController();
