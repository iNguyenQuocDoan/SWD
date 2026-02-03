"use client";

import { useEffect, useMemo, useState } from "react";
import { ekycService, type EkycDocumentType, type EkycSessionResponse } from "@/lib/services/ekyc.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, UploadCloud, Loader2, RotateCcw, ShieldCheck } from "lucide-react";

const buildClientSession = () => {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "web";
  const shortUa = ua.replace(/\s+/g, " ").slice(0, 80);
  return `WEB_${shortUa}`;
};

const uuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

type DocState = {
  file: File | null;
  previewUrl: string | null;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
};

type Props = {
  onVerified?: () => void;
};

type DocMeta = { id: EkycDocumentType; title: string; subtitle: string };

const DOCS: DocMeta[] = [
  { id: "front", title: "Bước 1: CCCD/CMND mặt trước", subtitle: "Chụp rõ, không lóa." },
  { id: "back", title: "Bước 2: CCCD/CMND mặt sau", subtitle: "Chụp rõ, không lóa." },
];

const statusBadge = (status?: string) => {
  if (status === "VERIFIED") {
    return <Badge className="bg-green-600 hover:bg-green-600">Đã xác minh</Badge>;
  }
  if (status === "RETRY_REQUIRED") {
    return <Badge variant="destructive">Cần chụp lại</Badge>;
  }
  return <Badge variant="secondary">Chưa xác minh</Badge>;
};

export function EkycInline({ onVerified }: Props) {
  const [session, setSession] = useState<EkycSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // hidden fields required by VNPT
  const [token] = useState<string>(() => uuid());
  const [clientSession] = useState<string>(() => buildClientSession());
  const docType = -1;

  const [docs, setDocs] = useState<Record<EkycDocumentType, DocState>>({
    front: { file: null, previewUrl: null, uploading: false, uploaded: false },
    back: { file: null, previewUrl: null, uploading: false, uploaded: false },
    selfie: { file: null, previewUrl: null, uploading: false, uploaded: false },
  });

  const allUploaded = useMemo(() => {
    return docs.front.uploaded && docs.back.uploaded;
  }, [docs.back.uploaded, docs.front.uploaded]);

  const loadSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ekycService.getSession();
      setSession(data);
      if (data.hashes) {
        setDocs((prev) => ({
          ...prev,
          front: { ...prev.front, uploaded: !!data.hashes?.frontHash },
          back: { ...prev.back, uploaded: !!data.hashes?.backHash },
        }));
      }

      if (data.status === "VERIFIED") {
        onVerified?.();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải phiên eKYC");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      Object.values(docs).forEach((d) => {
        if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
      });
    };
  }, [docs]);

  const onPick = (type: EkycDocumentType, file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setDocs((prev) => {
      const old = prev[type];
      if (old.previewUrl) URL.revokeObjectURL(old.previewUrl);
      const previewUrl = URL.createObjectURL(file);
      return {
        ...prev,
        [type]: { ...old, file, previewUrl, error: undefined },
      };
    });
  };

  const upload = async (type: EkycDocumentType) => {
    const file = docs[type].file;
    if (!file) return;

    setDocs((prev) => ({
      ...prev,
      [type]: { ...prev[type], uploading: true, error: undefined },
    }));
    setError(null);

    try {
      await ekycService.upload(type as any, file);
      setDocs((prev) => ({
        ...prev,
        [type]: { ...prev[type], uploading: false, uploaded: true },
      }));
      await loadSession();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Tải lên thất bại";
      setError(msg);
      setDocs((prev) => ({
        ...prev,
        [type]: { ...prev[type], uploading: false, error: msg },
      }));
    }
  };

  const process = async () => {
    if (!allUploaded) return;
    setProcessing(true);
    setError(null);

    try {
      await ekycService.process({ client_session: clientSession, token, type: docType });
      await loadSession();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xử lý thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const reset = async () => {
    setError(null);
    try {
      await ekycService.resetSession();
      setDocs((prev) => ({
        ...prev,
        front: { file: null, previewUrl: null, uploading: false, uploaded: false },
        back: { file: null, previewUrl: null, uploading: false, uploaded: false },
      }));
      await loadSession();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể đặt lại eKYC");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/40">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Xác thực eKYC
            </CardTitle>
            <CardDescription>Bắt buộc trước khi tạo shop.</CardDescription>
          </div>
          {statusBadge(session?.status)}
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          {loading
            ? "Đang tải trạng thái..."
            : session?.status === "VERIFIED"
              ? "Bạn đã xác minh thành công."
              : "Vui lòng tải lên mặt trước & mặt sau, sau đó bấm Xác minh."}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {session?.status === "RETRY_REQUIRED" ? (
          <Alert>
            <AlertTitle>Cần xác minh lại</AlertTitle>
            <AlertDescription>{session.decisionReasons?.join(", ") || "Vui lòng chụp lại ảnh và thử lại."}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3">
          {DOCS.map((m) => {
            const state = docs[m.id];
            return (
              <Card key={m.id} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.subtitle}</div>
                  </div>

                  {state.uploaded ? (
                    <Badge className="bg-green-600 hover:bg-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Đã tải
                    </Badge>
                  ) : (
                    <Button size="sm" onClick={() => upload(m.id)} disabled={state.uploading || !state.file}>
                      {state.uploading ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Đang tải
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <UploadCloud className="h-3 w-3" />
                          Tải lên
                        </span>
                      )}
                    </Button>
                  )}
                </div>

                {!state.uploaded ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px] md:items-start">
                    <Input type="file" accept="image/*" onChange={(e) => onPick(m.id, e.target.files?.[0] ?? null)} />
                    {state.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={state.previewUrl} alt={`${m.id} preview`} className="h-24 w-full rounded border object-cover" />
                    ) : (
                      <div className="h-24 w-full rounded border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
                        Preview
                      </div>
                    )}
                    {state.error ? <div className="text-xs text-red-600">{state.error}</div> : null}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>

        <Separator />

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={reset} disabled={processing}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={process} disabled={!allUploaded || processing}>
            {processing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xác minh...
              </span>
            ) : (
              "Xác minh"
            )}
          </Button>
        </div>

        {session?.ocr ? (
          <Card className="p-3 bg-muted/30">
            <div className="text-sm font-medium mb-2">Thông tin OCR</div>
            <div className="text-sm grid grid-cols-1 gap-2 md:grid-cols-2">
              <div>
                <span className="font-medium">Họ tên:</span> {session.ocr.fullName ?? "-"}
              </div>
              <div>
                <span className="font-medium">Ngày sinh:</span> {session.ocr.dob ?? "-"}
              </div>
              <div>
                <span className="font-medium">Số giấy tờ:</span> {session.ocr.idNumber ?? "-"}
              </div>
              <div>
                <span className="font-medium">Ngày cấp:</span> {session.ocr.issueDate ?? "-"}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">Nơi cấp:</span> {session.ocr.issuePlace ?? "-"}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">Địa chỉ:</span> {session.ocr.address ?? "-"}
              </div>
            </div>
          </Card>
        ) : null}
      </CardContent>
    </Card>
  );
}
