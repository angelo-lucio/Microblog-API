# Coding-Richtlinien - Projekt Microblog

Um die Stabilität des Codes und eine reibungslose Zusammenarbeit zu gewährleisten, gelten folgende Regeln.

## Branching-Strategie
Der **`main`** Branch ist ausschließlich für stabile Backups und fertigen Code reserviert.

1.  **Keine direkten Pushes:** Direkte Pushes auf `main` sind untersagt.
2.  **Feature-Branches:** Alle Arbeiten müssen auf separaten Branches erfolgen.
    * *Benennung:* `feature/name`, `fix/beschreibung` oder `refactor/änderung`.
3.  **Pull Requests:** Sobald eine Aufgabe fertig ist, erstelle einen Pull Request (PR) in den `main` Branch.
4.  **Lokales Testen:** Teste deinen Code und das Docker-Setup, bevor du einen Merge anfragst.





## Docker & Datenbank
* **Docker Compose:** Ändere die Ports im `docker-compose.yml` nur wenn nötig (Aufgaben-Verteilung), teile dies dem Team mit.
* **Drizzle ORM:** Wenn du das Schema änderst, füge die generierten Migrationen deinem Commit hinzu, damit alle anderen ihre DB synchronisieren können.

## Commit-Nachrichten
Einfache Präfixe:
* `feat:` Neue Funktionen
* `fix:` Fehlerbehebungen
* `docs:` Änderungen an der Dokumentation
* `style:` Formatierung/Code-Stil

*Beispiel: `feat: Benutzer-Tabelle in Drizzle hinzugefügt`*
