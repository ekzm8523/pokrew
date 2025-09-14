package com.pokrew.server.repository

import com.pokrew.server.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByEmail(email: String): Optional<User>
    fun existsByEmail(email: String): Boolean

    @Query("SELECT COUNT(u) FROM User u")
    fun getTotalMemberCount(): Long

    @Query("SELECT SUM(u.points) FROM User u")
    fun getTotalPoints(): Long?

    @Query("SELECT SUM(u.availablePoints) FROM User u")
    fun getTotalAvailablePoints(): Long?
}