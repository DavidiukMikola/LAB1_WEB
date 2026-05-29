package com.example.qaboard.models

import com.google.gson.annotations.SerializedName

data class Question(
    val id: Int,
    val title: String,
    val content: String,
    val slug: String,
    @SerializedName("views_count") val viewsCount: Int,
    @SerializedName("answers_count") val answersCount: Int,
    @SerializedName("created_at") val createdAt: String,
    val author: User?
)
