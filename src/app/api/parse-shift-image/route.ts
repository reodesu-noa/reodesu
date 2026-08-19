import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.5-flash";

interface ExtractedShift {
  date: string;
  start_time: string;
  end_time: string;
  break_min: number;
}

const RESPONSE_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      date: { type: "string", description: "YYYY-MM-DD形式の日付" },
      start_time: { type: "string", description: "HH:mm形式の開始時刻（24時間表記）" },
      end_time: { type: "string", description: "HH:mm形式の終了時刻（24時間表記）" },
      break_min: { type: "integer", description: "休憩時間（分）。不明なら0" },
    },
    required: ["date", "start_time", "end_time", "break_min"],
  },
};

function buildPrompt(todayStr: string): string {
  return `あなたはシフト勤務表の画像から予定を抽出するアシスタントです。
添付された画像（印刷された表、手書きのメモ、アプリのスクリーンショットなど）を解析し、写っている勤務シフトをすべて抽出してください。

ルール:
- 各シフトについて date(YYYY-MM-DD), start_time(HH:mm, 24時間表記), end_time(HH:mm, 24時間表記), break_min(分, 不明なら0) を出力する
- 今日の日付は ${todayStr} です。画像に年が書かれていない場合、この日付を基準にもっとも自然な年・月を推測してください
- 終了時刻が開始時刻より早い場合（日をまたぐ夜勤など）はそのまま出力してください（例: start_time=22:00, end_time=06:00）
- 読み取れない・自信のないシフトは無理に出力せず省略してください
- 出力は指定されたJSONスキーマの配列のみとし、説明文は含めないでください`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY が設定されていません。サーバーの環境変数を確認してください。" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "画像ファイルが見つかりません。" }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "画像サイズが大きすぎます（15MB以下にしてください）。" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const todayStr = new Date().toISOString().slice(0, 10);

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: buildPrompt(todayStr) },
              { inline_data: { mime_type: file.type || "image/jpeg", data: base64 } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    }
  );

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => "");
    return NextResponse.json(
      { error: `画像の解析に失敗しました（Gemini API: ${geminiRes.status}）`, detail: errText.slice(0, 500) },
      { status: 502 }
    );
  }

  const data = await geminiRes.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return NextResponse.json({ error: "解析結果を取得できませんでした。" }, { status: 502 });
  }

  let shifts: ExtractedShift[];
  try {
    shifts = JSON.parse(text);
    if (!Array.isArray(shifts)) throw new Error("not an array");
  } catch {
    return NextResponse.json({ error: "解析結果の形式が不正でした。" }, { status: 502 });
  }

  return NextResponse.json({ shifts });
}
