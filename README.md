# Bouyomichan Connector

棒読みちゃんコネクター（Bouyomichan Connector）は、Foundry VTT(ver 9 ～ 12)と棒読みちゃんを連携させるための Mod です。この Mod 単体では動作せず、下記のツールのインストール（ダウンロード）や登録が必要になりますので、ご注意ください。（自分を含めた）全員のチャットに打ち込んで送信した文章が、自分の棒読みちゃんから音声として出力されます。また、アクターおよびユーザーごとに読み上げさせる声を予め設定しておくこともできます。
　<br>
　<br>
　<br>

## 注意

- この MOD によって生じた**いかなる損害や損失に対して、この MOD の作成者は一切の責任と義務を負っていない**ことにご注意ください
- チャットを利用した他の MOD と干渉する場合があるので、ご注意ください
- 合成音声の著作権等の権利を侵害しないように使用してください
- バグが残っている可能性があります。もしバグを発見された場合には、ご一報くださいますとありがたいです
- この MOD を使用した TRPG プレイ動画等を投稿される場合は、この MOD と FoundryVTT の紹介をしていただけますと、大変うれしく思います（ご協力お願いいたします）
- FireFox ブラウザは(CORS 関係の設定が他ブラウザと違うらしく)棒読みちゃんとリンクできないので、非対応です
  　<br>
  　<br>
  　<br>

## 使用方法

<br>
　<br>

### 基本

