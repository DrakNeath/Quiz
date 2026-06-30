# Quizshow Online Live

Diese Version synchronisiert Host und Spieler live über Socket.io.

## Lokal starten

```bash
npm install
npm start
```

Dann öffnen:

```text
http://localhost:3000
```

Du kannst zum Testen mehrere Browser-Tabs öffnen. Wenn der Host einen Spieler hinzufügt, erscheint er auch in den anderen Tabs.

## Wichtig

Die Spielzustände werden live synchronisiert:
- Spieler
- Leben
- Voting
- Timer
- Fragen
- Wer gerade dran ist

Browser-Kameras werden aus Sicherheitsgründen nicht direkt über Socket.io übertragen. Kamera-Links funktionieren weiterhin.
