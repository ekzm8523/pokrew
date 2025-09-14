package com.pokrew.server

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class PokrewServerApplication

fun main(args: Array<String>) {
    runApplication<PokrewServerApplication>(*args)
}