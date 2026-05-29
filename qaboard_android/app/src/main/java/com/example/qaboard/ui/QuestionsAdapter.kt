package com.example.qaboard.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.qaboard.R
import com.example.qaboard.models.Question

class QuestionsAdapter(private val questions: List<Question>) :
    RecyclerView.Adapter<QuestionsAdapter.QuestionViewHolder>() {

    class QuestionViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvTitle: TextView = view.findViewById(R.id.tvTitle)
        val tvContent: TextView = view.findViewById(R.id.tvContent)
        val tvAuthor: TextView = view.findViewById(R.id.tvAuthor)
        val tvStats: TextView = view.findViewById(R.id.tvStats)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): QuestionViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_question, parent, false)
        return QuestionViewHolder(view)
    }

    override fun onBindViewHolder(holder: QuestionViewHolder, position: Int) {
        val question = questions[position]
        holder.tvTitle.text = question.title
        holder.tvContent.text = question.content
        holder.tvAuthor.text = question.author?.fullName ?: question.author?.username ?: "Анонім"
        holder.tvStats.text = "${question.answersCount} відповідей • ${question.viewsCount} переглядів"
    }

    override fun getItemCount() = questions.size
}
