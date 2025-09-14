package com.pokrew.server.security

import com.pokrew.server.entity.User
import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtUtil(
    @Value("\${jwt.secret}") private val jwtSecret: String,
    @Value("\${jwt.expiration}") private val jwtExpiration: Int
) {
    private val logger = KotlinLogging.logger {}
    private val secretKey: SecretKey = Keys.hmacShaKeyFor(jwtSecret.toByteArray())

    fun generateToken(user: User): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtExpiration)

        return Jwts.builder()
            .subject(user.id.toString())
            .claim("email", user.email)
            .claim("name", user.name)
            .claim("isAdmin", user.isAdmin)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey, Jwts.SIG.HS256)
            .compact()
    }

    fun getUserIdFromToken(token: String): Long? {
        return try {
            val claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .payload

            claims.subject.toLong()
        } catch (ex: Exception) {
            logger.error("Error extracting user ID from token", ex)
            null
        }
    }

    fun getEmailFromToken(token: String): String? {
        return try {
            val claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .payload

            claims["email"] as String
        } catch (ex: Exception) {
            logger.error("Error extracting email from token", ex)
            null
        }
    }

    fun validateToken(token: String): Boolean {
        return try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
            true
        } catch (ex: SecurityException) {
            logger.error("Invalid JWT signature", ex)
            false
        } catch (ex: MalformedJwtException) {
            logger.error("Invalid JWT token", ex)
            false
        } catch (ex: ExpiredJwtException) {
            logger.error("Expired JWT token", ex)
            false
        } catch (ex: UnsupportedJwtException) {
            logger.error("Unsupported JWT token", ex)
            false
        } catch (ex: IllegalArgumentException) {
            logger.error("JWT claims string is empty", ex)
            false
        }
    }
}