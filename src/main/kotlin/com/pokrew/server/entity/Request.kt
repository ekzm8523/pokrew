package com.pokrew.server.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import java.time.LocalDateTime

@Entity
@Table(name = "requests")
data class Request(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(name = "product_id", nullable = false)
    val productId: Long,

    @Column(nullable = false)
    val quantity: Int,

    @Column(nullable = false)
    val amount: Int,

    @Column(name = "pending_amount", nullable = false)
    val pendingAmount: Int = 0,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: RequestStatus = RequestStatus.PENDING,

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    val user: User? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    val product: Product? = null
)

enum class RequestStatus(val koreanName: String) {
    PENDING("대기중"),
    APPROVED("승인됨"),
    REJECTED("거부됨")
}