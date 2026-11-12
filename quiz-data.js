// ---------------------------------------------------------------------
// 題庫設定檔。要改題目、加題目、刪題目，都只要改這個檔案就好。
// 每一關由一個 {type:"announcement", ...} 預告卡片開頭，
// 後面接著若干個 {type:"question", ...} 題目。
// ---------------------------------------------------------------------
window.QUIZ = {
  "title": "生活智慧王",
  "questions": [
    {"subtitle":"輕鬆有趣的生活冷知識，大家一起同樂","title":"第一關：生活趣味題","type":"announcement"},
    {"correctIndex":2,"duration":10,"explanation":"一副標準撲克牌有 52 張（4 種花色各 13 張），再加上 2 張鬼牌，所以總共是 54 張。","options":["52張","60張","54張","56張"],"text":"一副撲克牌（含兩張鬼牌）總共有幾張？","type":"question"},
    {"correctIndex":1,"duration":10,"explanation":"珍珠奶茶裡的「珍珠」主要是用樹薯粉（木薯澱粉）加水揉製、煮熟而成，口感才會Q彈。","options":["糯米","樹薯粉","麵粉","太白粉"],"text":"我們常喝的珍珠奶茶，裡面的「珍珠」主要是用什麼做的？","type":"question"},
    {"correctIndex":2,"duration":10,"explanation":"以母語使用人口計算，中文（主要是華語／官話）的使用人數是全世界最多的。","options":["英文","西班牙文","中文","印地文"],"text":"全世界以母語人口計算，使用人數最多的語言是？","type":"question"},
    {"subtitle":"考考大家對台灣的認識，看誰最了解我們生活的這座島","title":"第二關：台灣之最","type":"announcement"},
    {"correctIndex":1,"duration":10,"explanation":"玉山海拔3,952公尺，不只是台灣第一高峰，也是整個東北亞的第一高峰。","options":["雪山","玉山","合歡山","阿里山"],"text":"台灣第一高峰是哪一座？","type":"question"},
    {"correctIndex":0,"duration":10,"explanation":"鵝鑾鼻位於屏東縣恆春鎮，是台灣本島最南端的地標，鵝鑾鼻燈塔也相當知名。","options":["鵝鑾鼻","貓鼻頭","旗津","墾丁大街"],"text":"台灣本島最南端的地標是？","type":"question"},
    {"correctIndex":1,"duration":10,"explanation":"富貴角位於新北市石門區，是台灣本島最北端的地標。","options":["野柳","富貴角","淡水漁人碼頭","基隆港"],"text":"台灣本島最北端的地標是？","type":"question"},
    {"correctIndex":2,"duration":10,"explanation":"櫻花鉤吻鮭是冰河時期留下來的孑遺生物，目前主要棲息在台中大甲溪上游，是台灣的國寶魚。","options":["吳郭魚","香魚","櫻花鉤吻鮭","石斑魚"],"text":"台灣的國寶魚，是冰河時期留下來的孑遺生物，生活在大甲溪上游，是哪一種魚？","type":"question"},
    {"correctIndex":3,"duration":10,"explanation":"中華民國國旗是紅底，左上角為青天白日（藍底白日），顏色有紅、藍、白三色，並沒有黑色。","options":["紅色","藍色","白色","黑色"],"text":"台灣的國旗不包括下面哪一個顏色？","type":"question"},
    {"correctIndex":2,"duration":10,"explanation":"台北101高508公尺，隨著吉隆坡默迪卡118等新摩天大樓陸續完工，目前在全球已完工大樓中排名第11高。","options":["第5高","第8高","第11高","第15高"],"text":"台北101目前的高度，在全世界已完工的摩天大樓中大約排名第幾？","type":"question"},
    {"subtitle":"地理冷知識大挑戰，看看誰最博學","title":"第三關：世界之最","type":"announcement"},
    {"correctIndex":2,"duration":10,"explanation":"俄羅斯國土面積約 1,710 萬平方公里，橫跨歐亞兩洲，是世界上面積最大的國家。","options":["加拿大","中國","俄羅斯","美國"],"text":"世界上面積最大的國家是？","type":"question"},
    {"correctIndex":1,"duration":10,"explanation":"太平洋面積約 1.65 億平方公里，是地球上面積最大、最深的海洋。","options":["大西洋","太平洋","印度洋","北極海"],"text":"世界上最大的海洋是？","type":"question"},
    {"correctIndex":1,"duration":10,"explanation":"根據近年統計，印度人口已經超越中國，成為世界上人口最多的國家。","options":["中國","印度","美國","印尼"],"text":"目前世界上人口最多的國家是？","type":"question"},
    {"correctIndex":2,"duration":10,"explanation":"坎培拉是經過特別規劃設計、作為雪梨與墨爾本爭奪首都地位後的折衷方案而設立的首都；雪梨其實是澳洲人口最多的城市，但不是首都。","options":["雪梨","墨爾本","坎培拉","布里斯本"],"text":"澳洲的首都是哪裡？","type":"question"},
    {"correctIndex":1,"duration":10,"explanation":"梵蒂岡面積只有 0.44 平方公里，是全世界面積最小的國家，比很多學校的校地還小。","options":["摩納哥","梵蒂岡","新加坡","馬爾地夫"],"text":"世界上面積最小的國家是哪一個？","type":"question"},
    {"correctIndex":0,"duration":10,"explanation":"哈里發塔（Burj Khalifa）高 828 公尺，2010 年在阿拉伯聯合大公國杜拜完工，是目前世界上最高的建築物。","options":["哈里發塔","默迪卡118","上海中心大廈","麥加皇家鐘塔飯店"],"text":"全世界最高的大樓是哪一座？","type":"question"},
    {"subtitle":"動動腦，用生活中的小問題考驗大家的反應力","title":"第四關：數學小測驗","type":"announcement"},
    {"correctIndex":1,"duration":20,"explanation":"雞有 2 隻腳、豬有 4 隻腳：3 隻雞是 3×2=6 隻腳，2 隻豬是 2×4=8 隻腳，加起來是 14 隻腳。","options":["12隻","14隻","16隻","18隻"],"text":"農場裡有 3 隻雞和 2 隻豬，牠們一共有幾隻腳？","type":"question"},
    {"correctIndex":1,"duration":30,"explanation":"假設全部都是雞（2隻腳），10隻雞會有 20 隻腳，比 28 少 8 隻；每把一隻雞換成豬就會多 2 隻腳，8÷2=4，所以有 4 隻豬、6 隻雞。","options":["3隻","4隻","5隻","6隻"],"text":"農場裡雞和豬一共有 10 個頭、28 隻腳，請問豬有幾隻？","type":"question"},
    {"correctIndex":1,"duration":20,"explanation":"設球是x元，球拍是x+100元，兩者相加2x+100=110，解出x=5元。很多人直覺會先猜10元，但那樣球拍跟球只差90元，不符合題目條件。","options":["10元","5元","50元","55元"],"text":"一支球拍加一顆球共 110 元，球拍比球貴 100 元，請問球多少錢？","type":"question"},
    {"correctIndex":1,"duration":20,"explanation":"前7天每天淨爬升1公尺，第8天白天再爬3公尺就直接到10公尺爬出井口，不會再往下滑。","options":["7天","8天","9天","10天"],"text":"蝸牛掉進一口 10 公尺深的井裡，白天往上爬 3 公尺，晚上又往下滑 2 公尺，請問蝸牛要幾天才能爬出井口？","type":"question"},
    {"correctIndex":1,"duration":20,"explanation":"播放速度調成1.5倍，代表原本1分鐘的內容現在只要1÷1.5分鐘就播完，所以總時間是60÷1.5=40分鐘。很多人會直覺算成60×1.5=90分鐘，但那其實是「變慢」的算法，方向剛好相反。","options":["90分鐘","40分鐘","45分鐘","30分鐘"],"text":"小明想追一部 60 分鐘的影片，但時間不夠，於是把播放速度調成 1.5 倍。請問他要花幾分鐘才能看完？","type":"question"},
    {"subtitle":"考考大家對自己身體的了解，原來我們天天帶著這麼多驚奇在身上","title":"第五關：人體冷知識","type":"announcement"},
    {"correctIndex":1,"duration":10,"explanation":"皮膚是人體面積最大、重量也最重的器官。","options":["肝臟","皮膚","大腸","肺"],"text":"人體最大的器官是？","type":"question"},
    {"correctIndex":2,"duration":10,"explanation":"剛出生的嬰兒骨頭數量更多（約300塊），長大後有些會融合變成206塊。","options":["106塊","156塊","206塊","256塊"],"text":"成年人的身體裡大約有多少塊骨頭？","type":"question"},
    {"correctIndex":2,"duration":10,"explanation":"牙齒表面的琺瑯質是人體最堅硬的組織。","options":["骨頭","指甲","牙齒琺瑯質","軟骨"],"text":"人體內最堅硬的部位是？","type":"question"},
    {"correctIndex":2,"duration":10,"explanation":"成人心臟平均每分鐘跳動60~100下，一天下來大約10萬次。","options":["約1萬次","約3萬次","約10萬次","約50萬次"],"text":"心臟平均一天大約跳動幾次？","type":"question"},
    {"correctIndex":1,"duration":10,"explanation":"大腦本身沒有痛覺受器，頭痛其實是來自周圍的血管、肌肉或神經膜。","options":["胃","大腦","心臟","皮膚"],"text":"人體內哪一個器官完全沒有痛覺神經，所以本身不會痛？","type":"question"}
  ]
};
