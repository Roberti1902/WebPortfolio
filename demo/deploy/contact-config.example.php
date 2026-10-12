<?php
/*
 * VORLAGE – so einrichten:
 * 1. Datei kopieren und in "contact-config.php" umbenennen
 * 2. Adressen unten eintragen
 * 3. Per IONOS-Webspace in den Ordner "/" hochladen, also EINE EBENE ÜBER htdocs (nicht in htdocs!)
 *    Dort kann sie niemand über den Browser aufrufen, deine Adresse bleibt privat.
 * Die echte contact-config.php ist in .gitignore eingetragen und landet nie auf GitHub.
 */
return [
    'to'   => 'deine-adresse@example.com',     // hierhin werden die Anfragen geschickt
    'from' => 'kontakt@robertionescu.de',      // Absender: muss ein Postfach deiner IONOS-Domain sein
];
