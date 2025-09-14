package com.pokrew.server.controller

import com.pokrew.server.security.UserPrincipal
import com.pokrew.server.service.DashboardService
import mu.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = ["*"])
class DashboardController(
    private val dashboardService: DashboardService
) {
    private val logger = KotlinLogging.logger {}

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    fun getAdminDashboard(): ResponseEntity<Map<String, Any>> {
        return try {
            val dashboard = dashboardService.getAdminDashboard()
            ResponseEntity.ok(dashboard)
        } catch (ex: Exception) {
            logger.error("Failed to get admin dashboard", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/user")
    fun getUserDashboard(): ResponseEntity<Map<String, Any>> {
        return try {
            val userPrincipal = SecurityContextHolder.getContext().authentication.principal as UserPrincipal
            val dashboard = dashboardService.getUserDashboard(userPrincipal.id)
            ResponseEntity.ok(dashboard)
        } catch (ex: Exception) {
            logger.error("Failed to get user dashboard", ex)
            ResponseEntity.badRequest().build()
        }
    }
}