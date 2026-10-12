package com.example.demo;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;

/**
 * Versionsnummer für CSS/JS/Texte (Hash über deren Inhalt). Wird als ?v=... an die URLs gehängt,
 * damit Browser nach jeder Änderung sofort die neue Datei laden statt einer alten aus dem Cache.
 * In Templates: ${@assets.version}
 */
@Component("assets")
public class AssetVersion {

    private final String version;

    public AssetVersion() throws IOException, NoSuchAlgorithmException {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        List<Resource> files = new ArrayList<>();
        for (String pattern : List.of("classpath:static/css/*.css", "classpath:static/javascript/*.js", "classpath:static/locales/*.json")) {
            files.addAll(List.of(resolver.getResources(pattern)));
        }
        files.sort(Comparator.comparing(Resource::getFilename));

        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        for (Resource file : files) {
            try (InputStream in = file.getInputStream()) {
                sha.update(in.readAllBytes());
            }
        }
        this.version = HexFormat.of().formatHex(sha.digest()).substring(0, 10);
    }

    public String getVersion() {
        return version;
    }
}
