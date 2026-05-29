package com.example.qaboard.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.qaboard.R
import com.example.qaboard.api.RetrofitClient
import com.example.qaboard.models.RegisterResponse
import com.example.qaboard.utils.TokenManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val etUsername = findViewById<EditText>(R.id.etUsername)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etFirstName = findViewById<EditText>(R.id.etFirstName)
        val etLastName = findViewById<EditText>(R.id.etLastName)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val etPasswordConfirm = findViewById<EditText>(R.id.etPasswordConfirm)
        val btnRegister = findViewById<Button>(R.id.btnRegister)
        val tvToLogin = findViewById<TextView>(R.id.tvToLogin)

        btnRegister.setOnClickListener {
            val data = mapOf(
                "username" to etUsername.text.toString(),
                "email" to etEmail.text.toString(),
                "first_name" to etFirstName.text.toString(),
                "last_name" to etLastName.text.toString(),
                "password" to etPassword.text.toString(),
                "password_confirm" to etPasswordConfirm.text.toString()
            )

            RetrofitClient.instance.register(data).enqueue(object : Callback<RegisterResponse> {
                override fun onResponse(call: Call<RegisterResponse>, response: Response<RegisterResponse>) {
                    if (response.isSuccessful) {
                        val registerResponse = response.body()
                        registerResponse?.token?.let {
                            TokenManager.saveToken(this@RegisterActivity, it)
                        }
                        Toast.makeText(this@RegisterActivity, "Реєстрація успішна!", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@RegisterActivity, MainActivity::class.java))
                        finish()
                    } else {
                        Toast.makeText(this@RegisterActivity, "Помилка реєстрації", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<RegisterResponse>, t: Throwable) {
                    Toast.makeText(this@RegisterActivity, "Помилка: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
        }

        tvToLogin.setOnClickListener {
            finish()
        }
    }
}
