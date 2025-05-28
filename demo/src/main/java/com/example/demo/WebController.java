package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class WebController {

    @RequestMapping(path="/", method = RequestMethod.GET)
    public String index() {
        return "main";
    }

    @RequestMapping(path="/technical", method = RequestMethod.GET)
    public String techportfolio() {
        return "technical";
    }

    @RequestMapping(path="/3d", method = RequestMethod.GET)
    public String cgportfolio() {
        return "3d";
    }

    @RequestMapping(path="/about", method = RequestMethod.GET)
    public String about() {
        return "about";
    }

    @RequestMapping(path="/project1tech", method = RequestMethod.GET)
    public String techproj1() {
        return "project1tech";
    }

    @RequestMapping(path="/project2tech", method = RequestMethod.GET)
    public String techproj2() {
        return "project2tech";
    }

    @RequestMapping(path="/project3tech", method = RequestMethod.GET)
    public String techproj3() {
        return "project3tech";
    }

    @RequestMapping(path="/project13d", method = RequestMethod.GET)
    public String cgproj1() {
        return "project13d";
    }

    @RequestMapping(path="/project23d", method = RequestMethod.GET)
    public String cgproj2() {
        return "project23d";
    }

    @RequestMapping(path="/project33d", method = RequestMethod.GET)
    public String cgproj3() {
        return "project33d";
    }


}
