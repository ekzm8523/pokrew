package com.pokrew.server.service

import com.pokrew.server.entity.PointHistory
import com.pokrew.server.entity.PointType
import com.pokrew.server.repository.PointHistoryRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class DashboardService(
    private val userService: UserService,
    private val requestService: RequestService,
    private val pointHistoryRepository: PointHistoryRepository
) {
    fun getAdminDashboard(): Map<String, Any> {
        val totalMembers = userService.getTotalMemberCount()
        val totalPoints = userService.getTotalPoints()
        val totalAvailablePoints = userService.getTotalAvailablePoints()
        val totalPendingPoints = totalPoints - totalAvailablePoints
        val pendingRequests = requestService.getPendingRequestCount()
        val recentHistory = getRecentPointHistory()
        val topMembers = getTopMembers()

        return mapOf(
            "totalMembers" to totalMembers,
            "totalPoints" to totalPoints,
            "totalAvailablePoints" to totalAvailablePoints,
            "totalPendingPoints" to totalPendingPoints,
            "totalCurrentPoints" to totalPoints,
            "pendingRequests" to pendingRequests,
            "recentHistory" to recentHistory,
            "topMembers" to topMembers
        )
    }

    fun getUserDashboard(userId: Long): Map<String, Any> {
        val user = userService.findById(userId)
        val history = userService.getUserPointHistory(userId).take(50)

        return mapOf(
            "currentPoints" to user.points,
            "availablePoints" to user.availablePoints,
            "pendingPoints" to user.pendingPoints,
            "points" to user.points,
            "history" to history.map { pointHistory ->
                mapOf(
                    "id" to pointHistory.id,
                    "userId" to pointHistory.userId,
                    "type" to pointHistory.type.koreanName,
                    "amount" to pointHistory.amount,
                    "reason" to (pointHistory.reason ?: ""),
                    "createdAt" to pointHistory.createdAt.toString()
                )
            }
        )
    }

    private fun getRecentPointHistory(): List<Map<String, Any>> {
        return pointHistoryRepository.findTop50ByOrderByCreatedAtDesc()
            .take(50)
            .map { history ->
                mapOf<String, Any>(
                    "id" to history.id,
                    "userId" to history.userId,
                    "type" to history.type.koreanName,
                    "amount" to history.amount,
                    "reason" to (history.reason ?: ""),
                    "createdAt" to history.createdAt.toString(),
                    "userName" to (history.user?.name ?: "알 수 없음")
                )
            }
    }

    private fun getTopMembers(): List<Map<String, Any>> {
        val startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0)
        val users = userService.findAll().take(5)

        return users.mapIndexed { index, user ->
            val totalDeposit = pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(
                user.id, PointType.DEPOSIT, startOfMonth
            ) ?: 0L

            val totalWithdraw = pointHistoryRepository.sumAmountByUserIdAndTypeAfterDate(
                user.id, PointType.WITHDRAW, startOfMonth
            ) ?: 0L

            val tier = when {
                totalDeposit >= 10000 -> "VIP"
                totalDeposit >= 5000 -> "Gold"
                totalDeposit >= 2000 -> "Silver"
                else -> "Bronze"
            }

            mapOf(
                "id" to user.id,
                "name" to user.name,
                "points" to user.points,
                "availablePoints" to user.availablePoints,
                "totalDeposit" to totalDeposit,
                "totalWithdraw" to totalWithdraw,
                "totalPoints" to user.points,
                "rank" to (index + 1),
                "tier" to tier
            )
        }
    }
}