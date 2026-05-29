package com.example.qaboard.api

import com.example.qaboard.models.*
import retrofit2.Call
import retrofit2.http.*

interface ApiService {
    @POST("api/auth/login/")
    fun login(@Body data: Map<String, String>): Call<LoginResponse>

    @POST("api/auth/register/")
    fun register(@Body data: Map<String, String>): Call<RegisterResponse>

    // Використовуємо стандартний шлях Django API зі слешем
    @GET("api/questions/")
    fun getQuestions(): Call<QuestionsResponse>

    @GET("api/questions/{slug}/")
    fun getQuestionDetail(@Path("slug") slug: String): Call<Question>
}
