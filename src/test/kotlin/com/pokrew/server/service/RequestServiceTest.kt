package com.pokrew.server.service

import com.pokrew.server.entity.*
import com.pokrew.server.exception.BadRequestException
import com.pokrew.server.exception.ResourceNotFoundException
import com.pokrew.server.repository.RequestRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.LocalDateTime
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class RequestServiceTest {

    private lateinit var requestService: RequestService
    private lateinit var requestRepository: RequestRepository
    private lateinit var userService: UserService
    private lateinit var productService: ProductService

    @BeforeEach
    fun setUp() {
        requestRepository = mockk()
        userService = mockk()
        productService = mockk()
        requestService = RequestService(requestRepository, userService, productService)
    }

    @Test
    fun `전체 요청 목록 조회 성공`() {
        // Given
        val requests = listOf(
            Request(
                id = 1L,
                userId = 1L,
                productId = 1L,
                quantity = 1,
                amount = 1500000,
                pendingAmount = 1500000,
                status = RequestStatus.PENDING,
                createdAt = LocalDateTime.now()
            )
        )

        every { requestRepository.findAllWithDetails() } returns requests

        // When
        val result = requestService.findAll()

        // Then
        assertEquals(1, result.size)
        assertEquals(RequestStatus.PENDING, result[0].status)
        verify { requestRepository.findAllWithDetails() }
    }

    @Test
    fun `대기중인 요청 목록 조회 성공`() {
        // Given
        val pendingRequests = listOf(
            Request(
                id = 1L,
                userId = 1L,
                productId = 1L,
                quantity = 1,
                amount = 1500000,
                pendingAmount = 1500000,
                status = RequestStatus.PENDING,
                createdAt = LocalDateTime.now()
            )
        )

        every { requestRepository.findByStatusOrderByCreatedAtDesc(RequestStatus.PENDING) } returns pendingRequests

        // When
        val result = requestService.findPendingRequests()

        // Then
        assertEquals(1, result.size)
        assertEquals(RequestStatus.PENDING, result[0].status)
        verify { requestRepository.findByStatusOrderByCreatedAtDesc(RequestStatus.PENDING) }
    }

    @Test
    fun `사용자별 요청 목록 조회 성공`() {
        // Given
        val userId = 1L
        val userRequests = listOf(
            Request(
                id = 1L,
                userId = userId,
                productId = 1L,
                quantity = 1,
                amount = 1500000,
                pendingAmount = 1500000,
                status = RequestStatus.PENDING,
                createdAt = LocalDateTime.now()
            )
        )

        every { requestRepository.findByUserIdOrderByCreatedAtDesc(userId) } returns userRequests

        // When
        val result = requestService.findByUserId(userId)

        // Then
        assertEquals(1, result.size)
        assertEquals(userId, result[0].userId)
        verify { requestRepository.findByUserIdOrderByCreatedAtDesc(userId) }
    }

    @Test
    fun `요청 ID로 조회 성공`() {
        // Given
        val requestId = 1L
        val request = Request(
            id = requestId,
            userId = 1L,
            productId = 1L,
            quantity = 1,
            amount = 1500000,
            pendingAmount = 1500000,
            status = RequestStatus.PENDING,
            createdAt = LocalDateTime.now()
        )

        every { requestRepository.findByIdWithDetails(requestId) } returns request

        // When
        val result = requestService.findById(requestId)

        // Then
        assertNotNull(result)
        assertEquals(requestId, result.id)
        verify { requestRepository.findByIdWithDetails(requestId) }
    }

    @Test
    fun `존재하지 않는 요청 조회 시 예외 발생`() {
        // Given
        val requestId = 999L
        every { requestRepository.findByIdWithDetails(requestId) } returns null

        // When & Then
        val exception = assertThrows<ResourceNotFoundException> {
            requestService.findById(requestId)
        }
        assertEquals("요청을 찾을 수 없습니다.", exception.message)
    }

    @Test
    fun `요청 생성 성공`() {
        // Given
        val userId = 1L
        val productId = 1L
        val quantity = 1

        val user = User(
            id = userId,
            name = "Test User",
            email = "test@example.com",
            password = "password",
            points = 2000000,
            availablePoints = 2000000,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        val product = Product(
            id = productId,
            name = "아이폰 15",
            price = 1500000,
            description = "최신 아이폰",
            isActive = true,
            createdAt = LocalDateTime.now()
        )

        val newRequest = Request(
            userId = userId,
            productId = productId,
            quantity = quantity,
            amount = 1500000,
            pendingAmount = 1500000,
            status = RequestStatus.PENDING
        )

        val savedRequest = newRequest.copy(id = 1L)

        every { userService.findById(userId) } returns user
        every { productService.findById(productId) } returns product
        every { userService.save(any()) } returns user.copy(availablePoints = 500000)
        every { requestRepository.save(any()) } returns savedRequest

        // When
        val result = requestService.createRequest(userId, productId, quantity)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        assertEquals(userId, result.userId)
        assertEquals(productId, result.productId)
        assertEquals(1500000, result.amount)
        assertEquals(RequestStatus.PENDING, result.status)
        verify { userService.findById(userId) }
        verify { productService.findById(productId) }
        verify { userService.save(any()) }
        verify { requestRepository.save(any()) }
    }

    @Test
    fun `포인트 부족 시 요청 생성 실패`() {
        // Given
        val userId = 1L
        val productId = 1L
        val quantity = 1

        val user = User(
            id = userId,
            name = "Test User",
            email = "test@example.com",
            password = "password",
            points = 1000000,
            availablePoints = 1000000,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        val product = Product(
            id = productId,
            name = "아이폰 15",
            price = 1500000,
            description = "최신 아이폰",
            isActive = true,
            createdAt = LocalDateTime.now()
        )

        every { userService.findById(userId) } returns user
        every { productService.findById(productId) } returns product

        // When & Then
        val exception = assertThrows<BadRequestException> {
            requestService.createRequest(userId, productId, quantity)
        }
        assertEquals("사용 가능한 포인트가 부족합니다.", exception.message)
    }

    @Test
    fun `요청 승인 성공`() {
        // Given
        val requestId = 1L
        val request = Request(
            id = requestId,
            userId = 1L,
            productId = 1L,
            quantity = 1,
            amount = 1500000,
            pendingAmount = 1500000,
            status = RequestStatus.PENDING,
            createdAt = LocalDateTime.now()
        )

        val user = User(
            id = 1L,
            name = "Test User",
            email = "test@example.com",
            password = "password",
            points = 2000000,
            availablePoints = 500000,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        val approvedRequest = request.copy(
            status = RequestStatus.APPROVED,
            pendingAmount = 0
        )

        every { requestRepository.findByIdWithDetails(requestId) } returns request
        every { userService.findById(1L) } returns user
        every { userService.save(any()) } returns user.copy(points = 500000)
        every { requestRepository.save(any()) } returns approvedRequest

        // When
        val result = requestService.approveRequest(requestId)

        // Then
        assertEquals(RequestStatus.APPROVED, result.status)
        assertEquals(0, result.pendingAmount)
        verify { userService.save(any()) }
        verify { requestRepository.save(any()) }
    }

    @Test
    fun `대기중이 아닌 요청 승인 시 실패`() {
        // Given
        val requestId = 1L
        val request = Request(
            id = requestId,
            userId = 1L,
            productId = 1L,
            quantity = 1,
            amount = 1500000,
            pendingAmount = 0,
            status = RequestStatus.APPROVED,
            createdAt = LocalDateTime.now()
        )

        every { requestRepository.findByIdWithDetails(requestId) } returns request

        // When & Then
        val exception = assertThrows<BadRequestException> {
            requestService.approveRequest(requestId)
        }
        assertEquals("대기중인 요청만 승인할 수 있습니다.", exception.message)
    }

    @Test
    fun `요청 거부 성공`() {
        // Given
        val requestId = 1L
        val request = Request(
            id = requestId,
            userId = 1L,
            productId = 1L,
            quantity = 1,
            amount = 1500000,
            pendingAmount = 1500000,
            status = RequestStatus.PENDING,
            createdAt = LocalDateTime.now()
        )

        val user = User(
            id = 1L,
            name = "Test User",
            email = "test@example.com",
            password = "password",
            points = 2000000,
            availablePoints = 500000,
            isAdmin = false,
            createdAt = LocalDateTime.now()
        )

        val rejectedRequest = request.copy(
            status = RequestStatus.REJECTED,
            pendingAmount = 0
        )

        every { requestRepository.findByIdWithDetails(requestId) } returns request
        every { userService.findById(1L) } returns user
        every { userService.save(any()) } returns user.copy(availablePoints = 2000000)
        every { requestRepository.save(any()) } returns rejectedRequest

        // When
        val result = requestService.rejectRequest(requestId)

        // Then
        assertEquals(RequestStatus.REJECTED, result.status)
        assertEquals(0, result.pendingAmount)
        verify { userService.save(any()) }
        verify { requestRepository.save(any()) }
    }

    @Test
    fun `대기중이 아닌 요청 거부 시 실패`() {
        // Given
        val requestId = 1L
        val request = Request(
            id = requestId,
            userId = 1L,
            productId = 1L,
            quantity = 1,
            amount = 1500000,
            pendingAmount = 0,
            status = RequestStatus.REJECTED,
            createdAt = LocalDateTime.now()
        )

        every { requestRepository.findByIdWithDetails(requestId) } returns request

        // When & Then
        val exception = assertThrows<BadRequestException> {
            requestService.rejectRequest(requestId)
        }
        assertEquals("대기중인 요청만 거부할 수 있습니다.", exception.message)
    }

    @Test
    fun `대기중인 요청 수 조회`() {
        // Given
        val pendingCount = 5L
        every { requestRepository.countByStatus(RequestStatus.PENDING) } returns pendingCount

        // When
        val result = requestService.getPendingRequestCount()

        // Then
        assertEquals(pendingCount, result)
        verify { requestRepository.countByStatus(RequestStatus.PENDING) }
    }
}