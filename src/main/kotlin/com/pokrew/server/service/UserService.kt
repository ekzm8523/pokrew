package com.pokrew.server.service

import com.pokrew.server.entity.PointHistory
import com.pokrew.server.entity.PointType
import com.pokrew.server.entity.User
import com.pokrew.server.exception.BadRequestException
import com.pokrew.server.exception.ResourceNotFoundException
import com.pokrew.server.repository.PointHistoryRepository
import com.pokrew.server.repository.UserRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository,
    private val pointHistoryRepository: PointHistoryRepository
) {
    fun findById(id: Long): User {
        return userRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("사용자를 찾을 수 없습니다.") }
    }

    fun findAll(): List<User> {
        return userRepository.findAll()
    }

    @Transactional
    fun adjustPoints(userId: Long, type: PointType, amount: Int, reason: String): User {
        val user = findById(userId)
        val pointChange = if (type == PointType.DEPOSIT) amount else -amount

        val newPoints = user.points + pointChange
        val newAvailablePoints = user.availablePoints + pointChange

        if (newPoints < 0) {
            throw BadRequestException("포인트가 부족합니다.")
        }

        val updatedUser = user.copy(
            points = newPoints,
            availablePoints = newAvailablePoints
        )

        val savedUser = userRepository.save(updatedUser)

        // 포인트 내역 기록
        val pointHistory = PointHistory(
            userId = userId,
            type = type,
            amount = amount,
            reason = reason
        )
        pointHistoryRepository.save(pointHistory)

        return savedUser
    }

    fun getUserPointHistory(userId: Long): List<PointHistory> {
        return pointHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId)
    }

    fun deleteUser(id: Long, currentUserId: Long) {
        if (id == currentUserId) {
            throw BadRequestException("자신을 삭제할 수 없습니다.")
        }

        if (!userRepository.existsById(id)) {
            throw ResourceNotFoundException("사용자를 찾을 수 없습니다.")
        }

        userRepository.deleteById(id)
    }

    fun getTotalMemberCount(): Long {
        return userRepository.getTotalMemberCount()
    }

    fun getTotalPoints(): Long {
        return userRepository.getTotalPoints() ?: 0L
    }

    fun getTotalAvailablePoints(): Long {
        return userRepository.getTotalAvailablePoints() ?: 0L
    }

    fun save(user: User): User {
        return userRepository.save(user)
    }
}