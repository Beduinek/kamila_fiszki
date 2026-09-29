# kamila_fiszki
# Kamila Fiszki ❤️

Prosta aplikacja webowa do nauki słówek angielskich za pomocą fiszek.

Projekt został przygotowany z myślą o wygodnej nauce na:
- telefonie,
- tablecie,
- komputerze.

## Funkcje

- fiszki EN → PL
- fiszki PL → EN
- tryb mieszany
- losowa kolejność słówek
- obracanie fiszki po kliknięciu
- oznaczanie słówek jako:
  - Umiem ✅
  - Powtórz 🔁
- licznik postępu
- lista trudnych słówek
- możliwość powtarzania trudnych słówek
- zapisywanie postępu w pamięci przeglądarki
- możliwość wznowienia nauki po ponownym otwarciu strony
- responsywny wygląd na telefonie i tablecie
- możliwość używania aplikacji z ekranu głównego telefonu

## Pliki projektu

- `index.html` – struktura aplikacji
- `style.css` – wygląd aplikacji
- `app.js` – logika fiszek
- `words.js` – baza słówek
- `manifest.json` – konfiguracja aplikacji PWA
- `sw.js` – obsługa działania aplikacji jako PWA

## Baza słówek

Słówka znajdują się w pliku:

`words.js`

Przykład:

```js
const words = [
  { en: "apple", pl: "jabłko" },
  { en: "house", pl: "dom" },
  { en: "chair", pl: "krzesło" }
];
