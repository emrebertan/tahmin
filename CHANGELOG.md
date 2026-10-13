# Sürüm notları

## 2.0 — Şampiyonlar Ligi sezon paneli

- Arayüz 2026/27 sezonu için yenilendi; başlık ve marka alanı güncellendi.
- Genel Bakış sekmesine sıradaki maç, sezon özeti, ilk üç ve son sonuçlar eklendi.
- Liderlik tablosunda puan, tamamlanan sonuçlardaki isabet oranı ve rozet açıklamaları bir araya getirildi.
- Maç Merkezi'nde Galatasaray/Fenerbahçe filtresi ve yatay, okunaklı maç satırları kullanılıyor. Tahminler katılımcılar adına kilitli kalıyor.
- İstatistikler sekmesi maç sonuçlarından otomatik takım performansı, topluluk tahmini dağılımı, maç başına isabet ve tahminci formu hesaplıyor.
- Yönetim ekranından sonuç girme, dışa aktarma ve Firebase senkronizasyonu korunuyor.
- Mobil görünüm, odak göstergeleri ve azaltılmış hareket tercihi iyileştirildi.

### Veri ve yayın notu

Mevcut Firestore koleksiyon/doküman adı ve kullanıcı/tahmin şeması korunmuştur. Yeni istatistikler saklanan veriden istemci tarafında hesaplanır; veri göçü gerekmez.
