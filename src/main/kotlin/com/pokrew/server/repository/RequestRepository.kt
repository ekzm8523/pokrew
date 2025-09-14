package com.pokrew.server.repository

import com.pokrew.server.entity.Request
import com.pokrew.server.entity.RequestStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface RequestRepository : JpaRepository<Request, Long> {
    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<Request>

    fun findByStatusOrderByCreatedAtDesc(status: RequestStatus): List<Request>

    fun countByStatus(status: RequestStatus): Long

    @Query("SELECT r FROM Request r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.product WHERE r.id = :id")
    fun findByIdWithDetails(@Param("id") id: Long): Request?

    @Query("SELECT r FROM Request r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.product ORDER BY r.createdAt DESC")
    fun findAllWithDetails(): List<Request>
}