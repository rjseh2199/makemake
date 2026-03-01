package com.makemake.coach.data.security

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class ApiKeyStore(context: Context) {
    private val prefs = EncryptedSharedPreferences.create(
        context,
        FILE_NAME,
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    private val _apiKey = MutableStateFlow(prefs.getString(KEY_API_KEY, "").orEmpty())
    val apiKeyFlow: StateFlow<String> = _apiKey.asStateFlow()

    fun saveApiKey(value: String) {
        prefs.edit().putString(KEY_API_KEY, value).apply()
        _apiKey.value = value
    }

    fun getApiKey(): String = _apiKey.value

    companion object {
        private const val FILE_NAME = "secure_api_keys"
        private const val KEY_API_KEY = "openai_api_key"
    }
}
