package com.pokrew.server.repository

import com.pokrew.server.entity.PointHistory
import com.pokrew.server.entity.PointType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface PointHistoryRepository : JpaRepository<PointHistory, Long> {
    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<PointHistory>

    @Query("SELECT ph FROM PointHistory ph LEFT JOIN FETCH ph.user ORDER BY ph.createdAt DESC")
    fun findAllWithUser(): List<PointHistory>

    @Query("""
        SELECT ph FROM PointHistory ph
        LEFT JOIN FETCH ph.user
        ORDER BY ph.createdAt DESC
    """)
    fun findTop50ByOrderByCreatedAtDesc(): List<PointHistory>

    @Query("""
        SELECT SUM(ph.amount) FROM PointHistory ph
        WHERE ph.userId = :userId
        AND ph.type = :type
        AND ph.createdAt >= :startDate
    """)
    fun sumAmountByUserIdAndTypeAfterDate(
        @Param("userId") userId: Long,
        @Param("type") type: PointType,
        @Param("startDate") startDate: LocalDateTime
    ): Long?
}