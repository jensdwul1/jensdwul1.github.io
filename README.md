#**Doekeewa**
##1. Installatie
Ga naar github (https://github.com/jensdwul1/jensdwul1.github.io) en kloon de repository.
Ga naar de folder waar je de repository hebt gecloned.
Zorg dat je de volgende depencies geinstalleerd hebt.
- Ruby
- Ruby DevKit
- Bundler
- Jekyll
- GitHub pages

Voer het volgende commando uit: “Bundle install“

##2. Server draaien
Voer het volgende commando uit: “Bundle exec Jekyll serve“
Je kan nu de site lokaal bezoeken op 127.0.0.1:4000.
Dit commando zorgt er ook voor dat alle aanpassingen die je maakt in de code onmiddelijk worden gecompileerd en uitgevoerd. 


##3. Database koppelen
Maak een Google Firebase account aan.
Maak bij **Google Firebase** een nieuwe database aan.
Open het bestand js/services.js
Pas de configuratie in het bestand aan met jou Firebase database.
Alle acties en dergelijke die je nu maakt worden weggeschreven in de nieuwe Firebase Database. 

##4. Database Seeden

Er is slechts een tabel die moet geseed worden vooraleer de applicatie in gebruik kan gaan. 
Open de site lokaal op **127.0.0.1:4000** in een browser naar keuze.
Open de browserconsole (F12) en voer onderstaand commando uit
“seedActivityTypes()“
###*Nu is de database gepopuleerd met alle activiteitstypes en de geassocieerde gewichten.*
