package com.example.demo;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class WebportfolioApplicationTests {

    private static final Path RESOURCES = Path.of("src/main/resources");

    @Autowired
    private MockMvc mvc;

    @Autowired
    private TestRestTemplate rest;

    @Test
    void allPagesRenderWithTitleAndSecurityHeaders() throws Exception {
        for (String path : List.of("/", "/technical", "/3d",
                "/project2tech", "/project13d", "/project23d", "/project33d")) {
            mvc.perform(get(path))
                    .andExpect(status().isOk())
                    .andExpect(header().exists("Content-Security-Policy"))
                    .andExpect(content().string(org.hamcrest.Matchers.containsString("Robert Ionescu")));
        }
    }

    @Test
    void unknownPageShowsStyledNotFound() {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.TEXT_HTML));
        ResponseEntity<String> response = rest.exchange("/gibts-nicht", HttpMethod.GET, new HttpEntity<>(headers), String.class);
        assertEquals(404, response.getStatusCode().value());
        assertTrue(response.getBody().contains("data-i18n=\"error.title\""));
    }

    /** Jeder data-i18n-Key aus den Templates muss in de.json und en.json existieren (fr faellt auf en zurueck). */
    @Test
    void everyTranslationKeyExistsInGermanAndEnglish() throws IOException {
        TreeSet<String> keys = new TreeSet<>();
        Matcher m;
        try (Stream<Path> files = Files.walk(RESOURCES.resolve("templates"))) {
            for (Path file : files.filter(f -> f.toString().endsWith(".html")).toList()) {
                m = Pattern.compile("data-i18n(?:-placeholder)?=\"([^\"]+)\"").matcher(Files.readString(file));
                while (m.find()) keys.add(m.group(1));
            }
        }
        ObjectMapper mapper = new ObjectMapper();
        for (String lang : List.of("de", "en")) {
            JsonNode json = mapper.readTree(RESOURCES.resolve("static/locales/" + lang + ".json").toFile());
            for (String key : keys) {
                assertTrue(json.at("/" + key.replace('.', '/')).isTextual(), lang + ".json: Key fehlt -> " + key);
            }
        }
    }
}
