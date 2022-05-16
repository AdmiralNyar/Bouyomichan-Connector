# BymChn Connector(β)
棒読みちゃんコネクター（BymChn Connector）は、Foundry VTT(ver 9)と棒読みちゃんとCoeFont[^1]を連携させるためのModです。このMod単体では動作せず、下記のツールのインストール（ダウンロード）や登録が必要になりますので、ご注意ください。（自分を含めた）全員のチャットに打ち込んで送信した文章が、自分の棒読みちゃんから（CoeFontの場合はFoundry VTTのページから）音声として出力されます。また、アクターおよびユーザーごとに読み上げさせる声を予め設定しておくこともできます。
　<br>
　<br>
　<br>
## 注意
- このMODによって生じた**いかなる損害や損失に対して、MOD作成者である私は一切の責任と義務を負っていない**ことにご注意ください
- チャットを利用した他のMODと干渉する場合があるので、ご注意ください
- 合成音声の著作権等の権利を侵害しないように使用してください
- このMODはβ版であり、バグが残っている可能性があります。もしバグを発見された場合には、ご一報くださいますとありがたいです
- このMODを使用したTRPGプレイ動画等を投稿される場合は、このMODとFoundryVTTの紹介をしていただけますと、大変うれしく思います（ご協力お願いいたします）
- FireFoxブラウザは(CORS関係の設定が他ブラウザと違うらしく)棒読みちゃんとリンクできないので、非対応です
　<br>
　<br>
　<br>
## 使用方法
　<br>
　<br>
### 基本
1. このMODをインストールする
     - 下記のリンクをFoundryVTT起動画面の「アドオン・モジュール」⇒「モジュールインストール」⇒「URLを指定：」⇒「インストール」からインストールしてください<br>
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
3. MODを有効化したワールドの画面左側の♫マーク内に吹き出しマークのボタンが追加されますので、有効化（紫色が明るくなった状態）してください
     - シーンが1つ以上存在しないワールドでは左側のボタンは全て無効化されてますので、本当に初期のワールドはまずシーンを何でもいいので作成してください
