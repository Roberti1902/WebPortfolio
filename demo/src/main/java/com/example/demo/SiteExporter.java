package com.example.demo;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.List;
import java.util.TreeSet;
import java.util.stream.Stream;

/**
 * Erzeugt die statische Website für das IONOS-Webhosting (dort läuft kein Java):
 * startet die App kurz, speichert jede Seite als .html, kopiert static/ und deploy/ dazu.
 * Aufruf: ./gradlew exportSite  ->  Inhalt von build/site nach htdocs hochladen.
 */
public class SiteExporter {

    public static void main(String[] args) throws Exception {
        Path out = Path.of(args[0]);
        Path projectDir = Path.of(args[1]);
        System.setProperty("spring.devtools.restart.enabled", "false"); // sonst startet DevTools main() ohne Argumente neu

        ConfigurableApplicationContext ctx = new SpringApplicationBuilder(WebportfolioApplication.class)
                .properties("server.port=0", "spring.main.banner-mode=off")
                .run();
        try {
            int port = ((WebServerApplicationContext) ctx).getWebServer().getPort();
            HttpClient http = HttpClient.newHttpClient();

            deleteRecursively(out);
            Files.createDirectories(out);

            // alle GET-Routen aus den Controllern: "/" -> index.html, "/technical" -> technical.html
            TreeSet<String> routes = new TreeSet<>();
            ctx.getBean("requestMappingHandlerMapping", RequestMappingHandlerMapping.class).getHandlerMethods().forEach((info, method) -> {
                if (info.getMethodsCondition().getMethods().contains(RequestMethod.GET)) {
                    routes.addAll(info.getPatternValues());
                }
            });
            routes.remove("/error");

            for (String route : routes) {
                String file = route.equals("/") ? "index.html" : route.substring(1) + ".html";
                Files.writeString(out.resolve(file), fetch(http, port, route, 200));
                System.out.println("  Seite   " + route + " -> " + file);
            }
            Files.writeString(out.resolve("404.html"), fetch(http, port, "/__export-404", 404));
            System.out.println("  Seite   404 -> 404.html");

            copyRecursively(projectDir.resolve("src/main/resources/static"), out);
            for (String name : List.of(".htaccess")) {
                Files.copy(projectDir.resolve("deploy").resolve(name), out.resolve(name), StandardCopyOption.REPLACE_EXISTING);
            }

            System.out.println("\nFertig: " + out.toAbsolutePath() + "  ->  kompletten Inhalt nach IONOS /htdocs hochladen.");
        } finally {
            ctx.close();
        }
        System.exit(0); // DevTools-Threads nicht abwarten
    }

    private static String fetch(HttpClient http, int port, String path, int expectedStatus) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .header("Accept", "text/html").build();
        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != expectedStatus) {
            throw new IllegalStateException(path + " lieferte Status " + response.statusCode());
        }
        return response.body();
    }


    private static void copyRecursively(Path from, Path to) throws IOException {
        try (Stream<Path> paths = Files.walk(from)) {
            for (Path source : paths.toList()) {
                Path target = to.resolve(from.relativize(source).toString());
                if (Files.isDirectory(source)) {
                    Files.createDirectories(target);
                } else {
                    Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
                }
            }
        }
    }

    private static void deleteRecursively(Path dir) throws IOException {
        if (!Files.exists(dir)) return;
        try (Stream<Path> paths = Files.walk(dir)) {
            for (Path p : paths.sorted(Comparator.reverseOrder()).toList()) {
                Files.delete(p);
            }
        }
    }
}
