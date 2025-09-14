package com.pokrew.server.controller

import com.pokrew.server.dto.UserResponse
import com.pokrew.server.entity.PointType
import com.pokrew.server.security.UserPrincipal
import com.pokrew.server.service.UserService
import mu.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = ["*"])
class UserController(
    private val userService: UserService
) {
    private val logger = KotlinLogging.logger {}

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun getAllUsers(): ResponseEntity<List<UserResponse>> {
        return try {
            val users = userService.findAll().map { user ->
                UserResponse(
                    id = user.id,
                    name = user.name,
                    email = user.email,
                    points = user.points,
                    availablePoints = user.availablePoints,
                    isAdmin = user.isAdmin,
                    createdAt = user.createdAt.toString()
                )
            }
            ResponseEntity.ok(users)
        } catch (ex: Exception) {
            logger.error("Failed to get all users", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun getUserById(@PathVariable id: Long): ResponseEntity<UserResponse> {
        return try {
            val user = userService.findById(id)
            val userResponse = UserResponse(
                id = user.id,
                name = user.name,
                email = user.email,
                points = user.points,
                availablePoints = user.availablePoints,
                isAdmin = user.isAdmin,
                createdAt = user.createdAt.toString()
            )
            ResponseEntity.ok(userResponse)
        } catch (ex: Exception) {
            logger.error("Failed to get user by id: $id", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @PatchMapping("/{id}/points")
    @PreAuthorize("hasRole('ADMIN')")
    fun adjustUserPoints(
        @PathVariable id: Long,
        @RequestBody request: Map<String, Any>
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val type = when (request["type"] as String) {
                "입금" -> PointType.DEPOSIT
                "출금" -> PointType.WITHDRAW
                else -> throw IllegalArgumentException("유효하지 않은 타입입니다.")
            }
            val amount = (request["amount"] as Number).toInt()
            val reason = request["reason"] as String

            val updatedUser = userService.adjustPoints(id, type, amount, reason)

            ResponseEntity.ok(mapOf(
                "message" to "포인트가 성공적으로 조정되었습니다.",
                "newPoints" to updatedUser.points,
                "newAvailablePoints" to updatedUser.availablePoints
            ))
        } catch (ex: Exception) {
            logger.error("Failed to adjust user points for id: $id", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/{id}/history")
    fun getUserHistory(@PathVariable id: Long): ResponseEntity<List<Map<String, Any>>> {
        return try {
            val userPrincipal = SecurityContextHolder.getContext().authentication.principal as UserPrincipal

            // 본인 또는 관리자만 조회 가능
            if (userPrincipal.id != id && !userPrincipal.isAdmin) {
                return ResponseEntity.status(403).build()
            }

            val history: List<Map<String, Any>> = userService.getUserPointHistory(id).map { pointHistory ->
                mapOf(
                    "id" to pointHistory.id,
                    "userId" to pointHistory.userId,
                    "type" to pointHistory.type.koreanName,
                    "amount" to pointHistory.amount,
                    "reason" to (pointHistory.reason ?: ""),
                    "createdAt" to pointHistory.createdAt.toString()
                )
            }
            ResponseEntity.ok(history)
        } catch (ex: Exception) {
            logger.error("Failed to get user history for id: $id", ex)
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteUser(@PathVariable id: Long): ResponseEntity<Map<String, String>> {
        return try {
            val userPrincipal = SecurityContextHolder.getContext().authentication.principal as UserPrincipal
            userService.deleteUser(id, userPrincipal.id)
            ResponseEntity.ok(mapOf("message" to "사용자가 성공적으로 삭제되었습니다."))
        } catch (ex: Exception) {
            logger.error("Failed to delete user with id: $id", ex)
            ResponseEntity.badRequest().build()
        }
    }
}