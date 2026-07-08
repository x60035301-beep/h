import { NextResponse } from "next/server";
import { z } from "zod";

import { buildHomySystemPrompt, generateAiText, isAiEnabled } from "@/lib/ai/openrouter";
import type { Locale } from "@/types/crm";

const chatSchema = z.object({
  locale: z.enum(["zh", "en", "id"]).default("zh"),
  message: z.string().trim().min(2).max(2000)
});

export async function POST(request: Request) {
  try {
    const payload = chatSchema.parse(await request.json());

    if (isAiEnabled()) {
      try {
        const result = await generateAiText({
          messages: [
            {
              role: "system",
              content: buildHomySystemPrompt(payload.locale, buildChatLanguagePolicy(payload.locale))
            },
            {
              role: "user",
              content: payload.message
            }
          ],
          temperature: 0.35,
          maxTokens: 1500
        });

        return NextResponse.json({
          data: {
            reply: result.text,
            mode: `openrouter:${result.model}`
          }
        });
      } catch {
        return NextResponse.json({
          data: {
            reply: generateLocalReply(payload.message, payload.locale),
            mode: "rules-engine-v1"
          }
        });
      }
    }

    return NextResponse.json({
      data: {
        reply: generateLocalReply(payload.message, payload.locale),
        mode: "rules-engine-v1"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function buildChatLanguagePolicy(locale: Locale) {
  const base = [
    "For every customer-facing sales reply, WhatsApp message, quotation email, objection handling script, follow-up script, or negotiation wording, ALWAYS include a Bahasa Indonesia version.",
    "Use clear section labels. Do not provide only Chinese or only English for customer-facing copy.",
    "Keep the reply practical and ready to paste into WhatsApp or email.",
    "For internal strategy, answer in the page language, but any customer reply must include Bahasa Indonesia."
  ];

  if (locale === "zh") {
    return [
      ...base,
      'Preferred structure: "处理建议" then "中文回复" then "印尼语回复 / Bahasa Indonesia". Include English only when the user explicitly asks for English.'
    ].join("\n");
  }

  if (locale === "en") {
    return [...base, 'Preferred structure: "Recommendation" then "English reply" then "Bahasa Indonesia reply".'].join("\n");
  }

  return [...base, 'Preferred structure: "Rekomendasi" then "Balasan Bahasa Indonesia". Add Chinese or English only when useful.'].join("\n");
}

function generateLocalReply(message: string, locale: Locale) {
  const normalized = message.toLowerCase();

  if (matches(normalized, ["quotation email", "quote email", "报价邮件", "英文报价", "email penawaran"])) {
    return englishQuotationEmail();
  }

  if (matches(normalized, ["whatsapp", "wa", "印尼语", "bahasa indonesia", "balasan"])) {
    return indonesianWhatsappReply();
  }

  if (matches(normalized, ["压价", "价格", "price", "harga", "discount", "diskon", "murah"])) {
    return pricePressureReply(locale);
  }

  if (matches(normalized, ["follow", "跟进", "催", "remind", "tindak lanjut"])) {
    return followUpReply(locale);
  }

  return generalSalesReply(locale, message);
}

function matches(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function pricePressureReply(locale: Locale) {
  if (locale === "en") {
    return [
      "Recommendation:",
      "First confirm the customer's real priority, then explain HOMY's value, and finally offer two controlled options instead of reducing price immediately.",
      "English reply:",
      "I understand price is important. Before we reduce the price, may I confirm whether your priority is density, softness, delivery time, or total budget? For HOMY foam, the price includes stable density, controlled cutting tolerance, reliable packing, and consistent long-term supply. If your target price is fixed, I can offer two options: keep the same quality with a larger quantity, or adjust density/thickness to match your budget.",
      "Bahasa Indonesia reply:",
      "Saya paham harga sangat penting. Sebelum kami menurunkan harga, boleh saya konfirmasi dulu prioritas Bapak/Ibu: density, softness, waktu pengiriman, atau total budget? Harga HOMY sudah mencakup density stabil, toleransi cutting yang rapi, packing aman, dan supply jangka panjang. Jika target harga sudah tetap, kami bisa beri dua opsi: kualitas sama dengan quantity lebih besar, atau spesifikasi disesuaikan agar masuk budget."
    ].join("\n\n");
  }

  if (locale === "id") {
    return [
      "Rekomendasi:",
      "Konfirmasi dulu prioritas utama pelanggan, jelaskan value HOMY, lalu tawarkan opsi yang tetap terkontrol.",
      "Balasan Bahasa Indonesia:",
      "Saya paham harga sangat penting. Sebelum kami menurunkan harga, boleh saya konfirmasi dulu prioritas Bapak/Ibu: density, softness, waktu pengiriman, atau total budget? Harga HOMY sudah mencakup density stabil, toleransi cutting yang rapi, packing aman, dan supply jangka panjang. Jika target harga sudah tetap, kami bisa beri dua opsi: kualitas sama dengan quantity lebih besar, atau spesifikasi disesuaikan agar masuk budget."
    ].join("\n\n");
  }

  return [
    "处理建议：",
    "先确认客户真实优先级，再说明 HOMY 的价值，最后给两个可控方案，不要一开始直接降价。",
    "中文回复：",
    "我理解您现在很关注价格。为了给到真正合适的方案，我想先确认一下：您最看重的是密度、手感、交期，还是总预算？HOMY 的报价包含稳定密度、切割公差控制、包装保护和长期稳定供货。如果目标价已经固定，我们可以提供两个方案：保持同品质但增加数量，或调整密度/厚度来匹配预算。",
    "印尼语回复 / Bahasa Indonesia：",
    "Saya paham Bapak/Ibu sangat memperhatikan harga. Sebelum kami menurunkan harga, boleh saya konfirmasi dulu prioritas utama: density, softness, lead time, atau total budget? Harga HOMY sudah mencakup density yang stabil, toleransi cutting yang rapi, packing aman, dan supply jangka panjang. Jika target harga sudah tetap, kami bisa berikan dua opsi: kualitas tetap sama dengan quantity lebih besar, atau spesifikasi seperti density/ketebalan disesuaikan agar masuk budget."
  ].join("\n\n");
}

function followUpReply(locale: Locale) {
  if (locale === "en") {
    return [
      "English reply:",
      "Hi, just checking whether you had time to review the quotation and foam specification. If the direction is suitable, we can prepare samples first so you can confirm density, softness, and cutting quality before bulk order.",
      "Bahasa Indonesia reply:",
      "Halo Bapak/Ibu, saya ingin follow up apakah penawaran dan spesifikasi foam sudah sempat dicek. Jika arahnya cocok, kami bisa siapkan sampel terlebih dahulu agar Bapak/Ibu bisa konfirmasi density, softness, dan kualitas cutting sebelum order besar."
    ].join("\n\n");
  }

  if (locale === "id") {
    return [
      "Balasan Bahasa Indonesia:",
      "Halo Bapak/Ibu, saya ingin follow up apakah penawaran dan spesifikasi foam sudah sempat dicek. Jika arahnya cocok, kami bisa siapkan sampel terlebih dahulu agar Bapak/Ibu bisa konfirmasi density, softness, dan kualitas cutting sebelum order besar."
    ].join("\n\n");
  }

  return [
    "中文回复：",
    "您好，想跟进一下之前发送的报价和海绵规格是否已经看过。如果方向合适，我们可以先安排样品，让您确认密度、手感和切割质量，再推进大货订单。",
    "印尼语回复 / Bahasa Indonesia：",
    "Halo Bapak/Ibu, saya ingin follow up apakah penawaran dan spesifikasi foam yang kami kirim sebelumnya sudah sempat dicek. Jika arahnya cocok, kami bisa siapkan sampel terlebih dahulu agar Bapak/Ibu bisa konfirmasi density, softness, dan kualitas cutting sebelum order besar."
  ].join("\n\n");
}

function generalSalesReply(locale: Locale, message: string) {
  if (locale === "en") {
    return [
      `For this situation: "${message}", I suggest replying in three steps: confirm the customer's real need, connect HOMY's value to foam quality and delivery reliability, then offer one clear next action such as sample confirmation, quotation revision, or a call.`,
      "Bahasa Indonesia reply:",
      "Halo Bapak/Ibu, terima kasih atas informasinya. Agar kami bisa memberikan solusi yang tepat, boleh kami konfirmasi kebutuhan utama Anda terlebih dahulu? HOMY bisa membantu dari sisi kualitas foam, kestabilan supply, packing, dan lead time. Setelah detailnya jelas, kami bisa siapkan rekomendasi produk, sampel, atau revisi penawaran."
    ].join("\n\n");
  }

  if (locale === "id") {
    return [
      `Untuk situasi ini: "${message}", sarankan balasan 3 langkah: konfirmasi kebutuhan utama customer, hubungkan value HOMY dengan kualitas foam dan ketepatan delivery, lalu berikan next step yang jelas seperti sample, revisi penawaran, atau call singkat.`,
      "Balasan Bahasa Indonesia:",
      "Halo Bapak/Ibu, terima kasih atas informasinya. Agar kami bisa memberikan solusi yang tepat, boleh kami konfirmasi kebutuhan utama Anda terlebih dahulu? HOMY bisa membantu dari sisi kualitas foam, kestabilan supply, packing, dan lead time. Setelah detailnya jelas, kami bisa siapkan rekomendasi produk, sampel, atau revisi penawaran."
    ].join("\n\n");
  }

  return [
    `针对这个问题：“${message}”，建议按三步回复：先确认客户真实需求，再把 HOMY 的价值落到海绵质量、稳定交期和长期供应，最后给出一个明确下一步，例如确认样品、调整报价或安排通话。`,
    "印尼语回复 / Bahasa Indonesia：",
    "Halo Bapak/Ibu, terima kasih atas informasinya. Agar kami bisa memberikan solusi yang tepat, boleh kami konfirmasi kebutuhan utama Anda terlebih dahulu? HOMY bisa membantu dari sisi kualitas foam, kestabilan supply, packing, dan lead time. Setelah detailnya jelas, kami bisa siapkan rekomendasi produk, sampel, atau revisi penawaran."
  ].join("\n\n");
}

function englishQuotationEmail() {
  return [
    "English email:",
    "Subject: Quotation for HOMY Foam Products",
    "Dear Customer,",
    "Thank you for your inquiry. Based on your required foam specification, we are pleased to share our quotation for your review.",
    "The price includes stable density control, neat cutting tolerance, secure packing, and production support from our factory team. If you have a target budget or preferred delivery schedule, please let us know and we can adjust the specification or quantity accordingly.",
    "We can also prepare samples before bulk order confirmation.",
    "Best regards,",
    "HOMY Sales Team",
    "Bahasa Indonesia reply:",
    "Halo Bapak/Ibu, terima kasih atas inquiry yang diberikan. Berdasarkan spesifikasi foam yang dibutuhkan, kami sudah menyiapkan penawaran untuk Bapak/Ibu review. Harga tersebut mencakup kontrol density yang stabil, cutting yang rapi, packing aman, dan dukungan produksi dari tim pabrik HOMY. Jika ada target budget atau jadwal pengiriman tertentu, silakan informasikan agar kami bisa menyesuaikan spesifikasi atau quantity. Kami juga bisa menyiapkan sampel sebelum konfirmasi order besar."
  ].join("\n\n");
}

function indonesianWhatsappReply() {
  return [
    "Balasan Bahasa Indonesia:",
    "Halo Bapak/Ibu, terima kasih atas informasinya.",
    "Untuk kebutuhan foam tersebut, kami bisa bantu cek spesifikasi yang paling sesuai dari sisi density, ukuran, quantity, dan target budget.",
    "Jika Bapak/Ibu berkenan, mohon kirim detail ukuran, ketebalan, quantity, dan contoh foto penggunaan. Setelah itu kami akan siapkan rekomendasi produk dan estimasi harga dari HOMY."
  ].join("\n\n");
}
