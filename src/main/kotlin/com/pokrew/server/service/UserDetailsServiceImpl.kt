package com.pokrew.server.service

import com.pokrew.server.repository.UserRepository
import com.pokrew.server.security.UserPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class UserDetailsServiceImpl(
    private val userRepository: UserRepository
) : UserDetailsService {

    override fun loadUserByUsername(email: String): UserDetails {
        val user = userRepository.findByEmail(email)
            .orElseThrow { UsernameNotFoundException("사용자를 찾을 수 없습니다: $email") }

        return UserPrincipal.create(user)
    }
}