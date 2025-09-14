package com.pokrew.server.service

import com.pokrew.server.entity.Product
import com.pokrew.server.exception.ResourceNotFoundException
import com.pokrew.server.repository.ProductRepository
import org.springframework.stereotype.Service

@Service
class ProductService(
    private val productRepository: ProductRepository
) {
    fun findAll(): List<Product> {
        return productRepository.findAll()
    }

    fun findActiveProducts(): List<Product> {
        return productRepository.findByIsActiveTrue()
    }

    fun findById(id: Long): Product {
        return productRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("상품을 찾을 수 없습니다.") }
    }

    fun save(product: Product): Product {
        return productRepository.save(product)
    }

    fun update(id: Long, updatedProduct: Product): Product {
        val existingProduct = findById(id)
        val productToUpdate = updatedProduct.copy(id = existingProduct.id)
        return productRepository.save(productToUpdate)
    }

    fun deleteById(id: Long) {
        if (!productRepository.existsById(id)) {
            throw ResourceNotFoundException("상품을 찾을 수 없습니다.")
        }
        productRepository.deleteById(id)
    }
}