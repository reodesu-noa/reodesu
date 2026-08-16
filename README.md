# 給与シフト管理

シフト制で働く人向けの、給与・手取り計算＆シフト管理Webアプリです。

- Next.js (App Router) + TypeScript + Tailwind CSS + Supabase
- Supabaseのメールマジックリンクでログイン（パスワード不要）。スマホ・PCどちらからでも同じアカウントで同じデータを確認できます
- 「給与明細」「シフト表」の2タブ構成、月送りナビで表示月を切り替え
- シフトから深夜割増・社会保険料・雇用保険料・所得税（源泉徴収の概算）を自動計算し、手取り額を表示

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
   ```

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
4. Deploy を実行
5. デプロイ後のURL（例: `https://your-app.vercel.app`）を、Supabaseダッシュボードの Authentication > URL Configuration の **Site URL** / **Redirect URLs** に追加してください（マジックリンクのリダイレクト先として必要です）

## 給与計算の考え方

- 各シフトの実働時間は、終了時刻が開始時刻より前の場合は日をまたいだものとして計算します
- 22:00〜翌5:00と重なる時間を深夜時間として按分し、休憩時間を差し引きます
- 総支給額 = 基本給（実働時間×時給）＋ 深夜割増（深夜時間×時給×深夜割増率）
- 控除額（健康保険料・厚生年金保険料・雇用保険料・所得税）や各種料率は「給与明細」タブの設定パネルから編集でき、Supabaseの `settings` テーブルに保存されます
- **所得税額はあくまで概算です。** 実際の源泉徴収税額表や個々の状況によって金額は異なります。正確な金額は勤務先の給与明細や税理士等にご確認ください

## 主なディレクトリ構成

```
src/
  app/            App Routerのエントリーポイント
  components/     UIコンポーネント（ログイン、シフト表、給与明細など）
  hooks/          Supabaseとやり取りするデータフック
  lib/            認証・給与計算・日付ユーティリティなどのロジック
```
