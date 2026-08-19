# 給与シフト管理

シフト制で働く人向けの、給与・手取り計算＆シフト管理Webアプリです。

- Next.js (App Router) + TypeScript + Tailwind CSS + Supabase
- Supabaseのメールマジックリンクでログイン（パスワード不要）。スマホ・PCどちらからでも同じアカウントで同じデータを確認できます
- 「給与明細」「シフト表」の2タブ構成、月送りナビで表示月を切り替え
- シフトから深夜割増・社会保険料・雇用保険料・所得税（源泉徴収の概算）を自動計算し、手取り額を表示
- シフト表の画像（写真・スクリーンショット）をアップロードすると、Gemini APIがシフトを読み取って一覧化。内容を確認・修正してからまとめて登録できます

## 必要なもの

- Node.js 20以上
- Supabaseプロジェクト（`shifts` / `settings` テーブルを作成し、RLSを有効化した状態）

## ローカルでの起動方法

1. 依存パッケージをインストール

   ```bash
   npm install
   ```

2. 環境変数を設定

   `.env.local.example` を `.env.local` にコピーし、SupabaseプロジェクトのURLとanon publicキーを入力します（このプロジェクトには既に値が入った `.env.local` が用意されています）。

   ```bash
   cp .env.local.example .env.local
   ```

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxx
   GEMINI_API_KEY=xxxxxxxx
   ```

   `GEMINI_API_KEY` は「画像からシフトを読み込む」機能を使う場合のみ必要です。[Google AI Studio](https://aistudio.google.com) で無料のAPIキーを取得して設定してください（未設定でもそれ以外の機能は問題なく動作します）。サーバー専用の値なので `NEXT_PUBLIC_` は付けません。

3. 開発サーバーを起動

   ```bash
   npm run dev
   ```

   [http://localhost:3000](http://localhost:3000) を開きます。メールアドレスを入力してログインリンクを送信し、届いたメールのリンクを開くとログインできます。

   > Supabaseの組み込みメール送信には送信数の制限があります（デフォルトで1時間あたり数通程度）。本番運用では Supabase ダッシュボードの Authentication > Email から独自のSMTPを設定することをおすすめします。

## ビルド

```bash
npm run build
```

## Vercelへのデプロイ手順

1. このリポジトリをGitHubなどにpushします
2. [Vercel](https://vercel.com) で「Add New Project」からリポジトリをインポート
3. Environment Variables に以下を設定
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`（画像読み取り機能を使う場合）
4. Deploy を実行
5. デプロイ後のURL（例: `https://your-app.vercel.app`）を、Supabaseダッシュボードの Authentication > URL Configuration の **Site URL** / **Redirect URLs** に追加してください（マジックリンクのリダイレクト先として必要です）

## 給与計算の考え方

- 各シフトの実働時間は、終了時刻が開始時刻より前の場合は日をまたいだものとして計算します
- 22:00〜翌5:00と重なる時間を深夜時間として按分し、休憩時間を差し引きます
- 総支給額 = 基本給（実働時間×時給）＋ 深夜割増（深夜時間×時給×深夜割増率）
- 控除額（健康保険料・厚生年金保険料・雇用保険料・所得税）や各種料率は「給与明細」タブの設定パネルから編集でき、Supabaseの `settings` テーブルに保存されます
- **所得税額はあくまで概算です。** 実際の源泉徴収税額表や個々の状況によって金額は異なります。正確な金額は勤務先の給与明細や税理士等にご確認ください

## 画像からのシフト読み取りについて

「シフト表」タブの「📷 画像から読み込む」から、勤務表の写真やスクリーンショットをアップロードすると、Gemini API（`gemini-2.5-flash`）が画像を解析し、日付・開始時刻・終了時刻・休憩時間を抽出します。抽出結果は画面上でチェックボックス付きの一覧として表示され、内容を修正したり不要な行を削除したりしてから「まとめて追加」できます（自動でシフトが登録されることはありません）。

- 手書きや複雑なレイアウトでは読み取り精度が落ちる場合があります。抽出結果は必ず確認してください
- 画像に年が書かれていない場合は、現在の日付を基準に推測されます
- `GEMINI_API_KEY` が未設定の場合、このボタンを押すとエラーメッセージが表示されます（他の機能には影響しません）

## 主なディレクトリ構成

```
src/
  app/            App Routerのエントリーポイント（api/parse-shift-image が画像解析のRoute Handler）
  components/     UIコンポーネント（ログイン、シフト表、給与明細など）
  hooks/          Supabaseとやり取りするデータフック
  lib/            認証・給与計算・日付ユーティリティなどのロジック
```