1. この MOD をインストールする - 下記のリンクを FoundryVTT 起動画面の「アドオン・モジュール」⇒「モジュールインストール」⇒「URL を指定：」⇒「インストール」からインストールしてください<br>
   　<br>
   [https://github.com/AdmiralNyar/Bouyomichan-Connector/raw/main/module.json](https://github.com/AdmiralNyar/Bouyomichan-Connector/raw/main/module.json)
   　<br>
   　<br>
   ![インストール画面](https://user-images.githubusercontent.com/52102146/168619751-32db6c64-607d-475b-b99e-dd3742ba6379.png)
   　<br>
   　<br>
2. 各ワールドのモジュールの管理より、「Bouyomichan Connector」を有効化してください
   ![MOD有効化](https://user-images.githubusercontent.com/52102146/168620053-9fc089df-1d89-437d-878a-17ef31d80004.png)
   　<br>
   　<br>
3. MOD を有効化したワールドの画面左側の ♫ マーク内に吹き出しマークのボタンが追加されますので、有効化（紫色が明るくなった状態）してください - シーンが 1 つ以上存在しないワールドでは左側のボタンは全て無効化されてますので、本当に初期のワールドはまずシーンを何でもいいので作成してください
   ![読み上げ切り替えスイッチオン](https://user-images.githubusercontent.com/52102146/168620153-2571deef-54fb-436c-9a2d-0f750fe44b51.png)
   　<br>
   　<br>
4. 棒読みちゃんを[ダウンロード](https://chi.usamimi.info/Program/Application/BouyomiChan/)します
   ![棒読みちゃんDL元](https://user-images.githubusercontent.com/52102146/168620234-ed5df4f7-552e-4dd3-9204-664fac39a983.png)
   　<br>
   　<br>
5. 棒読みちゃん WebSocket プラグインを[ダウンロード](https://github.com/ryujimiya/Plugin_BymChnWebSocket)・棒読みちゃんで有効化する
   ![棒読みちゃんWebSocketプラグインDL元](https://user-images.githubusercontent.com/52102146/168620364-63bd4f0c-7b7f-4f98-afb2-0790b376f3b1.png)
   ![棒読みちゃんWebSocketプラグイン有効化](https://user-images.githubusercontent.com/52102146/168620414-8d2a5ced-9e53-49a2-b04d-2cb9c52c13ce.png)
   　<br>
   　<br>
6. 棒読みちゃんをデスクトップ上で起動します
   　<br>
   　<br>
7. チャットにテキストを打ち込んで送信します
   ![棒読みちゃんデフォルト読み上げ](https://user-images.githubusercontent.com/52102146/168620473-623a98da-965f-49da-a9e9-9eef2a5f96f1.png)
   　<br>
   　<br>
   　<br>

### ユーザーとアクターごとに声質を変更する

1. 基本編の「6.」の後、基本編の「3.」の ♫ マークの下に歯車マークのボタンが（追加されて）ありますので、クリックしてください
   ![個別読み上げ設定](https://user-images.githubusercontent.com/52102146/168620543-38c361c2-041e-4052-a904-1ee1d6bdafb2.png)
   　<br>
   　<br>
2. 現在ユーザーとして登録されている名前とアクターの名前が一覧で出てきます - ドロップダウンリストの中の声の選択肢を追加したい場合には、次の『SAPI5 対応合成音声エンジンを追加する』を参照してください
   　<br>
   　<br>
3. デフォルトから声質を変更したトークンをシーンに配置し、トークンとして話してみましょう
   　<br>
   　<br>
   　<br>

### SAPI5 対応合成音声エンジンを追加する

1. ワールドの「コンフィグ設定」⇒「モジュール設定」⇒「Bouyomichan Connector」⇒「SAPI5 音声 ID 設定」から設定画面を表示させてください
   ![SAPI5対応合成エンジン追加](https://user-images.githubusercontent.com/52102146/168620618-9902f12b-b15f-4397-a67d-5175b1e42817.png)
   　<br>
   　<br>
2. 棒読みちゃんの「基本設定」⇒「音声合成エンジン」から追加したい種別 SAPI5 の ID と名前を確認します
   　<br>
   　<br>
3. 「1.」で出した設定画面右上のプラスマークをクリックして行を追加してください
   　<br>
   　<br>
4. 追加した行に「2.」で確認した名前と ID を入力します - ここで入力した名前は、『ユーザーとアクターごとに声質を変更する』で説明したドロップダウンリストでの表示名となりますので、略称等でも問題ありません（重要なのは ID です）
   　<br>
   　<br>
5. 「変更内容を保存」し、自分のユーザーの声質を変更してテストしてみましょう - 「変更内容を保存」しなければ、内容は登録されないので注意ください（閉じるマークはダメ！）
   　<br>
   　<br>
   　<br>

### Theatre Inserts と併用する

1. 立ち絵 MOD Theatre Inserts が有効となっているワールドであれば、ユーザーとアクターごとの声質の変更の設定画面に自動的に「ナレーター」が追加されます。Theater Inserts のナレーター用の読み上げ音声を設定しておくことができます
   ![ナレーター読み上げ](https://user-images.githubusercontent.com/52102146/168621454-1a3f57ef-5adf-4c45-aae8-4e3bbedd6e15.png)
   ![アクターセリフ](https://user-images.githubusercontent.com/52102146/168621518-c21ef1fe-06e7-46fa-b4e3-83cdec20c71d.png)
   　<br>
   　<br>
   　<br>

### Speak As…… と併用する

1. 既存のアクターデータとして発言をした際に、ユーザーとアクターごとの声質の変更で設定された音声設定を自動的に適用してくれます
   　<br>
   　<br>
   　<br>

### Narrator Tools と併用する

1. ナレーター MOD Narrator Tools が有効となっているワールドであれば、ユーザーとアクターごとの声質の変更の設定画面に自動的に「/desc」コマンドや「/narrate」コマンドに対応した「Description (Narrator Tools)」と「Narration (Narrator Tools)」が追加されます。Narrator Tools のナレーター用の読み上げ音声を設定しておくことができます
2. 資料（ジャーナル）等を右クリックしてチャットに出力する場合も読み上げてくれます
3. 「/as」コマンドには対応していません。これはこの as の機能がユーザーデータやトークンデータ、アクターデータ等の FVTT データに紐づかないチャットの発信者名だけの変更機能であるためです（棒読みちゃんのデフォルトで読み上げられます）。特定の人物に設定した声を使用したい場合には、Speak As……の MOD を使用してください
   　<br>
   　<br>
   　<br>

### 他のプレイヤーに読み上げ音声を聞かせる

1. VoiceMeeter Banana 等の仮想ミキサーを使用して、通話アプリのマイクや FoundryVTT の WebRTC 音声通話のマイクから合成音声を流しましょう - [VoiceMeeter Banana](https://vb-audio.com/Voicemeeter/banana.htm) - [使い方紹介外部記事](https://blog.isarver.com/howtovoicemeeter-ch-firstsetting/)
   　<br>
   　<br>
   　<br>

### VOICEROID や AI.VOICE など各合成音声を棒読みちゃんに追加する

1. VOICEROID2[^1]、VOICEROID+ EX 版、VOICEROID+（東北ずん子、結月ゆかり[^2]、民安ともえ、鷹の爪 吉田くん）、VOICEROID（月読アイ、月読ショウタ[^3]）、ガイノイド Talk、音街ウナ[^4]Talk Ex、ギャラ子[^5]Talk、かんたん! AITalk[^6] 3、かんたん! AITalk 3 関西風の場合 - [ここ](https://wangdora.rdy.jp/?plugin/VTP) から Voiceroid Talk Plus のプラグインをインストールして棒読みちゃんで有効にしてください - この場合の声質は上書き実行して使います（例えば、Player1 が女性 1（棒読みちゃん）設定時に、Voiceroid Talk Plus の設定内のコマンド一覧にある鷹の爪 吉田くんボイス（コマンド 「v)」）を話したい場合は、「v) "読み上げたい文章"」をチャットに入力してください）
   　<br>
   　<br>
2. VOICEVOX[^7]、LMROID、SHAREVOX、COEIROINK[^8]onVOICEVOX の場合 - [ここページ](https://github.com/shigobu/SAPIForVOICEVOX) から「SAPI For VOICEVOX」をダウンロードして棒読みちゃんと VOICEVOX と併用してください（SAPI5 として追加されます） - LMROID、SHAREVOX、COEIROINKonVOICEVOX については、上記のページの [「VOICEVOX 派生アプリのキャラクター登録」](https://github.com/shigobu/SAPIForVOICEVOX#voicevox%E6%B4%BE%E7%94%9F%E3%82%A2%E3%83%97%E3%83%AA%E3%81%AE%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E7%99%BB%E9%8C%B2%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3-200%E4%BB%A5%E9%99%8D) を参照ください
   　<br>
   　<br>
3. A.I.Voice[^9]の場合 - [ここのページ](https://github.com/gizagizamax/PotatoVoiceHub) から「PotatoVoiceHub」をダウンロードして棒読みちゃんと Voiceroid Talk Plus と連携してください
   　<br>
   　<br>
4. VOICEPEAK[^10]の場合（連携できません。棒読みちゃんと連携する方法をご存じの方がいましたら情報提供ください）
   　<br>
   　<br>
5. CeVIO[^11]\(CS6 のみ) - CeVIO CS7 と AI は 64bit アプリケーションなので、32bit アプリケーションの棒読みちゃんと連携できません - CS6 の場合、SAPI5 音源として（単独で？）連携できるようです
   　<br>
   　<br>
   　<br>

## 権利表記と謝辞

- この MOD に含まれている bouyomichan_client.js は、[@ryujimiya2361](https://twitter.com/ryujimiya2361)氏が作成した「[棒読みちゃん WebSocket プラグイン](https://qiita.com/ryujimiya2361/items/2bf46596b45583f370a6)」の使用例をほんの少しだけ改造したものが組み込まれています。この MOD は WebSocket で棒読みちゃんにテキストデータ等を送ることができなければ成り立たちません。素晴らしいプラグインを作成された氏にこの場をお借りして感謝の意を申し上げます。
  　<br>
  　<br>
  　<br>

## 主な更新内容

### v0.2.5

- 読み上げ音声の設定をプレイヤーに表示させない設定を追加しました（[jeannjeann](https://github.com/jeannjeann) さん、PR ありがとうございます！）
- ウィスパーでのチャットメッセージを読み上げる設定を追加しました（有効にした場合、自分に見えないウィスパーメッセージも含めて全てを棒読みちゃんが読み上げます）
- [Polyglot](https://github.com/mclemente/fvtt-module-polyglot) との連携をしました（デフォルトで Polyglot の言語設定がされたチャットメッセージを読み上げないようにしています）
- v0.2.3 から v0.2.4 にアップグレードした場合に、他プレイヤーの発言等が聞こえないバグが発生する事象について対応しました（[jeannjeann](https://github.com/jeannjeann) さんバグ報告ありがとうございました

### v0.2.4

- Foundry VTT Version 12 に対応確認しました（引き続き Version 9 ～ 11 でも使用できます）
- [Narrator Tools](https://github.com/elizeuangelo/fvtt-module-narrator-tools) との連携をしました（[jeannjeann](https://github.com/jeannjeann) さん、PR ありがとうございます！）

### v0.2.3

- Foundry VTT Version 11 に対応しました（引き続き Version 9 ～ 10 でも使用できます）
- 前回アップデート時の告知のとおり、CoeFont[^12]との連携のための機能を削除しました
- Player 権限で棒読みちゃんを使用する場合でも、『読み上げ切り替えスイッチ』と『発声者ごとの個別読み上げ設定』が表示できるようにしました
- 『発声者ごとの個別読み上げ設定』のアイコンを判別しやすいように歯車からスライドバーに変更しました
  <br>

### v0.2.0

- Foundry VTT Version 10 に対応しました（引き続き Version 9 でも使用できます）
- 「SAPI5 音声 ID 設定」で保存がうまくいかない時があるバグを修正しました
- CoeFont の API の Enterprise 契約限定化に伴い、当該機能を Foundry VTT Version 11 対応時に削除することを告知しました
  <br>

### v0.1.3

- 声なしの設定ができるようになりました
- [Speak As……](https://github.com/hktrpg/foundryVTT-speak-as) との連携をしました
  <br>

### v0.1.2

- [Theatre Inserts](https://github.com/League-of-Foundry-Developers/fvtt-module-theatre) にて控え室からアクターを指定して話した場合でも、指定した声質となるように連携を強化しました
  <br>

### v0.1.1

- README.md に詳細な使い方を追記しました
  <br>

### v0.1.0

- 初回リリース（β 版）
  <br>
  <br>
  [^1]:VOICEROID は株式会社 AHS および株式会社エーアイの登録商標です。
  [^2]:結月ゆかりは株式会社バンピーファクトリーの登録商標です。
  [^3]:月読ショウタ、月読アイは株式会社 AHS の登録商標です。
  [^4]:音街ウナは株式会社エム・ティー・ケーの登録商標です。
  [^5]:ギャラ子はヤマハ株式会社および株式会社スターダスト音楽出版の登録商標です。
  [^6]:AITalk は株式会社エーアイの登録商標です。
  [^7]:VOICEVOX は廣芝 和之氏の登録商標です。
  [^8]:COEIROINK は服部 諭美氏の登録商標です。
  [^9]:AIVoice は株式会社エーアイの登録商標です。
  [^10]:VOICEPEAK は DreamTonics 株式会社の登録商標です。
  [^11]:CeVIO は株式会社フロンティアワークスの登録商標です。
  [^12]:AI 音声プラットフォーム「CoeFont」とは。[CoeFont](https://coefont.cloud)は AI 音声プラットフォームです。最新の AI 音声合成技術を活かし、「声」を手軽かつ表現力豊かな「フォント」のようにすることをコンセプトにした AI 音声技術です。従来では、50 万円・10 時間以上の収録を必要としていた音声合成を、このサービスでは 500 円・15 分の収録で、自然な発声のできる「CoeFont(AI 音声)」を作成できます。作成した CoeFont は、クラウド上で公開することができます。他のユーザーの CoeFont を利用した AI 音声の作成も可能です。作成した CoeFont が利用されるたびに、CoeFont の作成者に収益として還元されます。また API を利用して、アプリやウェブサイトに組み込むこともできます。（株式会社 CoeFont より）CoeFont は株式会社 CoeFont の登録商標です。
