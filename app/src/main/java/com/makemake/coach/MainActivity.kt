package com.makemake.coach

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.makemake.coach.data.CoachRepository
import com.makemake.coach.data.local.AppDatabase
import com.makemake.coach.data.local.MessageEntity
import com.makemake.coach.data.local.SessionEntity
import com.makemake.coach.data.provider.OpenAIProvider
import com.makemake.coach.data.security.ApiKeyStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val level: Float = 5f,
    val mode: String = "MIXED",
    val active: SessionEntity? = null,
)

data class ClarifyPanelUiState(
    val msgId: String,
    val content: String,
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                val db = AppDatabase.get(applicationContext)
                val vm: AppViewModel = viewModel(factory = AppViewModel.factory(db, applicationContext))
                AppNav(vm)
            }
        }
    }
}

class AppViewModel(
    private val repository: CoachRepository,
    private val apiKeyStore: ApiKeyStore,
) : ViewModel() {
    private val _home = MutableStateFlow(HomeUiState())
    val home: StateFlow<HomeUiState> = _home.asStateFlow()

    private val _sessionId = MutableStateFlow<String?>(null)
    val sessionId: StateFlow<String?> = _sessionId.asStateFlow()

    private val _apiKey = MutableStateFlow("")
    val apiKey: StateFlow<String> = _apiKey.asStateFlow()

    private val _clarifyPanel = MutableStateFlow<ClarifyPanelUiState?>(null)
    val clarifyPanel: StateFlow<ClarifyPanelUiState?> = _clarifyPanel.asStateFlow()

    private val _sessions = MutableStateFlow<List<SessionEntity>>(emptyList())
    val sessions: StateFlow<List<SessionEntity>> = _sessions.asStateFlow()

    private var easierTurnsRemaining = 0
    private var deeperTurnsRemaining = 0

    init {
        viewModelScope.launch {
            repository.observeLatestActiveSession().collect { s ->
                _home.value = _home.value.copy(active = s)
                if (_sessionId.value == null) _sessionId.value = s?.session_id
            }
        }
        viewModelScope.launch {
            repository.observeSessions().collect { _sessions.value = it }
        }
        viewModelScope.launch {
            apiKeyStore.apiKeyFlow.collect { _apiKey.value = it }
        }
    }

    fun setLevel(value: Float) {
        _home.value = _home.value.copy(level = value)
    }

    fun setMode(mode: String) {
        _home.value = _home.value.copy(mode = mode)
    }

    fun openSession(sessionId: String) {
        _sessionId.value = sessionId
    }

    fun resume() {
        _sessionId.value = _home.value.active?.session_id
    }

    suspend fun start(topic: String, context: String?, goal: String?): String {
        val id = repository.startSession(
            level = _home.value.level.toInt(),
            mode = _home.value.mode,
            topic = topic,
            context = context,
            goal = goal,
        )
        _sessionId.value = id
        _clarifyPanel.value = null
        return id
    }

    fun messagesFlow() = _sessionId.value?.let { repository.observeMessages(it) }
    fun feedbackFlow() = _sessionId.value?.let { repository.observeFeedback(it) }

    suspend fun send(text: String, assistedBy: String? = null) {
        val current = _sessionId.value ?: return
        val result = repository.sendMessage(
            sessionId = current,
            content = text,
            assistedBy = assistedBy,
            easierTurns = easierTurnsRemaining,
            deeperTurns = deeperTurnsRemaining,
        )
        _sessionId.value = result.sessionIdToContinue
        if (easierTurnsRemaining > 0) easierTurnsRemaining -= 1
        if (deeperTurnsRemaining > 0) deeperTurnsRemaining -= 1
    }

    fun easier() {
        easierTurnsRemaining = 3
    }

    fun deeper() {
        deeperTurnsRemaining = 3
    }

    suspend fun clarify() {
        val current = _sessionId.value ?: return
        val result = repository.clarifyLastAiMessage(current) ?: return
        _clarifyPanel.value = ClarifyPanelUiState(msgId = result.msgId, content = result.content)
    }

    suspend fun endFeedback() {
        _sessionId.value?.let { repository.endAndCreateFeedback(it) }
    }

    suspend fun saveApiKey(v: String) {
        apiKeyStore.saveApiKey(v)
    }

    suspend fun testConnection(inputKey: String): Result<Unit> {
        return repository.testConnection(inputKey)
    }

    companion object {
        fun factory(db: AppDatabase, context: android.content.Context) = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val apiKeyStore = ApiKeyStore(context)
                return AppViewModel(
                    repository = CoachRepository(
                        dao = db.dao(),
                        provider = OpenAIProvider(apiKeyProvider = { apiKeyStore.getApiKey() }),
                    ),
                    apiKeyStore = apiKeyStore,
                ) as T
            }
        }
    }
}

