package com.example.qaboard.ui

import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.qaboard.R
import com.example.qaboard.api.RetrofitClient
import com.example.qaboard.models.QuestionsResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity() {

    private lateinit var rvQuestions: RecyclerView
    private lateinit var tvEmptyState: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val toolbar = findViewById<Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.title = "Q&A Board"

        rvQuestions = findViewById(R.id.rvQuestions)
        tvEmptyState = findViewById(R.id.tvEmptyState)
        rvQuestions.layoutManager = LinearLayoutManager(this)

        showState("Завантаження питань...")
        fetchQuestions()
    }

    private fun fetchQuestions() {
        RetrofitClient.instance.getQuestions().enqueue(object : Callback<QuestionsResponse> {
            override fun onResponse(
                call: Call<QuestionsResponse>,
                response: Response<QuestionsResponse>
            ) {
                if (response.isSuccessful) {
                    val questions = response.body()?.results.orEmpty()
                    if (questions.isEmpty()) {
                        showState("Список питань порожній", "Додай кілька питань у базу або через API.")
                    } else {
                        tvEmptyState.visibility = View.GONE
                        rvQuestions.visibility = View.VISIBLE
                        rvQuestions.adapter = QuestionsAdapter(questions)
                    }
                } else {
                    val code = response.code()
                    val error = response.errorBody()?.string() ?: "Невідома помилка"
                    showState("Помилка $code", error)
                }
            }

            override fun onFailure(call: Call<QuestionsResponse>, t: Throwable) {
                showState("Мережева помилка", t.message ?: "Не вдалося завантажити питання")
            }
        })
    }

    private fun showState(title: String, message: String? = null) {
        rvQuestions.visibility = View.GONE
        tvEmptyState.visibility = View.VISIBLE
        tvEmptyState.text = if (message.isNullOrBlank()) {
            title
        } else {
            "$title\n$message"
        }
    }
}
