package com.pokrew.server.service

import com.pokrew.server.entity.User
import com.pokrew.server.exception.AuthenticationException
import com.pokrew.server.repository.UserRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.LocalDateTime
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class AuthServiceTest {

    private lateinit var authService: AuthService
    private lateinit var userRepository: UserRepository
    private lateinit var passwordEncoder: PasswordEncoder

    @BeforeEach
    fun setUp() {
        userRepository = mockk()
        passwordEncoder = mockk()
        authService = AuthService(userRepository, passwordEncoder)
    }

    @Test
    fun `유효한 이메일과 비밀번호로 로그인 성공`() {
        // Given
        val email = "test@example.com"
        val password = "password"
        val encodedPassword = "\$2a\$10\$hashedPassword"

        val user = User(
            id = 1L,
            name = "Test User",
            email = email,
            password = encodedPassword,
            points = 1500,
            availablePoints = 1500,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        every { userRepository.findByEmail(email) } returns Optional.of(user)
        every { passwordEncoder.matches(password, encodedPassword) } returns true

        // When
        val result = authService.authenticate(email, password)

        // Then
        assertNotNull(result)
        assertEquals(user.email, result.email)
        assertEquals(user.name, result.name)
        verify { userRepository.findByEmail(email) }
        verify { passwordEncoder.matches(password, encodedPassword) }
    }

    @Test
    fun `존재하지 않는 이메일로 로그인 실패`() {
        // Given
        val email = "nonexistent@example.com"
        val password = "password"

        every { userRepository.findByEmail(email) } returns Optional.empty()

        // When & Then
        val exception = assertThrows<AuthenticationException> {
            authService.authenticate(email, password)
        }
        assertEquals("이메일 또는 비밀번호가 올바르지 않습니다.", exception.message)
        verify { userRepository.findByEmail(email) }
    }

    @Test
    fun `잘못된 비밀번호로 로그인 실패`() {
        // Given
        val email = "test@example.com"
        val password = "wrongpassword"
        val encodedPassword = "\$2a\$10\$hashedPassword"

        val user = User(
            id = 1L,
            name = "Test User",
            email = email,
            password = encodedPassword,
            points = 1500,
            availablePoints = 1500,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        every { userRepository.findByEmail(email) } returns Optional.of(user)
        every { passwordEncoder.matches(password, encodedPassword) } returns false

        // When & Then
        val exception = assertThrows<AuthenticationException> {
            authService.authenticate(email, password)
        }
        assertEquals("이메일 또는 비밀번호가 올바르지 않습니다.", exception.message)
        verify { userRepository.findByEmail(email) }
        verify { passwordEncoder.matches(password, encodedPassword) }
    }

    @Test
    fun `관리자 계정 로그인 성공`() {
        // Given
        val email = "admin@example.com"
        val password = "password"
        val encodedPassword = "\$2a\$10\$hashedPassword"

        val adminUser = User(
            id = 1L,
            name = "Admin User",
            email = email,
            password = encodedPassword,
            points = 1500,
            availablePoints = 1500,
            isAdmin = true,
            createdAt = LocalDateTime.now()
        )

        every { userRepository.findByEmail(email) } returns Optional.of(adminUser)
        every { passwordEncoder.matches(password, encodedPassword) } returns true

        // When
        val result = authService.authenticate(email, password)

        // Then
        assertNotNull(result)
        assertEquals(true, result.isAdmin)
        assertEquals(adminUser.email, result.email)
    }

    @Test
    fun `특수문자 포함 비밀번호 처리`() {
        // Given
        val email = "test@example.com"
        val password = "p@ssw0rd!@#\$%"
        val encodedPassword = "\$2a\$10\$hashedPassword"

        val user = User(
            id = 1L,
            name = "Test User",
            email = email,
            password = encodedPassword,
            points = 1500,
            availablePoints = 1500,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        every { userRepository.findByEmail(email) } returns Optional.of(user)
        every { passwordEncoder.matches(password, encodedPassword) } returns true

        // When
        val result = authService.authenticate(email, password)

        // Then
        assertNotNull(result)
        assertEquals(user.email, result.email)
    }
}