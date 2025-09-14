package com.pokrew.server.dto

data class AuthResponse(
    val token: String,
    val user: UserResponse
)

data class UserResponse(
    val id: Long,
    val name: String,
    val email: String,
    val points: Int,
    val availablePoints: Int,
    val isAdmin: Boolean,
    val createdAt: String
)