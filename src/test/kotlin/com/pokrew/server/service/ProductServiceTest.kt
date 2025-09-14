package com.pokrew.server.service

import com.pokrew.server.entity.Product
import com.pokrew.server.exception.ResourceNotFoundException
import com.pokrew.server.repository.ProductRepository
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

class ProductServiceTest {

    private lateinit var productService: ProductService
    private lateinit var productRepository: ProductRepository

    @BeforeEach
    fun setUp() {
        productRepository = mockk()
        productService = ProductService(productRepository)
    }

    @Test
    fun `전체 상품 목록 조회 성공`() {
        // Given
        val products = listOf(
            Product(
                id = 1L,
                name = "아이폰 15",
                price = 1500000,
                description = "최신 아이폰",
                link = "https://example.com/iphone15",
                isActive = true,
                createdAt = LocalDateTime.now()
            ),
            Product(
                id = 2L,
                name = "갤럭시 S24",
                price = 1200000,
                description = "최신 갤럭시",
                link = "https://example.com/galaxy",
                isActive = true,
                createdAt = LocalDateTime.now()
            )
        )

        every { productRepository.findAll() } returns products

        // When
        val result = productService.findAll()

        // Then
        assertEquals(2, result.size)
        assertEquals("아이폰 15", result[0].name)
        assertEquals("갤럭시 S24", result[1].name)
        verify { productRepository.findAll() }
    }

    @Test
    fun `활성 상품 목록 조회 성공`() {
        // Given
        val activeProducts = listOf(
            Product(
                id = 1L,
                name = "아이폰 15",
                price = 1500000,
                description = "최신 아이폰",
                link = "https://example.com/iphone15",
                isActive = true,
                createdAt = LocalDateTime.now()
            )
        )

        every { productRepository.findByIsActiveTrue() } returns activeProducts

        // When
        val result = productService.findActiveProducts()

        // Then
        assertEquals(1, result.size)
        assertEquals("아이폰 15", result[0].name)
        assertEquals(true, result[0].isActive)
        verify { productRepository.findByIsActiveTrue() }
    }

    @Test
    fun `상품 ID로 조회 성공`() {
        // Given
        val productId = 1L
        val product = Product(
            id = productId,
            name = "아이폰 15",
            price = 1500000,
            description = "최신 아이폰",
            link = "https://example.com/iphone15",
            isActive = true,
            createdAt = LocalDateTime.now()
        )

        every { productRepository.findById(productId) } returns Optional.of(product)

        // When
        val result = productService.findById(productId)

        // Then
        assertNotNull(result)
        assertEquals(productId, result.id)
        assertEquals("아이폰 15", result.name)
        verify { productRepository.findById(productId) }
    }

    @Test
    fun `존재하지 않는 상품 조회 시 예외 발생`() {
        // Given
        val productId = 999L
        every { productRepository.findById(productId) } returns Optional.empty()

        // When & Then
        val exception = assertThrows<ResourceNotFoundException> {
            productService.findById(productId)
        }
        assertEquals("상품을 찾을 수 없습니다.", exception.message)
    }

    @Test
    fun `상품 저장 성공`() {
        // Given
        val newProduct = Product(
            name = "맥북 프로",
            price = 2500000,
            description = "최신 맥북",
            link = "https://example.com/macbook",
            isActive = true
        )

        val savedProduct = newProduct.copy(id = 1L)

        every { productRepository.save(newProduct) } returns savedProduct

        // When
        val result = productService.save(newProduct)

        // Then
        assertNotNull(result)
        assertEquals(1L, result.id)
        assertEquals("맥북 프로", result.name)
        verify { productRepository.save(newProduct) }
    }

    @Test
    fun `상품 업데이트 성공`() {
        // Given
        val productId = 1L
        val existingProduct = Product(
            id = productId,
            name = "아이폰 15",
            price = 1500000,
            description = "최신 아이폰",
            link = "https://example.com/iphone15",
            isActive = true,
            createdAt = LocalDateTime.now()
        )

        val updatedProduct = Product(
            name = "아이폰 15 Pro",
            price = 1800000,
            description = "최신 프로 아이폰",
            link = "https://example.com/iphone15pro",
            isActive = true
        )

        val expectedUpdatedProduct = updatedProduct.copy(id = productId)

        every { productRepository.findById(productId) } returns Optional.of(existingProduct)
        every { productRepository.save(expectedUpdatedProduct) } returns expectedUpdatedProduct

        // When
        val result = productService.update(productId, updatedProduct)

        // Then
        assertEquals(productId, result.id)
        assertEquals("아이폰 15 Pro", result.name)
        assertEquals(1800000, result.price)
        verify { productRepository.findById(productId) }
        verify { productRepository.save(expectedUpdatedProduct) }
    }

    @Test
    fun `존재하지 않는 상품 업데이트 시 예외 발생`() {
        // Given
        val productId = 999L
        val updatedProduct = Product(
            name = "존재하지 않는 상품",
            price = 100000,
            isActive = true
        )

        every { productRepository.findById(productId) } returns Optional.empty()

        // When & Then
        val exception = assertThrows<ResourceNotFoundException> {
            productService.update(productId, updatedProduct)
        }
        assertEquals("상품을 찾을 수 없습니다.", exception.message)
    }

    @Test
    fun `상품 삭제 성공`() {
        // Given
        val productId = 1L

        every { productRepository.existsById(productId) } returns true
        every { productRepository.deleteById(productId) } returns Unit

        // When
        productService.deleteById(productId)

        // Then
        verify { productRepository.existsById(productId) }
        verify { productRepository.deleteById(productId) }
    }

    @Test
    fun `존재하지 않는 상품 삭제 시 예외 발생`() {
        // Given
        val productId = 999L

        every { productRepository.existsById(productId) } returns false

        // When & Then
        val exception = assertThrows<ResourceNotFoundException> {
            productService.deleteById(productId)
        }
        assertEquals("상품을 찾을 수 없습니다.", exception.message)
        verify { productRepository.existsById(productId) }
    }
}