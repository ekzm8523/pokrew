package com.pokrew.server.service

import com.pokrew.server.entity.PointHistory
import com.pokrew.server.entity.PointType
import com.pokrew.server.entity.User
import com.pokrew.server.repository.PointHistoryRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDateTime
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class DashboardServiceTest {

    private lateinit var dashboardService: DashboardService
    private lateinit var userService: UserService
    private lateinit var requestService: RequestService
    private lateinit var pointHistoryRepository: PointHistoryRepository

    @BeforeEach
    fun setUp() {
        userService = mockk()
        requestService = mockk()
        pointHistoryRepository = mockk()
        dashboardService = DashboardService(userService, requestService, pointHistoryRepository)
    }

    @Test
    fun `관리자 대시보드 데이터 조회 성공`() {
        // Given
        val totalMembers = 10L
        val totalPoints = 150000L
        val totalAvailablePoints = 120000L
        val pendingRequests = 5L

        val recentHistory = listOf(
            PointHistory(
                id = 1L,
                userId = 1L,
                type = PointType.DEPOSIT,
                amount = 10000,
                reason = "보너스",
                createdAt = LocalDateTime.now(),
                user = User(
                    id = 1L,
                    name = "Test User",
                    email = "test@example.com",
                    password = "password",
                    points = 15000,
                    availablePoints = 15000,
                    isAdmin = false,
                    createdAt = LocalDateTime.now()
                )
            )
        )

        val users = listOf(
            User(
                id = 1L,
                name = "Test User 1",
                email = "test1@example.com",
                password = "password",
                points = 20000,
                availablePoints = 18000,
                isAdmin = false,
                createdAt = LocalDateTime.now()
            )
        )

        every { userService.getTotalMemberCount() } returns totalMembers
        every { userService.getTotalPoints() } returns totalPoints
        every { userService.getTotalAvailablePoints() } returns totalAvailablePoints
        every { requestService.getPendingRequestCount() } returns pendingRequests
        every { pointHistoryRepository.findTop50ByOrderByCreatedAtDesc() } returns recentHistory
        every { userService.findAll() } returns users
        every { pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(any(), any(), any()) } returns 15000L

        // When
        val result = dashboardService.getAdminDashboard()

        // Then
        assertNotNull(result)
        assertEquals(totalMembers, result["totalMembers"])
        assertEquals(totalPoints, result["totalPoints"])
        assertEquals(totalAvailablePoints, result["totalAvailablePoints"])
        assertEquals(30000L, result["totalPendingPoints"])
        assertEquals(pendingRequests, result["pendingRequests"])
        assertTrue(result["recentHistory"] is List<*>)
        assertTrue(result["topMembers"] is List<*>)

        verify { userService.getTotalMemberCount() }
        verify { userService.getTotalPoints() }
        verify { userService.getTotalAvailablePoints() }
        verify { requestService.getPendingRequestCount() }
        verify { pointHistoryRepository.findTop50ByOrderByCreatedAtDesc() }
        verify { userService.findAll() }
    }

    @Test
    fun `사용자 대시보드 데이터 조회 성공`() {
        // Given
        val userId = 1L
        val user = User(
            id = userId,
            name = "Test User",
            email = "test@example.com",
            password = "password",
            points = 20000,
            availablePoints = 18000,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        val pointHistory = listOf(
            PointHistory(
                id = 1L,
                userId = userId,
                type = PointType.DEPOSIT,
                amount = 10000,
                reason = "보너스",
                createdAt = LocalDateTime.now()
            ),
            PointHistory(
                id = 2L,
                userId = userId,
                type = PointType.WITHDRAW,
                amount = 5000,
                reason = "구매",
                createdAt = LocalDateTime.now().minusDays(1)
            )
        )

        every { userService.findById(userId) } returns user
        every { userService.getUserPointHistory(userId) } returns pointHistory

        // When
        val result = dashboardService.getUserDashboard(userId)

        // Then
        assertNotNull(result)
        assertEquals(20000, result["currentPoints"])
        assertEquals(18000, result["availablePoints"])
        assertEquals(2000, result["pendingPoints"])
        assertEquals(20000, result["points"])

        val history = result["history"] as List<*>
        assertEquals(2, history.size)

        val firstHistoryItem = history[0] as Map<*, *>
        assertEquals(1L, firstHistoryItem["id"])
        assertEquals("입금", firstHistoryItem["type"])
        assertEquals(10000, firstHistoryItem["amount"])

        verify { userService.findById(userId) }
        verify { userService.getUserPointHistory(userId) }
    }

    @Test
    fun `최근 포인트 내역 조회 성공`() {
        // Given
        val recentHistory = listOf(
            PointHistory(
                id = 1L,
                userId = 1L,
                type = PointType.DEPOSIT,
                amount = 10000,
                reason = "보너스",
                createdAt = LocalDateTime.now(),
                user = User(
                    id = 1L,
                    name = "Test User",
                    email = "test@example.com",
                    password = "password",
                    points = 15000,
                    availablePoints = 15000,
                    isAdmin = false,
                    createdAt = LocalDateTime.now()
                )
            )
        )

        every { userService.getTotalMemberCount() } returns 10L
        every { userService.getTotalPoints() } returns 150000L
        every { userService.getTotalAvailablePoints() } returns 120000L
        every { requestService.getPendingRequestCount() } returns 5L
        every { pointHistoryRepository.findTop50ByOrderByCreatedAtDesc() } returns recentHistory
        every { userService.findAll() } returns emptyList()

        // When
        val result = dashboardService.getAdminDashboard()

        // Then
        val historyList = result["recentHistory"] as List<*>
        assertEquals(1, historyList.size)

        val historyItem = historyList[0] as Map<*, *>
        assertEquals(1L, historyItem["id"])
        assertEquals(1L, historyItem["userId"])
        assertEquals("입금", historyItem["type"])
        assertEquals(10000, historyItem["amount"])
        assertEquals("보너스", historyItem["reason"])
        assertEquals("Test User", historyItem["userName"])

        verify { pointHistoryRepository.findTop50ByOrderByCreatedAtDesc() }
    }

    @Test
    fun `Top 멤버 리스트 조회 성공`() {
        // Given
        val users = listOf(
            User(
                id = 1L,
                name = "VIP User",
                email = "vip@example.com",
                password = "password",
                points = 50000,
                availablePoints = 45000,
                isAdmin = false,
                createdAt = LocalDateTime.now()
            ),
            User(
                id = 2L,
                name = "Gold User",
                email = "gold@example.com",
                password = "password",
                points = 30000,
                availablePoints = 28000,
                isAdmin = false,
                createdAt = LocalDateTime.now()
            )
        )

        every { userService.getTotalMemberCount() } returns 10L
        every { userService.getTotalPoints() } returns 150000L
        every { userService.getTotalAvailablePoints() } returns 120000L
        every { requestService.getPendingRequestCount() } returns 5L
        every { pointHistoryRepository.findTop50ByOrderByCreatedAtDesc() } returns emptyList()
        every { userService.findAll() } returns users
        every { pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(1L, PointType.DEPOSIT, any()) } returns 12000L
        every { pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(1L, PointType.WITHDRAW, any()) } returns 3000L
        every { pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(2L, PointType.DEPOSIT, any()) } returns 6000L
        every { pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(2L, PointType.WITHDRAW, any()) } returns 2000L

        // When
        val result = dashboardService.getAdminDashboard()

        // Then
        val topMembers = result["topMembers"] as List<*>
        assertEquals(2, topMembers.size)

        val vipMember = topMembers[0] as Map<*, *>
        assertEquals(1L, vipMember["id"])
        assertEquals("VIP User", vipMember["name"])
        assertEquals(50000, vipMember["points"])
        assertEquals(45000, vipMember["availablePoints"])
        assertEquals(12000L, vipMember["totalDeposit"])
        assertEquals(3000L, vipMember["totalWithdraw"])
        assertEquals(1, vipMember["rank"])
        assertEquals("VIP", vipMember["tier"])

        val goldMember = topMembers[1] as Map<*, *>
        assertEquals(2L, goldMember["id"])
        assertEquals("Gold User", goldMember["name"])
        assertEquals(6000L, goldMember["totalDeposit"])
        assertEquals(2, goldMember["rank"])
        assertEquals("Gold", goldMember["tier"])

        verify { userService.findAll() }
        verify { pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(any(), any(), any()) }
    }

    @Test
    fun `티어 분류 로직 테스트`() {
        // Given
        val users = listOf(
            User(id = 1L, name = "Bronze User", email = "bronze@example.com", password = "password", points = 1000, availablePoints = 1000, isAdmin = false, createdAt = LocalDateTime.now()),
            User(id = 2L, name = "Silver User", email = "silver@example.com", password = "password", points = 3000, availablePoints = 3000, isAdmin = false, createdAt = LocalDateTime.now()),
            User(id = 3L, name = "Gold User", email = "gold@example.com", password = "password", points = 6000, availablePoints = 6000, isAdmin = false, createdAt = LocalDateTime.now()),
            User(id = 4L, name = "VIP User", email = "vip@example.com", password = "password", points = 15000, availablePoints = 15000, isAdmin = false, createdAt = LocalDateTime.now())
        )

        every { userService.getTotalMemberCount() } returns 4L
        every { userService.getTotalPoints() } returns 25000L
        every { userService.getTotalAvailablePoints() } returns 25000L
        every { requestService.getPendingRequestCount() } returns 0L
        every { pointHistoryRepository.findTop50ByOrderByCreatedAtDesc() } returns emptyList()
        every { userService.findAll() } returns users

        // 각 사용자의 입금 금액 설정
        every { pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(1L, PointType.DEPOSIT, any()) } returns 1000L // Bronze
        every { pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(2L, PointType.DEPOSIT, any()) } returns 3000L // Silver
        every { pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(3L, PointType.DEPOSIT, any()) } returns 6000L // Gold
        every { pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(4L, PointType.DEPOSIT, any()) } returns 15000L // VIP

        every { pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(any(), PointType.WITHDRAW, any()) } returns 0L

        // When
        val result = dashboardService.getAdminDashboard()

        // Then
        val topMembers = result["topMembers"] as List<*>
        assertEquals(4, topMembers.size)

        val member1 = topMembers[0] as Map<*, *>
        assertEquals("Bronze", member1["tier"])

        val member2 = topMembers[1] as Map<*, *>
        assertEquals("Silver", member2["tier"])

        val member3 = topMembers[2] as Map<*, *>
        assertEquals("Gold", member3["tier"])

        val member4 = topMembers[3] as Map<*, *>
        assertEquals("VIP", member4["tier"])
    }

    @Test
    fun `사용자 포인트 내역이 50개로 제한되는지 테스트`() {
        // Given
        val userId = 1L
        val user = User(
            id = userId,
            name = "Test User",
            email = "test@example.com",
            password = "password",
            points = 100000,
            availablePoints = 90000,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        val longHistory = (1..60).map { index ->
            PointHistory(
                id = index.toLong(),
                userId = userId,
                type = if (index % 2 == 0) PointType.DEPOSIT else PointType.WITHDRAW,
                amount = 1000 * index,
                reason = "Test reason $index",
                createdAt = LocalDateTime.now().minusDays(index.toLong())
            )
        }

        every { userService.findById(userId) } returns user
        every { userService.getUserPointHistory(userId) } returns longHistory

        // When
        val result = dashboardService.getUserDashboard(userId)

        // Then
        val history = result["history"] as List<*>
        assertEquals(50, history.size) // 50개로 제한되어야 함

        verify { userService.getUserPointHistory(userId) }
    }
}