@Composable
fun AppNav(vm: AppViewModel) {
    val nav = rememberNavController()
    NavHost(navController = nav, startDestination = "home") {
        composable("home") { HomeScreen(nav, vm) }
        composable("settings") { SettingsScreen(nav, vm) }
        composable("topic") { TopicSetupScreen(nav, vm) }
        composable("chat") { ChatScreen(nav, vm) }
        composable("feedback") { FeedbackScreen(nav, vm) }
        composable("history") { HistoryScreen(nav, vm) }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(nav: NavHostController, vm: AppViewModel) {
    val state by vm.home.collectAsState()
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Home") },
                actions = { TextButton(onClick = { nav.navigate("settings") }) { Text("Settings") } },
            )
        }
    ) { p ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(p)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("Level: ${state.level.toInt()}")
            Slider(value = state.level, onValueChange = vm::setLevel, valueRange = 1f..10f)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("BUSINESS", "DEBATE", "MIXED").forEach { mode ->
                    Button(onClick = { vm.setMode(mode) }) { Text(mode) }
                }
            }
            Button(onClick = { nav.navigate("topic") }) { Text("Start Session") }
            if (state.active != null) {
                Button(onClick = { vm.resume(); nav.navigate("chat") }) { Text("Resume last session") }
            }
            Button(onClick = { nav.navigate("history") }) { Text("History / Library") }
        }
    }
}

@Composable
fun SettingsScreen(nav: NavHostController, vm: AppViewModel) {
    val scope = rememberCoroutineScope()
    var key by remember { mutableStateOf("") }
    var testResult by remember { mutableStateOf<String?>(null) }
    val apiKey by vm.apiKey.collectAsState()

    LaunchedEffect(apiKey) {
        if (key.isBlank()) key = apiKey
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Provider: OPENAI")
        Text("Model: DEFAULT_MODEL")
        OutlinedTextField(value = key, onValueChange = { key = it }, label = { Text("API Key") })
        Button(onClick = { scope.launch { vm.saveApiKey(key) } }) { Text("Save") }
        Button(onClick = {
            scope.launch {
                testResult = vm.testConnection(key).fold(
                    onSuccess = { "Connection OK" },
                    onFailure = { "Connection failed: ${it.message}" },
                )
            }
        }) { Text("Test Connection") }
        Text(testResult ?: "")
        Button(onClick = { nav.popBackStack() }) { Text("Back") }
    }
}

@Composable
fun TopicSetupScreen(nav: NavHostController, vm: AppViewModel) {
    val scope = rememberCoroutineScope()
    var topic by remember { mutableStateOf("") }
    var context by remember { mutableStateOf("") }
    var goal by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        OutlinedTextField(value = topic, onValueChange = { topic = it }, label = { Text("Topic") })
        OutlinedTextField(value = context, onValueChange = { context = it }, label = { Text("Context") })
        OutlinedTextField(value = goal, onValueChange = { goal = it }, label = { Text("Goal") })
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { topic = "Business negotiation" }) { Text("Business") }
            Button(onClick = { topic = "AI ethics debate" }) { Text("Debate") }
        }
        Button(onClick = {
            scope.launch {
                if (topic.isNotBlank()) {
                    vm.start(topic, context.ifBlank { null }, goal.ifBlank { null })
                    nav.navigate("chat")
                }
            }
        }) { Text("Begin Chat") }
    }
}

