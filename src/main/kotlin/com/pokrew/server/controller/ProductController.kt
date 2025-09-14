package com.pokrew.server.controller

import com.pokrew.server.entity.Product
import com.pokrew.server.service.ProductService
import mu.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = ["*"])
class ProductController(
    private val productService: ProductService
) {
    private val logger = KotlinLogging.logger {}

    @GetMapping
    fun getAllProducts(): ResponseEntity<List<Product>> {
        return try {
            val products = productService.findAll()
            ResponseEntity.ok(products)
        } catch (ex: Exception) {
            logger.error("Failed to get all products", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/active")
    fun getActiveProducts(): ResponseEntity<List<Product>> {
        return try {
            val products = productService.findActiveProducts()
            ResponseEntity.ok(products)
        } catch (ex: Exception) {
            logger.error("Failed to get active products", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/{id}")
    fun getProductById(@PathVariable id: Long): ResponseEntity<Product> {
        return try {
            val product = productService.findById(id)
            ResponseEntity.ok(product)
        } catch (ex: Exception) {
            logger.error("Failed to get product by id: $id", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun createProduct(@RequestBody request: Map<String, Any>): ResponseEntity<Product> {
        return try {
            val product = Product(
                name = request["name"] as String,
                price = (request["price"] as Number).toInt(),
                description = request["description"] as? String,
                link = request["link"] as? String,
                isActive = request["isActive"] as? Boolean ?: true
            )
            val savedProduct = productService.save(product)
            ResponseEntity.ok(savedProduct)
        } catch (ex: Exception) {
            logger.error("Failed to create product", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun updateProduct(
        @PathVariable id: Long,
        @RequestBody request: Map<String, Any>
    ): ResponseEntity<Product> {
        return try {
            val updatedProduct = Product(
                name = request["name"] as String,
                price = (request["price"] as Number).toInt(),
                description = request["description"] as? String,
                link = request["link"] as? String,
                isActive = request["isActive"] as? Boolean ?: true
            )
            val savedProduct = productService.update(id, updatedProduct)
            ResponseEntity.ok(savedProduct)
        } catch (ex: Exception) {
            logger.error("Failed to update product with id: $id", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteProduct(@PathVariable id: Long): ResponseEntity<Map<String, String>> {
        return try {
            productService.deleteById(id)
            ResponseEntity.ok(mapOf("message" to "상품이 성공적으로 삭제되었습니다."))
        } catch (ex: Exception) {
            logger.error("Failed to delete product with id: $id", ex)
            ResponseEntity.badRequest().build()
        }
    }
}