![読み上げ切り替えスイッチオン](https://user-images.githubusercontent.com/52102146/168620153-2571deef-54fb-436c-9a2d-0f750fe44b51.png)
　<br>
　<br>
4. 棒読みちゃんを[ダウンロード](https://chi.usamimi.info/Program/Application/BouyomiChan/)します
![棒読みちゃんDL元](https://user-images.githubusercontent.com/52102146/168620234-ed5df4f7-552e-4dd3-9204-664fac39a983.png)
　<br>
　<br>
5. 棒読みちゃんWebSocketプラグインを[ダウンロード](https://github.com/ryujimiya/Plugin_BymChnWebSocket)・棒読みちゃんで有効化する
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
1. 基本編の「6.」の後、基本編の「3.」の♫マークの下に歯車マークのボタンが（追加されて）ありますので、クリックしてください
![個別読み上げ設定](https://user-images.githubusercontent.com/52102146/168620543-38c361c2-041e-4052-a904-1ee1d6bdafb2.png)
　<br>
　<br>
2. 現在ユーザーとして登録されている名前とアクターの名前が一覧で出てきます
     - ドロップダウンリストの中の声の選択肢を追加したい場合には、次の『SAPI5対応合成音声エンジンを追加する』、『CoeFontのボイスを追加する』を参照してください
　<br>
　<br>
3. デフォルトから声質を変更したトークンをシーンに配置し、トークンとして話してみましょう
　<br>
　<br>
　<br>
### SAPI5対応合成音声エンジンを追加する
1. ワールドの「コンフィグ設定」⇒「モジュール設定」⇒「Bouyomichan Connector」⇒「SAPI5音声ID設定」から設定画面を表示させてください
![SAPI5対応合成エンジン追加](https://user-images.githubusercontent.com/52102146/168620618-9902f12b-b15f-4397-a67d-5175b1e42817.png)
　<br>
　<br>
2. 棒読みちゃんの「基本設定」⇒「音声合成エンジン」から追加したい種別SAPI5のIDと名前を確認します
　<br>
　<br>
3. 「1.」で出した設定画面右上のプラスマークをクリックして行を追加してください
　<br>
　<br>
4. 追加した行に「2.」で確認した名前とIDを入力します
     - ここで入力した名前は、『ユーザーとアクターごとに声質を変更する』で説明したドロップダウンリストでの表示名となりますので、略称等でも問題ありません（重要なのはIDです）
　<br>
　<br>
5. 「変更内容を保存」し、自分のユーザーの声質を変更してテストしてみましょう
     - 「変更内容を保存」しなければ、内容は登録されないので注意ください（閉じるマークはダメ！）
　<br>
　<br>
　<br>
### CoeFontのボイスを追加する
**まず、CoeFontは有料であり、ボイスを使用する度に課金して得たポイントを消費することにご注意ください(CoeFont APIを使用するので、ブラウザ上で基本無料のアリアル・ミリアル・アルベーニも1文字5ポイント消費します！)**<br>
**CoeFontにはNGワードがあります。卑猥な用語、放送禁止用語等のNGワードを含む言葉はエラーとなり、出力されませんので注意お願いします（例：ねぇ、壇ノ浦に本当に行ったの？⇒裏日本(NG)、[参考動画](https://www.nicovideo.jp/watch/sm39773414)）**
1. CoeFontに登録します
![CoeFont登録](https://user-images.githubusercontent.com/52102146/168620717-a017d796-f430-4ef2-b647-de3d95e5e48c.png)
　<br>
　<br>
2. CoeFont画面右上のユーザーマーク（アカウント設定）からAPI情報を開き、アクセスキー（Access Key）とクライアントシークレット（Client Secret）を確認します
![CoeFontAPI情報](https://user-images.githubusercontent.com/52102146/168620777-7193f636-7d75-4d59-992a-b5c3e72c05da.png)
　<br>
　<br>
3. CoeFontとやりとりできるAPIを用意します（下記のリンクからWindows 10[^2]上で実行形式(exeファイル)で起動できるCoeFont API用ローカルサーバーアプリがあるので、問題なければそちらをお使いください）
     - APIはPOSTで下記のデータをFoundryVTTから送られますので、返却用のjsonデータを返してください
     - API側で、先ほど確認したアクセスキーとクライアントシークレットを使用します（詳しくは、CoeFont APIの仕様のページか、下記のリンク先を参照ください）
　<br>
　<br>

POST
```
Header : "Content-Type": "application/json"
```
```
{
    "text" : "読み上げる文章(string)",
    "coefont" : "音声変換を行うcoefontのID。coefont詳細画面のurlに表示される個別のuuidを参照。(string)",
    "volume" : [0.2 .. 2](float)
}
```
　<br>
　<br>
RESPONSE
```
{
    "url" : "CoeFont APIから得たwavファイルのURL(string)"
}
```
　<br>
　<br>
4. 用意したAPIを起動します
　<br>
　<br>
5. CoeFont上からFoundryVTTで使用したい音源のページを表示して、そのURLからuuid部分をコピーします<br>
- `https://coefont.cloud/coefonts/xxxx` の `xxxx`の部分<br>
![CoeFontのuuid](https://user-images.githubusercontent.com/52102146/168620885-5b9fa9ba-999d-427b-a351-48986d946a13.png)
　<br>
　<br>
6. FoundryVTTのワールドの「コンフィグ設定」⇒「モジュール設定」⇒「Bouyomichan Connector」⇒「CoeFontとの連携機能を使用する」にチェックを入れ、「変更内容を保存」します
![CoeFont機能有効化](https://user-images.githubusercontent.com/52102146/168621093-d0886b9b-3110-42f3-9ae6-3d4ab419fd00.png)
　<br>
　<br>
7. 再度「モジュール設定」を開くと、「Bouyomichan Connector」内に「CoeFontのボイスを登録」のボタンと「CoeFontAPIと接続する独自APIのURL」等が追加されています
![CoeFont連携機能追加](https://user-images.githubusercontent.com/52102146/168621286-c99a88b5-d764-495d-9b57-53bb2642fc09.png)
　<br>
　<br>
8. 「CoeFontAPIと接続する独自APIのURL」には「4.」で起動したAPIのURLを張り付けます
　<br>
　<br>
9. 「CoeFontのボイスを登録」から設定画面を開き、CoeFontの名前とuuidを登録します
- 右側のΛマークをクリックすると、喜怒哀楽のuuidを別に登録できます
- 喜怒哀楽を使用したい場合は、発声者が該当のCoeFontのボイスに声質を変更した状態で、チャットの一番初めに喜なら「ki) 」、怒なら「do) 」、哀なら「ai) 」、楽なら「rk) 」を入力してチャットを送ります（各括弧の次と読み上げたい文章との間に半角スペースがあることと、文字は全て半角小文字であることに注意すること）
- 既に登録してあるuuidを変更する場合は、ユーザー（アクター）で指定のCoeFontの声質に新しいuuidが反映されていないので、声質の変更から一度別の声に変更後その声質に戻してください
![CoeFontのuuid登録](https://user-images.githubusercontent.com/52102146/168621379-1c598eaa-560a-438c-b1dd-922bee935226.png)
　<br>
　<br>
10. 「変更内容を保存」し、自分のユーザーの声質を変更してテストしてみましょう
     - 「変更内容を保存」しないと変更が反映されないので注意してください
　<br>
　<br>
　<br>
### Theatre Insertsと併用する
1. 立ち絵MOD Theatre Insertsが有効となっているワールドであれば、ユーザーとアクターごとの声質の変更の設定画面に自動的に「ナレーター」が追加されます。Theater Insertsでナレーター用読み上げ音声を設定しておくことができます
![ナレーター読み上げ](https://user-images.githubusercontent.com/52102146/168621454-1a3f57ef-5adf-4c45-aae8-4e3bbedd6e15.png)
![アクターセリフ](https://user-images.githubusercontent.com/52102146/168621518-c21ef1fe-06e7-46fa-b4e3-83cdec20c71d.png)
　<br>
　<br>
　<br>
### 他のプレイヤーに読み上げ音声を聞かせる
1. VoiceMeeter Banana等の仮想ミキサーを使用して、通話アプリのマイクやFoundryVTTのWebRTC音声通話のマイクから合成音声を流しましょう
     - [VoiceMeeter Banana](https://vb-audio.com/Voicemeeter/banana.htm)
     - [使い方紹介外部記事](https://blog.isarver.com/howtovoicemeeter-ch-firstsetting/)
　<br>
　<br>
　<br>
### VOICEROIDやAI.VOICEなど各合成音声を棒読みちゃんに追加する
1. VOICEROID2[^3]、VOICEROID+ EX版、VOICEROID+（東北ずん子、結月ゆかり[^4]、民安ともえ、鷹の爪 吉田くん）、VOICEROID（月読アイ、月読ショウタ[^5]）、ガイノイドTalk、音街ウナ[^6]Talk Ex、ギャラ子[^7]Talk、かんたん! AITalk[^8] 3、かんたん! AITalk 3 関西風の場合
     - [ここ](https://wangdora.rdy.jp/?plugin/VTP) からVoiceroid Talk Plusのプラグインをインストールして棒読みちゃんで有効にしてください
     - この場合の声質は、チャットの話者の声質がCoeFontの声質以外の場合に上書き実行して使います（例えば、Player1が女性1（棒読みちゃん）設定時に、Voiceroid Talk Plusの設定内のコマンド一覧にある鷹の爪 吉田くんボイス（コマンド 「v)」）を話したい場合は、「v) "読み上げたい文章"」をチャットに入力してください）
　<br>
　<br>
2. VOICEVOXの場合
     - [ここページ](https://github.com/shigobu/SAPIForVOICEVOX) から「SAPI For VOICEVOX」をダウンロードして棒読みちゃんとVOICEVOXと併用してください（SAPI5として追加されます）
　<br>
　<br>
3. A.I.Voice[^9]の場合
     - [ここのページ](https://github.com/gizagizamax/PotatoVoiceHub) から「PotatoVoiceHub」をダウンロードして棒読みちゃんとVoiceroid Talk Plusと連携してください
　<br>
　<br>
4. VOICEPEAK[^10]の場合（連携できません。棒読みちゃんと連携する方法をご存じの方がいましたら情報提供ください）
　<br>
　<br>
5. CeVIO[^11]\(CS6のみ)
     - CeVIO CS7とAIは64bitアプリケーションなので、32bitアプリケーションの棒読みちゃんと連携できません
     - CS6の場合、SAPI5音源として（単独で？）連携できるようです
　<br>
　<br>
　<br>
## 権利表記と謝辞
- このMODに含まれているbouyomichan_client.jsは、[@ryujimiya2361](https://twitter.com/ryujimiya2361)氏が作成した「棒読みちゃんWebSocketプラグイン」の使用例をほんの少しだけ改造したものが組み込まれています。このMODはWebSocketで棒読みちゃんにテキストデータ等を送ることができなければ成り立たちません。素晴らしいプラグインを作成された氏にこの場をお借りして感謝の意を申し上げます。
　<br>
　<br>
　<br>
[^1]:AI音声プラットフォーム「CoeFont」とは。[CoeFont](https://coefont.cloud)はAI音声プラットフォームです。最新のAI音声合成技術を活かし、「声」を手軽かつ表現力豊かな「フォント」のようにすることをコンセプトにしたAI音声技術です。従来では、50万円・10時間以上の収録を必要としていた音声合成を、このサービスでは500円・15分の収録で、自然な発声のできる「CoeFont(AI音声)」を作成できます。作成したCoeFontは、クラウド上で公開することができます。他のユーザーのCoeFontを利用したAI音声の作成も可能です。作成したCoeFontが利用されるたびに、CoeFontの作成者に収益として還元されます。またAPIを利用して、アプリやウェブサイトに組み込むこともできます。（株式会社CoeFontより）CoeFontは株式会社CoeFontの登録商標です。
[^2]:Windows10は、MicrosoftCorporationの米国及びその他の国における商標または登録商標です。
[^3]:VOICEROIDは株式会社AHSおよび株式会社エーアイの登録商標です。
[^4]:結月ゆかりは株式会社バンピーファクトリーの登録商標です。
[^5]:月読ショウタ、月読アイは株式会社AHSの登録商標です。
[^6]:音街ウナは株式会社エム・ティー・ケーの登録商標です。
[^7]:ギャラ子はヤマハ株式会社および株式会社スターダスト音楽出版の登録商標です。
[^8]:AITalkは株式会社エーアイの登録商標です。
[^9]:AIVoiceは株式会社エーアイの登録商標です。
[^10]:VOICEPEAKはDreamTonics株式会社の登録商標です。
[^11]:CeVIOは株式会社フロンティアワークスの登録商標です。
