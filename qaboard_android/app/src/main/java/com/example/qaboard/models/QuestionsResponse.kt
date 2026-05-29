package com.example.qaboard.models

import com.google.gson.annotations.SerializedName

data class QuestionsResponse(
    val count: Int,
    val next: String?,
    val previous: String?,
    @SerializedName("results") val results: List<Question>
)