@Composable
fun ChatScreen(nav: NavHostController, vm: AppViewModel) {
    val scope = rememberCoroutineScope()
    var input by remember { mutableStateOf("") }
    var assistedByOptions by remember { mutableStateOf(false) }
    var showOptions by remember { mutableStateOf(false) }
    val clarifyPanel by vm.clarifyPanel.collectAsState()

    val flow = vm.messagesFlow()
    val messages by (flow?.collectAsState(initial = emptyList()) ?: remember { mutableStateOf(emptyList()) })

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text("Chat", fontWeight = FontWeight.Bold)

        LazyColumn(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            items(messages) { msg ->
                MessageCard(
                    msg = msg,
                    clarifyContent = if (clarifyPanel?.msgId == msg.msg_id) clarifyPanel?.content else null,
                )
            }
        }

        OutlinedTextField(
            value = input,
            onValueChange = { input = it },
            label = { Text("Message") },
            modifier = Modifier.fillMaxWidth(),
        )

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { vm.easier() }) { Text("Easier") }
            Button(onClick = { vm.deeper() }) { Text("Deeper") }
            Button(onClick = { scope.launch { vm.clarify() } }) { Text("Clarify") }
            Button(onClick = { showOptions = true }) { Text("Options") }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = {
                scope.launch {
                    if (input.isNotBlank()) {
                        vm.send(input, assistedBy = if (assistedByOptions) "OPTIONS" else null)
                        input = ""
                        assistedByOptions = false
                    }
                }
            }) { Text("Send") }
            Button(onClick = {
                scope.launch {
                    vm.endFeedback()
                    nav.navigate("feedback")
                }
            }) { Text("End & Feedback") }
        }
    }

    if (showOptions) {
        ModalBottomSheet(onDismissRequest = { showOptions = false }) {
            listOf(
                "Soft" to "I see your point, and I'd add...",
                "Neutral" to "My view is that...",
                "Firm" to "I disagree because...",
            ).forEach { (label, text) ->
                Button(
                    onClick = {
                        input = text
                        assistedByOptions = true
                        showOptions = false
                    },
                    modifier = Modifier.padding(8.dp),
                ) { Text("$label: $text") }
            }
        }
    }
}

@Composable
fun MessageCard(msg: MessageEntity, clarifyContent: String?) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(10.dp)) {
            Text(msg.role.uppercase(), fontWeight = FontWeight.Bold)
            Text(msg.content)
            if (msg.assisted_by == "OPTIONS") Text("assisted_by=OPTIONS")
            if (!clarifyContent.isNullOrBlank()) {
                Card(Modifier.fillMaxWidth().padding(top = 6.dp)) {
                    Column(Modifier.padding(8.dp)) {
                        Text("Clarify", fontWeight = FontWeight.Bold)
                        Text(clarifyContent)
                    }
                }
            }
        }
    }
}

@Composable
fun FeedbackScreen(nav: NavHostController, vm: AppViewModel) {
    val feedbackFlow = vm.feedbackFlow()
    val feedback by (feedbackFlow?.collectAsState(initial = null) ?: remember { mutableStateOf(null) })

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text("Feedback", fontWeight = FontWeight.Bold)
        Text("Best phrases: ${feedback?.best_phrases_json ?: "-"}")
        Text("Issues: ${feedback?.issues_json ?: "-"}")
        Text("Next objective: ${feedback?.next_objective ?: "-"}")
        Text("Mini drill: ${feedback?.drill_json ?: "-"}")
        Button(onClick = { nav.navigate("home") }) { Text("Home") }
    }
}

@Composable
fun HistoryScreen(nav: NavHostController, vm: AppViewModel) {
    val sessions by vm.sessions.collectAsState()
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text("History / Library", fontWeight = FontWeight.Bold)
        LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            items(sessions) { session ->
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            if (session.status == "ACTIVE") "In progress" else "Completed",
                            fontWeight = FontWeight.Bold,
                        )
                        Text("Topic: ${session.topic}")
                        Text("Mode: ${session.mode} / Level: ${session.level}")
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = {
                                vm.openSession(session.session_id)
                                nav.navigate("chat")
                            }) { Text("Open") }
                            if (session.status == "COMPLETED") {
                                Button(onClick = {
                                    vm.openSession(session.session_id)
                                    nav.navigate("feedback")
                                }) { Text("Feedback") }
                            }
                        }
                    }
                }
            }
        }
        Button(onClick = { nav.popBackStack() }) { Text("Back") }
    }
}
