package com.pokrew.server.repository

import com.pokrew.server.entity.Product
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ProductRepository : JpaRepository<Product, Long> {
    fun findByIsActiveTrue(): List<Product>
}