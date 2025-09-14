package com.pokrew.server.service

import com.pokrew.server.entity.*
import com.pokrew.server.exception.BadRequestException
import com.pokrew.server.exception.ResourceNotFoundException
import com.pokrew.server.repository.RequestRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service

@Service
class RequestService(
    private val requestRepository: RequestRepository,
    private val userService: UserService,
    private val productService: ProductService
) {
    fun findAll(): List<Request> {
        return requestRepository.findAllWithDetails()
    }

    fun findPendingRequests(): List<Request> {
        return requestRepository.findByStatusOrderByCreatedAtDesc(RequestStatus.PENDING)
    }

    fun findByUserId(userId: Long): List<Request> {
        return requestRepository.findByUserIdOrderByCreatedAtDesc(userId)
    }

    fun findById(id: Long): Request {
        return requestRepository.findByIdWithDetails(id)
            ?: throw ResourceNotFoundException("요청을 찾을 수 없습니다.")
    }

    @Transactional
    fun createRequest(userId: Long, productId: Long, quantity: Int): Request {
        val user = userService.findById(userId)
        val product = productService.findById(productId)

        val totalAmount = product.price * quantity

        if (user.availablePoints < totalAmount) {
            throw BadRequestException("사용 가능한 포인트가 부족합니다.")
        }

        // 사용자 포인트 차감 (임시 보관)
        val updatedUser = user.copy(availablePoints = user.availablePoints - totalAmount)
        userService.save(updatedUser)

        val request = Request(
            userId = userId,
            productId = productId,
            quantity = quantity,
            amount = totalAmount,
            pendingAmount = totalAmount,
            status = RequestStatus.PENDING
        )

        return requestRepository.save(request)
    }

    @Transactional
    fun approveRequest(id: Long): Request {
        val request = findById(id)

        if (request.status != RequestStatus.PENDING) {
            throw BadRequestException("대기중인 요청만 승인할 수 있습니다.")
        }

        val user = userService.findById(request.userId)

        // 실제 포인트 차감
        val updatedUser = user.copy(
            points = user.points - request.amount
        )
        userService.save(updatedUser)

        // 요청 상태 업데이트
        val approvedRequest = request.copy(
            status = RequestStatus.APPROVED,
            pendingAmount = 0
        )

        return requestRepository.save(approvedRequest)
    }

    @Transactional
    fun rejectRequest(id: Long): Request {
        val request = findById(id)

        if (request.status != RequestStatus.PENDING) {
            throw BadRequestException("대기중인 요청만 거부할 수 있습니다.")
        }

        val user = userService.findById(request.userId)

        // 임시 보관된 포인트 복원
        val updatedUser = user.copy(
            availablePoints = user.availablePoints + request.amount
        )
        userService.save(updatedUser)

        // 요청 상태 업데이트
        val rejectedRequest = request.copy(
            status = RequestStatus.REJECTED,
            pendingAmount = 0
        )

        return requestRepository.save(rejectedRequest)
    }

    fun getPendingRequestCount(): Long {
        return requestRepository.countByStatus(RequestStatus.PENDING)
    }
}