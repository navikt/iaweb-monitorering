Monitoreringsapp for IA-web
================

Henter resultater fra selftestene til iawebsolr, iawebnav og iawebinternal, og eksponerer disse som Prometheus-gauges. Dette vises i Grafana, og brukes som basis for slack-alerts.

# Komme i gang

- Installere avhengigheter:  `npm install`
- Starte applikasjonen: `npm start`

---

# Kjøre/teste lokalt med Docker

  1. `npm install`
  2. `docker build -t iaweb-monitorering .`
  3. `docker run -d -p 8080:8080 iaweb-monitorering`
  4. For å stoppe, kjør `docker stop <id>` med id-en fra forrige kommando
  5. Tilgang til CLI, kjør `docker exec -it <id> /bin/sh`
  6. Verifiser at applikasjon kjører: http://localhost:8080/iaweb-monitorering/internal/selftester eller http://localhost:8080/iaweb-monitorering/internal/isAlive

---

# Upgrade dependencies

- bruk "ncu" kommand for check
- bruk "ncu -u" for oppgradering 

---

# Henvendelser

## For Nav-ansatte
* Dette Git-repositoriet eies av [Team IA i Produktområde arbeidsgiver](https://navno.sharepoint.com/sites/intranett-prosjekter-og-utvikling/SitePages/Produktomr%C3%A5de-arbeidsgiver.aspx).
* Slack-kanaler:
    * [#arbeidsgiver-teamia-utvikling](https://nav-it.slack.com/archives/C016KJA7CFK)
    * [#arbeidsgiver-utvikling](https://nav-it.slack.com/archives/CD4MES6BB)
    * [#arbeidsgiver-general](https://nav-it.slack.com/archives/CCM649PDH)

## For folk utenfor Nav
* Opprett gjerne en issue i Github for alle typer spørsmål
* IT-utviklerne i Github-teamet https://github.com/orgs/navikt/teams/arbeidsgiver
* IT-avdelingen i [Arbeids- og velferdsdirektoratet](https://www.nav.no/no/NAV+og+samfunn/Kontakt+NAV/Relatert+informasjon/arbeids-og-velferdsdirektoratet-kontorinformasjon)
