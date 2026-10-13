# Sezon paneli yenilemesi

- 2026/27 sezon başlığı ve arayüz metinleri sadeleştirildi.
- Ana ekranda lig geneli için toplam, doğru, yanlış ve bekleyen tahmin sayıları eklendi. İsabet oranı yalnızca değerlendirilmiş tahminlerden hesaplanır; tahmin girilmemiş maçlar yanlış sayılmaz.
- Kişi seçici kaldırıldı. Maç merkezinde herkesin tahmin dağılımı, maç sonucu, tarih ve takım armaları gösterilir.
- Liderlik tablosunda rozetler korunup açıklamaları netleştirildi; doğru seri, soğuk seri, sürpriz isabet ve isabet eşiği rozetleri eklendi.
- Sezon istatistikleri takım sonuçları, topluluk tercihleri ve maç bazında isabet oranını içerir.
- Yönetim ekranı, sonuç kaydı, yedek indirme ve Firebase veri şeması korunmuştur.

### Veri ve yayın notu

Mevcut Firestore dokümanı ve kullanıcı/tahmin şeması korunur. İstatistikler kaydedilmiş veriden istemci tarafında hesaplanır; veri göçü gerekmez.
