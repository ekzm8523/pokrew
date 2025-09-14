package com.pokrew.server.service

import com.pokrew.server.entity.User
import com.pokrew.server.exception.AuthenticationException
import com.pokrew.server.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {
    fun authenticate(email: String, password: String): User {
        val user = userRepository.findByEmail(email)
            .orElseThrow { AuthenticationException("이메일 또는 비밀번호가 올바르지 않습니다.") }

        if (!passwordEncoder.matches(password, user.password)) {
            throw AuthenticationException("이메일 또는 비밀번호가 올바르지 않습니다.")
        }

        return user
    }
}