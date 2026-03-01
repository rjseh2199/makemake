package com.makemake.coach.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore("settings")

class SettingsStore(private val context: Context) {
    private val apiKey = stringPreferencesKey("api_key")

    val apiKeyFlow: Flow<String> = context.dataStore.data.map { it[apiKey].orEmpty() }

    suspend fun saveApiKey(value: String) {
        context.dataStore.edit { it[apiKey] = value }
    }
}
