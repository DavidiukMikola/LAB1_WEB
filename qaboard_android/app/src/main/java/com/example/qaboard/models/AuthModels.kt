package com.example.qaboard.models

data class LoginResponse(
    val user: User,
    val token: String
)

data class RegisterResponse(
    val user: User,
    val token: String
)
