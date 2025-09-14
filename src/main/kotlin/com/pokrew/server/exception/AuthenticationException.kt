package com.pokrew.server.exception

class AuthenticationException(message: String) : RuntimeException(message)

class ResourceNotFoundException(message: String) : RuntimeException(message)

class BadRequestException(message: String) : RuntimeException(message)