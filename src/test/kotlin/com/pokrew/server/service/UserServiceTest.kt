package com.pokrew.server.service

import com.pokrew.server.entity.PointHistory
import com.pokrew.server.entity.PointType
import com.pokrew.server.entity.User
import com.pokrew.server.exception.BadRequestException
import com.pokrew.server.exception.ResourceNotFoundException
import com.pokrew.server.repository.PointHistoryRepository
import com.pokrew.server.repository.UserRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.LocalDateTime
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class UserServiceTest {

    private lateinit var userService: UserService
    private lateinit var userRepository: UserRepository
    private lateinit var pointHistoryRepository: PointHistoryRepository

    @BeforeEach
    fun setUp() {
        userRepository = mockk()
        pointHistoryRepository = mockk()
        userService = UserService(userRepository, pointHistoryRepository)
    }

    @Test
    fun `사용자 ID로 조회 성공`() {
        // Given
        val userId = 1L
        val user = User(
            id = userId,
            name = "Test User",
            email = "test@example.com",
            password = "hashedPassword",
            points = 1500,
            availablePoints = 1500,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        every { userRepository.findById(userId) } returns Optional.of(user)

        // When
        val result = userService.findById(userId)

        // Then
        assertNotNull(result)
        assertEquals(user.id, result.id)
        assertEquals(user.name, result.name)
        verify { userRepository.findById(userId) }
    }

    @Test
    fun `존재하지 않는 사용자 조회 시 예외 발생`() {
        // Given
        val userId = 999L
        every { userRepository.findById(userId) } returns Optional.empty()

        // When & Then
        val exception = assertThrows<ResourceNotFoundException> {
            userService.findById(userId)
        }
        assertEquals("사용자를 찾을 수 없습니다.", exception.message)
    }

    @Test
    fun `포인트 입금 성공`() {
        // Given
        val userId = 1L
        val amount = 1000
        val reason = "보너스 지급"

        val originalUser = User(
            id = userId,
            name = "Test User",
            email = "test@example.com",
            password = "hashedPassword",
            points = 1500,
            availablePoints = 1500,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        val updatedUser = originalUser.copy(
            points = 2500,
            availablePoints = 2500
        )

        every { userRepository.findById(userId) } returns Optional.of(originalUser)
        every { userRepository.save(any()) } returns updatedUser
        every { pointHistoryRepository.save(any()) } returns mockk()

        // When
        val result = userService.adjustPoints(userId, PointType.DEPOSIT, amount, reason)

        // Then
        assertEquals(2500, result.points)
        assertEquals(2500, result.availablePoints)
        verify { userRepository.findById(userId) }
        verify { userRepository.save(any()) }
        verify { pointHistoryRepository.save(any()) }
    }

    @Test
    fun `포인트 출금 성공`() {
        // Given
        val userId = 1L
        val amount = 500
        val reason = "상품 구매"

        val originalUser = User(
            id = userId,
            name = "Test User",
            email = "test@example.com",
            password = "hashedPassword",
            points = 1500,
            availablePoints = 1500,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        val updatedUser = originalUser.copy(
            points = 1000,
            availablePoints = 1000
        )

        every { userRepository.findById(userId) } returns Optional.of(originalUser)
        every { userRepository.save(any()) } returns updatedUser
        every { pointHistoryRepository.save(any()) } returns mockk()

        // When
        val result = userService.adjustPoints(userId, PointType.WITHDRAW, amount, reason)

        // Then
        assertEquals(1000, result.points)
        assertEquals(1000, result.availablePoints)
    }

    @Test
    fun `포인트 부족 시 출금 실패`() {
        // Given
        val userId = 1L
        val amount = 2000
        val reason = "상품 구매"

        val user = User(
            id = userId,
            name = "Test User",
            email = "test@example.com",
            password = "hashedPassword",
            points = 1500,
            availablePoints = 1500,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        every { userRepository.findById(userId) } returns Optional.of(user)

        // When & Then
        val exception = assertThrows<BadRequestException> {
            userService.adjustPoints(userId, PointType.WITHDRAW, amount, reason)
        }
        assertEquals("포인트가 부족합니다.", exception.message)
    }

    @Test
    fun `사용자 포인트 내역 조회`() {
        // Given
        val userId = 1L
        val history = listOf(
            PointHistory(
                id = 1L,
                userId = userId,
                type = PointType.DEPOSIT,
                amount = 1000,
                reason = "보너스",
                createdAt = LocalDateTime.now()
            )
        )

        every { pointHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId) } returns history

        // When
        val result = userService.getUserPointHistory(userId)

        // Then
        assertEquals(1, result.size)
        assertEquals(userId, result[0].userId)
        assertEquals(PointType.DEPOSIT, result[0].type)
        assertEquals(1000, result[0].amount)
    }

    @Test
    fun `사용자 삭제 성공`() {
        // Given
        val userIdToDelete = 2L
        val currentUserId = 1L

        every { userRepository.existsById(userIdToDelete) } returns true
        every { userRepository.deleteById(userIdToDelete) } returns Unit

        // When
        userService.deleteUser(userIdToDelete, currentUserId)

        // Then
        verify { userRepository.existsById(userIdToDelete) }
        verify { userRepository.deleteById(userIdToDelete) }
    }

    @Test
    fun `본인 삭제 시 실패`() {
        // Given
        val userId = 1L

        // When & Then
        val exception = assertThrows<BadRequestException> {
            userService.deleteUser(userId, userId)
        }
        assertEquals("자신을 삭제할 수 없습니다.", exception.message)
    }

    @Test
    fun `존재하지 않는 사용자 삭제 시 실패`() {
        // Given
        val userIdToDelete = 999L
        val currentUserId = 1L

        every { userRepository.existsById(userIdToDelete) } returns false

        // When & Then
        val exception = assertThrows<ResourceNotFoundException> {
            userService.deleteUser(userIdToDelete, currentUserId)
        }
        assertEquals("사용자를 찾을 수 없습니다.", exception.message)
    }

    @Test
    fun `전체 회원 수 조회`() {
        // Given
        val totalCount = 10L
        every { userRepository.getTotalMemberCount() } returns totalCount

        // When
        val result = userService.getTotalMemberCount()

        // Then
        assertEquals(totalCount, result)
        verify { userRepository.getTotalMemberCount() }
    }

    @Test
    fun `총 포인트 조회`() {
        // Given
        val totalPoints = 15000L
        every { userRepository.getTotalPoints() } returns totalPoints

        // When
        val result = userService.getTotalPoints()

        // Then
        assertEquals(totalPoints, result)
        verify { userRepository.getTotalPoints() }
    }

    @Test
    fun `총 사용 가능 포인트 조회`() {
        // Given
        val totalAvailablePoints = 12000L
        every { userRepository.getTotalAvailablePoints() } returns totalAvailablePoints

        // When
        val result = userService.getTotalAvailablePoints()

        // Then
        assertEquals(totalAvailablePoints, result)
        verify { userRepository.getTotalAvailablePoints() }
    }
}