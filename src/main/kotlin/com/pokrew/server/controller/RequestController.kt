package com.pokrew.server.controller

import com.pokrew.server.entity.Request
import com.pokrew.server.security.UserPrincipal
import com.pokrew.server.service.RequestService
import mu.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = ["*"])
class RequestController(
    private val requestService: RequestService
) {
    private val logger = KotlinLogging.logger {}

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun getAllRequests(): ResponseEntity<List<Request>> {
        return try {
            val requests = requestService.findAll()
            ResponseEntity.ok(requests)
        } catch (ex: Exception) {
            logger.error("Failed to get all requests", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    fun getPendingRequests(): ResponseEntity<List<Request>> {
        return try {
            val requests = requestService.findPendingRequests()
            ResponseEntity.ok(requests)
        } catch (ex: Exception) {
            logger.error("Failed to get pending requests", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/my")
    fun getMyRequests(): ResponseEntity<List<Request>> {
        return try {
            val userPrincipal = SecurityContextHolder.getContext().authentication.principal as UserPrincipal
            val requests = requestService.findByUserId(userPrincipal.id)
            ResponseEntity.ok(requests)
        } catch (ex: Exception) {
            logger.error("Failed to get user requests", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping
    fun createRequest(@RequestBody request: Map<String, Any>): ResponseEntity<Request> {
        return try {
            val userPrincipal = SecurityContextHolder.getContext().authentication.principal as UserPrincipal
            val productId = (request["productId"] as Number).toLong()
            val quantity = (request["quantity"] as Number).toInt()

            val createdRequest = requestService.createRequest(userPrincipal.id, productId, quantity)
            ResponseEntity.ok(createdRequest)
        } catch (ex: Exception) {
            logger.error("Failed to create request", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    fun approveRequest(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        return try {
            val approvedRequest = requestService.approveRequest(id)
            ResponseEntity.ok(mapOf(
                "message" to "요청이 승인되었습니다.",
                "request" to approvedRequest
            ))
        } catch (ex: Exception) {
            logger.error("Failed to approve request with id: $id", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    fun rejectRequest(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        return try {
            val rejectedRequest = requestService.rejectRequest(id)
            ResponseEntity.ok(mapOf(
                "message" to "요청이 거부되었습니다.",
                "request" to rejectedRequest
            ))
        } catch (ex: Exception) {
            logger.error("Failed to reject request with id: $id", ex)
            ResponseEntity.badRequest().build()
        }
    }
}