package com.pokrew.server.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import java.time.LocalDateTime

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val name: String,

    @Column(nullable = false, unique = true)
    val email: String,

    @Column(nullable = false)
    val password: String,

    @Column(nullable = false)
    val points: Int = 1500,

    @Column(name = "available_points", nullable = false)
    val availablePoints: Int = 1500,

    @Column(name = "is_admin", nullable = false)
    val isAdmin: Boolean = false,

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    val pendingPoints: Int
        get() = points - availablePoints
}