/**
 * Dev helper: Force a VNPay top-up payment to Success and credit the wallet.
 *
 * Usage:
 *   yarn tsx src/scripts/force-topup-success.ts TOPUP-...   (by transactionRef)
 *   yarn tsx src/scripts/force-topup-success.ts --id <paymentObjectId>
 */

import mongoose from "mongoose";
import { env } from "@/config/env";
import { Payment, WalletTransaction } from "@/models";
import { walletService } from "@/services/wallets/wallet.service";

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const byIdIdx = args.findIndex((a) => a === "--id");
  if (byIdIdx !== -1) {
    const id = args[byIdIdx + 1];
    if (!id) throw new Error("Missing value for --id <paymentObjectId>");
    return { paymentId: id, transactionRef: null as string | null };
  }
  const transactionRef = args[0];
  if (!transactionRef) throw new Error("Missing <transactionRef> or --id <paymentObjectId>");
  return { paymentId: null as string | null, transactionRef };
}

async function main() {
  const { paymentId, transactionRef } = parseArgs(process.argv);

  await mongoose.connect(env.mongoURI);

  const payment = paymentId
    ? await Payment.findById(paymentId)
    : await Payment.findOne({ transactionRef });

  if (!payment) {
    throw new Error(`Payment not found (${paymentId ? `id=${paymentId}` : `ref=${transactionRef}`})`);
  }

  if (!payment.walletId) {
    throw new Error(`Payment ${payment._id.toString()} has no walletId`);
  }

  // Prevent double top-up: if a wallet transaction exists for this payment, don't top up again.
  const existingTxn = await WalletTransaction.findOne({
    type: "Topup",
    refType: "System",
    refId: payment._id,
    direction: "In",
  });

  if (!existingTxn) {
    await walletService.topUp(
      payment.walletId.toString(),
      payment.amount,
      payment._id.toString(),
      `Force topup success for ${payment.transactionRef}`
    );
  }

  // Mark payment as Success
  payment.status = "Success";
  payment.vnpResponseCode = payment.vnpResponseCode ?? "00";
  payment.completedAt = payment.completedAt ?? new Date();
  await payment.save();

  const wallet = await mongoose.model("Wallet").findById(payment.walletId);

  // eslint-disable-next-line no-console
  console.log("OK:");
  // eslint-disable-next-line no-console
  console.log({
    paymentId: payment._id.toString(),
    transactionRef: payment.transactionRef,
    status: payment.status,
    amount: payment.amount,
    walletId: payment.walletId.toString(),
    walletBalance: wallet?.balance,
    walletTxnCreated: !existingTxn,
  });

  await mongoose.disconnect();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});

