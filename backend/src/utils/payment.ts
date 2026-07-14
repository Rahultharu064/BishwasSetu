/**
 * eSewa ePay v2 integration (HMAC-SHA256 signed form flow).
 * Docs: https://developer.esewa.com.np/pages/Epay
 * Env: ESEWA_PRODUCT_CODE (e.g. EPAYTEST), ESEWA_SECRET_KEY,
 *      ESEWA_BASE_URL (https://epay.esewa.com.np for prod,
 *      https://rc-epay.esewa.com.np for sandbox)
 */
import crypto from "node:crypto";
import type {
  GatewayInitiateResult,
  GatewayVerifyResult,
} from "../types/antiDisinterminationTypes";

const BASE_URL =
  process.env.ESEWA_BASE_URL ?? "https://rc-epay.esewa.com.np";
const PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE ?? "EPAYTEST";
const SECRET_KEY = process.env.ESEWA_SECRET_KEY ?? "";

function sign(message: string): string {
  return crypto
    .createHmac("sha256", SECRET_KEY)
    .update(message)
    .digest("base64");
}

/**
 * eSewa uses a browser form POST. We return a self-submitting redirect URL
 * served by our own endpoint, plus the transaction_uuid as the gateway ref.
 */
export function initiateEsewaPayment(params: {
  amountPaisa: number;
  transactionUuid: string; // escrowId
  successUrl: string;
  failureUrl: string;
}): GatewayInitiateResult & { formFields: Record<string, string> } {
  const totalAmount = (params.amountPaisa / 100).toFixed(2);
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const signature = sign(
    `total_amount=${totalAmount},transaction_uuid=${params.transactionUuid},product_code=${PRODUCT_CODE}`
  );

  const formFields: Record<string, string> = {
    amount: totalAmount,
    tax_amount: "0",
    total_amount: totalAmount,
    transaction_uuid: params.transactionUuid,
    product_code: PRODUCT_CODE,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: params.successUrl,
    failure_url: params.failureUrl,
    signed_field_names: signedFieldNames,
    signature,
  };

  return {
    paymentUrl: `${BASE_URL}/api/epay/main/v2/form`,
    gatewayRef: params.transactionUuid,
    formFields,
  };
}

/**
 * Verifies the base64 `data` payload eSewa appends to the success redirect,
 * then double-checks with the status API (never trust the redirect alone).
 */
export async function verifyEsewaPayment(
  base64Data: string
): Promise<GatewayVerifyResult> {
  const decoded = JSON.parse(
    Buffer.from(base64Data, "base64").toString("utf8")
  ) as {
    transaction_code: string;
    status: string;
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
    signed_field_names: string;
    signature: string;
  };

  // 1. Verify the signature on the redirect payload
  const message = decoded.signed_field_names
    .split(",")
    .map((f) => `${f}=${(decoded as Record<string, string>)[f]}`)
    .join(",");
  if (sign(message) !== decoded.signature) {
    return { verified: false };
  }

  // 2. Server-to-server status check
  const totalAmount = decoded.total_amount.replace(/,/g, "");
  const url = `${BASE_URL}/api/epay/transaction/status/?product_code=${PRODUCT_CODE}&total_amount=${totalAmount}&transaction_uuid=${decoded.transaction_uuid}`;
  const res = await fetch(url);
  if (!res.ok) return { verified: false };
  const status = (await res.json()) as { status: string; ref_id?: string };

  return {
    verified: status.status === "COMPLETE",
    gatewayTxnId: status.ref_id ?? decoded.transaction_code,
    amountPaisa: Math.round(Number.parseFloat(totalAmount) * 100),
  };
}


const BASE_URL = process.env.KHALTI_BASE_URL ?? "https://dev.khalti.com";
const SECRET_KEY = process.env.KHALTI_SECRET_KEY ?? "";

async function khaltiFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Khalti API ${path} failed (${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

export async function initiateKhaltiPayment(params: {
  amountPaisa: number;
  purchaseOrderId: string; // escrowId
  purchaseOrderName: string;
  returnUrl: string;
  customerName?: string;
  customerPhone?: string;
}): Promise<GatewayInitiateResult> {
  const data = await khaltiFetch<{ pidx: string; payment_url: string }>(
    "/api/v2/epayment/initiate/",
    {
      return_url: params.returnUrl,
      website_url: process.env.APP_BASE_URL ?? params.returnUrl,
      amount: params.amountPaisa,
      purchase_order_id: params.purchaseOrderId,
      purchase_order_name: params.purchaseOrderName,
      customer_info: {
        name: params.customerName ?? "GharSewa Customer",
        phone: params.customerPhone ?? "",
      },
    }
  );
  return { paymentUrl: data.payment_url, gatewayRef: data.pidx };
}

export async function verifyKhaltiPayment(
  pidx: string
): Promise<GatewayVerifyResult> {
  const data = await khaltiFetch<{
    status: string;
    transaction_id: string | null;
    total_amount: number;
  }>("/api/v2/epayment/lookup/", { pidx });

  return {
    verified: data.status === "Completed",
    gatewayTxnId: data.transaction_id ?? undefined,
    amountPaisa: data.total_amount,
  };
}