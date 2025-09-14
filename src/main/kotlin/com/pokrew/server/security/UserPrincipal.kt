package com.pokrew.server.security

import com.pokrew.server.entity.User
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

class UserPrincipal(
    private val user: User
) : UserDetails {

    val id: Long = user.id
    val name: String = user.name
    val email: String = user.email
    val points: Int = user.points
    val availablePoints: Int = user.availablePoints
    val isAdmin: Boolean = user.isAdmin

    override fun getAuthorities(): Collection<GrantedAuthority> {
        return if (user.isAdmin) {
            listOf(SimpleGrantedAuthority("ROLE_ADMIN"), SimpleGrantedAuthority("ROLE_USER"))
        } else {
            listOf(SimpleGrantedAuthority("ROLE_USER"))
        }
    }

    override fun getPassword(): String = user.password

    override fun getUsername(): String = user.email

    override fun isAccountNonExpired(): Boolean = true

    override fun isAccountNonLocked(): Boolean = true

    override fun isCredentialsNonExpired(): Boolean = true

    override fun isEnabled(): Boolean = true

    companion object {
        fun create(user: User): UserPrincipal {
            return UserPrincipal(user)
        }
    }
}