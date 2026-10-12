package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class WebportfolioApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebportfolioApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void printPort(ApplicationReadyEvent event) {
		String port = event.getApplicationContext().getEnvironment().getProperty("local.server.port");
		System.out.println("Server läuft auf Port: " + port);
	}

}
