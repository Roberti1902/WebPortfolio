package com.example.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Nur für die lokale Entwicklung: ahmt contact.php nach, damit das Formular lokal testbar ist.
 * Verschickt nichts, schreibt die Anfrage nur ins Log. Auf IONOS übernimmt deploy/contact.php.
 */
@RestController
public class DevContactController {

    private static final Logger log = LoggerFactory.getLogger(DevContactController.class);

    @PostMapping("/contact.php")
    public ResponseEntity<Map<String, Object>> contact(@RequestParam Map<String, String> form) {
        boolean valid = form.containsKey("topic") && !form.getOrDefault("email", "").isBlank()
                && !form.getOrDefault("message", "").isBlank() && "yes".equals(form.get("consent"));
        log.info("[DEV] Kontaktanfrage (wird lokal nicht versendet): {}", form);
        return valid ? ResponseEntity.ok(Map.of("ok", true)) : ResponseEntity.unprocessableEntity().body(Map.of("ok", false));
    }
}
