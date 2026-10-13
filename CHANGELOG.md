# Sezon paneli yenilemesi

- 2026/27 sezon başlığı ve arayüz metinleri sadeleştirildi.
- Ana ekranda lig geneli için toplam, doğru, yanlış ve bekleyen tahmin sayıları eklendi. İsabet oranı yalnızca değerlendirilmiş tahminlerden hesaplanır; tahmin girilmemiş maçlar yanlış sayılmaz.
- Kişi seçici kaldırıldı. Maç merkezinde herkesin tahmin dağılımı, maç sonucu, tarih ve takım armaları gösterilir.
- Liderlik tablosunda rozetler korunup açıklamaları netleştirildi; doğru seri, soğuk seri, sürpriz isabet ve isabet eşiği rozetleri eklendi.
- Genel Bakış'ta iki takımı aynı maç haftasında armalarıyla gösteren kart eklendi. Haftanın tüm sonuçları girildiğinde sonraki maç haftası görünür.
- Maç merkezi takım filtrelerinde renk emojileri yerine kulüp armaları kullanılıyor.
- Geç katılan İrfan için ilk maç puan ve seri hesaplarının dışında tutulur; katılım rozeti bunu açıklar.
- Maç merkezinde isim sırasıyla katılımcı tahminleri açılabilir; doğru/yanlış durumu maç sonucu girildikten sonra gösterilir.
- Mobil başlık için UEFA wordmark'ı beyaz düzenlendi, takım armaları ve maç kartları küçültüldü; küçük ekranda genel bakış başlığı sızıntısı giderildi.
- Sezon istatistikleri takım sonuçları, topluluk tercihleri ve maç bazında isabet oranını içerir.
- Yönetim ekranı, sonuç kaydı, yedek indirme ve Firebase veri şeması korunmuştur.
- Üst marka alanı Şampiyonlar Ligi arması ve arka planı şeffaf `_crew` logosuyla yenilendi; “Tahmin Ligi” metni ve yıldız süsleri kaldırıldı.
- Bağlantı metni, mavi/kırmızı erişilebilir durum LED'iyle değiştirildi; sayfa numaraları ve liderlikteki otomatik güncelleme notu kaldırıldı.
- Liderlik tablosuna son beş sonuç için kişi bazında doğru, yanlış ve tahmin yok göstergeleri eklendi; dar ekranda tablo katılımcı kartlarına dönüşür.
- Maç merkezi alt açıklaması kaldırıldı, yönetim sekmesi simgeye indirildi.
- Genel bakışta maç ve tarihi ayrı satırlara aldım, mobilde bağlantı ışığını logolarla aynı hizaya getirdim.
- İrfan'ın boş ilk maç tahmini yanlış sayılmaz ve puan getirmez; giriş yok durumu hem maç listesinde hem form kutusunda açıkça gösterilir.
- Rozet açıklamaları daha doğal Türkçeyle yenilendi; liderlik, maç ve istatistik başlıklarındaki istenmeyen başlık/açıklamalar kaldırıldı.

### Veri ve yayın notu

Mevcut Firestore dokümanı ve kullanıcı/tahmin şeması korunur. İstatistikler kaydedilmiş veriden istemci tarafında hesaplanır; veri göçü gerekmez.
