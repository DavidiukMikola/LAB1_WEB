package com.example.qaboard

import android.app.Application
import android.content.Context

class QAApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    companion object {
        lateinit var instance: QAApplication
            private set
            
        fun getContext(): Context = instance.applicationContext
    }
}
