package com.pokrew.server.controller

import com.pokrew.server.dto.AuthRequest
import com.pokrew.server.dto.AuthResponse
import com.pokrew.server.dto.UserResponse
import com.pokrew.server.security.JwtUtil
import com.pokrew.server.security.UserPrincipal
import com.pokrew.server.service.AuthService
import com.pokrew.server.service.UserService
import jakarta.validation.Valid
import mu.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = ["*"])
class AuthController(
    private val authService: AuthService,
    private val userService: UserService,
    private val jwtUtil: JwtUtil
) {
    private val logger = KotlinLogging.logger {}

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: AuthRequest): ResponseEntity<AuthResponse> {
        return try {
            val user = authService.authenticate(request.email, request.password)
            val token = jwtUtil.generateToken(user)

            val userResponse = UserResponse(
                id = user.id,
                name = user.name,
                email = user.email,
                points = user.points,
                availablePoints = user.availablePoints,
                isAdmin = user.isAdmin,
                createdAt = user.createdAt.toString()
            )

            ResponseEntity.ok(AuthResponse(token, userResponse))
        } catch (ex: Exception) {
            logger.error("Login failed for email: ${request.email}", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/me")
    fun getCurrentUser(): ResponseEntity<Map<String, UserResponse>> {
        return try {
            val userPrincipal = SecurityContextHolder.getContext().authentication.principal as UserPrincipal
            val user = userService.findById(userPrincipal.id)

            val userResponse = UserResponse(
                id = user.id,
                name = user.name,
                email = user.email,
                points = user.points,
                availablePoints = user.availablePoints,
                isAdmin = user.isAdmin,
                createdAt = user.createdAt.toString()
            )

            ResponseEntity.ok(mapOf("user" to userResponse))
        } catch (ex: Exception) {
            logger.error("Failed to get current user", ex)
            ResponseEntity.badRequest().build()
        }
    }
}