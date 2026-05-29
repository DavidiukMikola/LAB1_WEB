package com.example.qaboard.api

import com.example.qaboard.QAApplication
import com.example.qaboard.utils.TokenManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // Тільки порт 8000, як у вашому терміналі!
    private const val BASE_URL = "http://192.168.1.5:8000/"

    val instance: ApiService by lazy {
        val logging = HttpLoggingInterceptor()
        logging.setLevel(HttpLoggingInterceptor.Level.BODY)
        
        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .addInterceptor { chain ->
                val original = chain.request()
                val token = TokenManager.getToken(QAApplication.getContext())
                
                val requestBuilder = original.newBuilder()
                if (token != null) {
                    requestBuilder.header("Authorization", "Token $token")
                }
                
                chain.proceed(requestBuilder.build())
            }
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .client(client)
            .build()

        retrofit.create(ApiService::class.java)
    }
}
