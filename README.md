# Bouyomichan Connector

棒読みちゃんコネクター（Bouyomichan Connector）は、Foundry VTT(ver 9 ～ 13)と棒読みちゃんを連携させるための Mod です。この Mod 単体では動作せず、下記のツールのインストール（ダウンロード）や登録が必要になりますので、ご注意ください。（自分を含めた）全員のチャットに打ち込んで送信した文章が、自分の棒読みちゃんから音声として出力されます。また、アクターおよびユーザーごとに読み上げさせる声を予め設定しておくこともできます。
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
6. エクスポートボタンとインポートボタンにより、設定データをファイルとして保存・読込することができます
   　<br>
   　<br>
   　<br>

### にじボイスのボイスアクターを追加する

**まず、にじボイス[^1]は有料であり、ボイスを使用する度に課金して得たクレジットを消費することにご注意ください(にじボイス API は通常のにじボイスと金額が違っており、2024 年 12 月現在では 1 万字/825 円となってます)**<br>

1. にじボイス API に google アカウント等から登録して、ログインします（にじボイス API のログインページは通常のにじボイスのログインページと異なっているので注意！）
   ![にじボイス登録](https://github.com/user-attachments/assets/f2b1a2f3-7868-41ff-adf2-d7ffe2c32e87)
   　<br>
   　<br>
2. ログインしたら、次に API キーをクリックし、眼のマークをクリックすれば API キーを確認できます
   ![にじボイスAPIのアクセスキーの場所](https://github.com/user-attachments/assets/906a15bb-ff77-473c-8f3c-345415fedce3)
   　<br>
   　<br>
3. [NijiVoice_to_FVTT_LOCAL_API](https://github.com/AdmiralNyar/NijiVoice_to_FVTT_LOCAL_API)をダウンロードして、NijiVoice_to_Foundry.exe を実行します
   　<br>
   　<br>
4. API キーを入力し、音声の保存先を設定し、NijiVoice_to_Foundry API サーバーを起動します
   ![サーバー起動前の入力項目](https://github.com/user-attachments/assets/f46b9e0c-5c51-4c7f-84c7-85a6a6e92c16)
   　<br>
   　<br>
5. NijiVoice to Foundry アプリケーションのアドレスを Bouyomichan Connector の MOD を有効化したワールドの「設定」⇒「Bouyomichan Connector」⇒「NijiVoice to Foundry アプリケーションの API サーバーアドレス」に張り付けて「変更内容を保存」してください

- （デフォルトの http://localhost:2000 のまま使用するか、API サーバー起動時にポート番号を 2000 から例えば 1234 に変更していた場合は、http://localhost:1234 を入力してください）
  ![URLを入力する](https://github.com/user-attachments/assets/3f00c453-3efe-4dc0-a39c-baaa5862d2e6)
  　<br>
  　<br>

6. 「にじボイス API の残クレジット（＝文字数）数の通知」について、にじボイス API での音声生成後の残クレジットがここに入力した値以下となった場合、Foundry VTT のワールド側で通知が表示されます
   ![残クレジット通知](https://github.com/user-attachments/assets/2558af07-e427-47e4-9418-a4fe92dfb94b)
   ![通知](https://github.com/user-attachments/assets/725157e6-ef30-4d8c-b571-ffe3da28c75a)
   　<br>
   　<br>
7. 「にじボイスのボイスアクター全員をこの部屋の ID 設定リストに追加する」について、ここに ✓ をつけてから「変更内容を保存」すると、「にじボイスアクター ID 設定」に自動的ににじボイスのボイスアクター全員が登録されます

- 「変更内容を保存」後に、「設定」の「にじボイスのボイスアクター全員をこの部屋の ID 設定リストに追加する」の ✓ は自動的に外れます
- API で最新のリストをにじボイス側から取り込んでいるので、必ず NijiVoice_to_Foundry API サーバーを起動した状態でこの機能を使用してください
  ![にじボイスIDの追加](https://github.com/user-attachments/assets/42ff377f-8cd5-4f50-8fe5-f8def131bc6b)
  ![にじボイスアクターリスト](https://github.com/user-attachments/assets/79e4ae66-4541-4993-bc72-f7ae299ae608)
  　<br>
  　<br>

8. 「にじボイスアクター ID 設定」に登録されたデータは、通常どおり「発声者ごとの個別読み上げ設定」から指定できるようになります

- 100 人以上追加されるため、使用しないボイスアクターは「にじボイスアクター ID 設定」から削除しても大丈夫です（再度、「にじボイスのボイスアクター全員をこの部屋の ID 設定リストに追加する」から削除した分のボイスアクターを追加できます）
- Bouyomichan Connector module の「発声者ごとの個別読み上げ設定」は、にじボイスボイスアクターごとの ID で管理しているため、「にじボイスアクター ID 設定」でボイスアクター名を変更しても（サンタクロース ⇒ サンタ のように）読み上げ設定は消えません
  ![ボイス設定](https://github.com/user-attachments/assets/39d211df-5aa0-450d-bd1c-902010b9932e)
- 「にじボイスアクター ID 設定」のエクスポートボタンとインポートボタンにより、設定データをファイルとして保存・読込することができます
  　<br>
  　<br>

9. 「にじボイスの資料を作製する」について、ここに ✓ をつけてから「変更内容を保存」すると、「資料（Journal）」に「にじボイスアクターリスト」という資料が自動追加されます

- 「変更内容を保存」後に、「設定」の「にじボイスの資料を作製する」の ✓ は自動的に外れます
- API で最新のリストをにじボイス側から取り込んでいるので、必ず NijiVoice_to_Foundry API サーバーを起動した状態でこの機能を使用してください
  ![にじボイス資料の作製](https://github.com/user-attachments/assets/0fdcc08e-b68c-42c4-b7fa-c263f0aaae2c)
  ![にじボイス資料](https://github.com/user-attachments/assets/11be9930-db40-4950-ad79-27b0f452c8d4)
  　<br>
  　<br>
  　<br>

### 鍵括弧でセリフと地の文章を分けて使用する際の読み上げ設定について変更する（応用設定）
1. 「括弧の読み上げ設定」より次の4種類の設定から鍵括弧付きのチャットメッセージについての読み上げの動作を変更することができます（他モジュールによるナレーションや説明のチャットカード出力による場合、この設定内容は適用されず、全文通常どおり読み上げられます）
2. 「0. 無効（デフォルト）」：通常どおり、各アクターおよび各ユーザー別の読み上げ音声設定で読み上げられます
3. 「1. 鍵括弧内のみ読み上げ（全員）」：各アクターおよび各ユーザーによる、そのすべてのチャットメッセージについて、読み上げをするものを鍵括弧「」内の文章に限定します（両綴じされた鍵括弧内の文章のみが対象となっており、【】や""や[]や「単体や」単体では読み上げられません）
4. 「2. アクターのみ鍵括弧内を読み上げ」：各ユーザーによる発言(OOC発言)は通常どおり全文読み上げられます。各アクターによる、そのすべてのチャットメッセージについて、読み上げをするものを鍵括弧「」内の文章に限定します（両綴じされた鍵括弧内の文章のみが対象となっており、【】や""や[]や「単体や」単体では読み上げられません）
5. 「3. アクターの鍵括弧外をUser/GM音声で読み上げ」：各ユーザーによる発言(OOC発言)は通常どおり全文読み上げられます。各アクターによる、そのすべてのチャットメッセージについて、鍵括弧「」内の文章を当該アクターの読み上げ音声設定で読み上げ、鍵括弧外の地の文章については当該メッセージを発信した各ユーザーの読み上げ音声設定で読み上げられます（両綴じされた鍵括弧内の文章のみが対象となっており、【】や""や[]や「単体や」単体では読み上げられません）
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

### Multiple Chat Tabs と併用する

1. チャットタブ追加MOD Multiple Chat Tabs が有効となっているワールドであれば、タブごとに読み上げない設定を追加ですることができます。この設定は、他のモジュールによるナレーションや説明のチャットカード出力機能よりも優先されます。これは、ワールド全体の設定ではなく、ユーザーごとの設定となります。
<img width="1419" height="807" alt="各タブの読み上げの個別設定" src="https://github.com/user-attachments/assets/570dcd6c-298f-438a-a115-ce110f29f157" />
   　<br>

   　<br>
   　<br>
    
### 他のプレイヤーに読み上げ音声を聞かせる

1. VoiceMeeter Banana 等の仮想ミキサーを使用して、通話アプリのマイクや FoundryVTT の WebRTC 音声通話のマイクから合成音声を流しましょう - [VoiceMeeter Banana](https://vb-audio.com/Voicemeeter/banana.htm) - [使い方紹介外部記事](https://blog.isarver.com/howtovoicemeeter-ch-firstsetting/)
   　<br>
   　<br>
   　<br>

### VOICEROID や AI.VOICE など各合成音声を棒読みちゃんに追加する

1. VOICEROID2[^2]、VOICEROID+ EX 版、VOICEROID+（東北ずん子、結月ゆかり[^3]、民安ともえ、鷹の爪 吉田くん）、VOICEROID（月読アイ、月読ショウタ[^4]）、ガイノイド Talk、音街ウナ[^5]Talk Ex、ギャラ子[^6]Talk、かんたん! AITalk[^7] 3、かんたん! AITalk 3 関西風の場合 - [ここ](https://wangdora.rdy.jp/?plugin/VTP) から Voiceroid Talk Plus のプラグインをインストールして棒読みちゃんで有効にしてください - この場合の声質は上書き実行して使います（例えば、Player1 が女性 1（棒読みちゃん）設定時に、Voiceroid Talk Plus の設定内のコマンド一覧にある鷹の爪 吉田くんボイス（コマンド 「v)」）を話したい場合は、「v) "読み上げたい文章"」をチャットに入力してください）
   　<br>
   　<br>
2. VOICEVOX[^8]、LMROID、SHAREVOX、COEIROINK[^9]onVOICEVOX の場合 - [ここページ](https://github.com/shigobu/SAPIForVOICEVOX) から「SAPI For VOICEVOX」をダウンロードして棒読みちゃんと VOICEVOX と併用してください（SAPI5 として追加されます） - LMROID、SHAREVOX、COEIROINKonVOICEVOX については、上記のページの [「VOICEVOX 派生アプリのキャラクター登録」](https://github.com/shigobu/SAPIForVOICEVOX#voicevox%E6%B4%BE%E7%94%9F%E3%82%A2%E3%83%97%E3%83%AA%E3%81%AE%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E7%99%BB%E9%8C%B2%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3-200%E4%BB%A5%E9%99%8D) を参照ください
   　<br>
   　<br>
3. A.I.Voice[^10]の場合 - [ここのページ](https://github.com/gizagizamax/PotatoVoiceHub) から「PotatoVoiceHub」をダウンロードして棒読みちゃんと Voiceroid Talk Plus と連携してください
   　<br>
   　<br>
4. VOICEPEAK[^11]の場合（連携できません。棒読みちゃんと連携する方法をご存じの方がいましたら情報提供ください）
   　<br>
   　<br>
5. CeVIO[^12]\(CS6 のみ) - CeVIO CS7 と AI は 64bit アプリケーションなので、32bit アプリケーションの棒読みちゃんと連携できません - CS6 の場合、SAPI5 音源として（単独で？）連携できるようです
   　<br>
   　<br>
   　<br>

## 権利表記と謝辞

- この MOD に含まれている bouyomichan_client.js は、[@ryujimiya2361](https://twitter.com/ryujimiya2361)氏が作成した「[棒読みちゃん WebSocket プラグイン](https://qiita.com/ryujimiya2361/items/2bf46596b45583f370a6)」の使用例をほんの少しだけ改造したものが組み込まれています。この MOD は WebSocket で棒読みちゃんにテキストデータ等を送ることができなければ成り立たちません。素晴らしいプラグインを作成された氏にこの場をお借りして感謝の意を申し上げます。
  　<br>
  　<br>
  　<br>

## 主な更新内容

### v0.3.0
- Foundry VTT Version 13に対応しました（引き続き Version 9 ～ 12でも使用できます）
- main.jsが煩雑化していたため、複数のjsファイルに分割しました
- 各設定ウィンドウについてUIを見直しました
- 発声者ごとの個別読み上げ設定ウィンドウに検索機能を追加しました
- 発声者ごとの個別読み上げ設定ウィンドウの発声者リストをモジュール、ユーザー、アクターの3区分に分割しました（アクターのデータの種別ごとに細分化表示をすることも可能）
- 発声者ごとの個別読み上げ設定ウィンドウに一括で読み上げ音声または音量を設定できる機能を追加しました（チェックをつけた発声者に一括設定されます）
- 鍵括弧「」内文章+地の文章によるチャットメッセージの読み上げについての、詳細読み上げ設定機能を追加しました
- Multiple Chat Tabsモジュールへ対応しました（ウィスパー設定や強制OOC設定のあるタブについて動作するようにしました）
- Multiple Chat Tabsモジュール有効時に、タブごとに読み上げをしないように設定できる機能を追加しました

### v0.2.6

- にじボイスとの連携が可能な機能を追加しました
- データ管理におけるバグについて修正しました

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
- 前回アップデート時の告知のとおり、CoeFont[^13]との連携のための機能を削除しました
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
  [^1]:にじボイスは株式会社 Algomatic が運営するサービスです。
  [^2]:VOICEROID は株式会社 AHS および株式会社エーアイの登録商標です。
  [^3]:結月ゆかりは株式会社バンピーファクトリーの登録商標です。
  [^4]:月読ショウタ、月読アイは株式会社 AHS の登録商標です。
  [^5]:音街ウナは株式会社エム・ティー・ケーの登録商標です。
  [^6]:ギャラ子はヤマハ株式会社および株式会社スターダスト音楽出版の登録商標です。
  [^7]:AITalk は株式会社エーアイの登録商標です。
  [^8]:VOICEVOX は廣芝 和之氏の登録商標です。
  [^9]:COEIROINK は服部 諭美氏の登録商標です。
  [^10]:AIVoice は株式会社エーアイの登録商標です。
  [^11]:VOICEPEAK は DreamTonics 株式会社の登録商標です。
  [^12]:CeVIO は株式会社フロンティアワークスの登録商標です。
  [^13]:AI 音声プラットフォーム「CoeFont」とは。[CoeFont](https://coefont.cloud)は AI 音声プラットフォームです。最新の AI 音声合成技術を活かし、「声」を手軽かつ表現力豊かな「フォント」のようにすることをコンセプトにした AI 音声技術です。従来では、50 万円・10 時間以上の収録を必要としていた音声合成を、このサービスでは 500 円・15 分の収録で、自然な発声のできる「CoeFont(AI 音声)」を作成できます。作成した CoeFont は、クラウド上で公開することができます。他のユーザーの CoeFont を利用した AI 音声の作成も可能です。作成した CoeFont が利用されるたびに、CoeFont の作成者に収益として還元されます。また API を利用して、アプリやウェブサイトに組み込むこともできます。（株式会社 CoeFont より）CoeFont は株式会社 CoeFont の登録商標です。


